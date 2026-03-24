/**
 * Cloudflare Worker — Blueprint App
 *
 *   GET  /entries  → fetch all blueprints from D1
 *   POST /submit   → save to D1 + send email via Microsoft Graph API
 *
 * Bindings:
 *   env.db             — D1 database
 *
 * Secret bindings (set at deploy time):
 *   MS_TENANT_ID       — Azure AD Tenant ID
 *   MS_CLIENT_ID       — Azure App Registration Client ID
 *   MS_CLIENT_SECRET   — Azure App Registration Client Secret
 *   EMAIL_FROM         — Sender mailbox (must have Mail.Send permission)
 *   EMAIL_TO           — Recipient address
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/entries' && request.method === 'GET') {
      return handleEntries(env);
    }

    if (url.pathname === '/submit' && request.method === 'POST') {
      return handleSubmit(request, env);
    }

    // Static files are served by Cloudflare before this worker runs.
    // Any unrecognised route returns 404.
    return new Response('Not found', { status: 404 });
  },
};

// ── Schema migration (runs on every cold start, safe to repeat) ───────────────
async function ensureSchema(db) {
  // Create base table if missing
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS blueprints (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name        TEXT    NOT NULL,
      application_purpose TEXT    NOT NULL,
      description         TEXT    NOT NULL,
      submitted_at        TEXT    NOT NULL
    )
  `).run();

  // Add attachment columns — each ALTER is wrapped individually so one
  // "duplicate column" error never blocks the others.
  for (const col of [
    'ALTER TABLE blueprints ADD COLUMN attachment_name TEXT',
    'ALTER TABLE blueprints ADD COLUMN attachment_mime TEXT',
    'ALTER TABLE blueprints ADD COLUMN attachment_data TEXT',
  ]) {
    try {
      await db.prepare(col).run();
    } catch (e) {
      if (!e.message.toLowerCase().includes('duplicate column')) throw e;
    }
  }
}

// ── GET /entries ──────────────────────────────────────────────────────────────
async function handleEntries(env) {
  try {
    if (!env.db) {
      return jsonRes({ success: false, error: 'D1 binding "db" not found. Check Cloudflare dashboard → Workers → Settings → D1 database bindings.' }, 503);
    }

    await ensureSchema(env.db);

    const { results } = await env.db.prepare(
      `SELECT id, company_name, application_purpose, description, submitted_at,
              attachment_name, attachment_mime, attachment_data
       FROM blueprints ORDER BY id DESC`
    ).all();

    return jsonRes({ success: true, entries: results || [] });
  } catch (err) {
    return jsonRes({ success: false, error: err.message }, 500);
  }
}

// ── POST /submit ──────────────────────────────────────────────────────────────
async function handleSubmit(request, env) {
  try {
    if (!env.db) {
      return jsonRes({ success: false, error: 'D1 binding "db" not found. Check Cloudflare dashboard → Workers → Settings → D1 database bindings.' }, 503);
    }

    await ensureSchema(env.db);

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonRes({ success: false, error: 'Invalid JSON body.' }, 400);
    }

    const { applicationPurpose, description, companyName,
            attachmentName, attachmentData, attachmentMime } = body;

    if (!applicationPurpose || !description || !companyName) {
      return jsonRes({ success: false, error: 'All fields are required.' }, 400);
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });

    const hasAttachment = !!(attachmentName && attachmentData);

    // 1. Save to D1
    let newEntry;
    try {
      const result = await env.db.prepare(
        `INSERT INTO blueprints
           (company_name, application_purpose, description, submitted_at,
            attachment_name, attachment_mime, attachment_data)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        companyName, applicationPurpose, description, submittedAt,
        hasAttachment ? attachmentName : null,
        hasAttachment ? (attachmentMime || 'application/octet-stream') : null,
        hasAttachment ? attachmentData : null,
      ).run();

      newEntry = {
        id:                  result.meta.last_row_id,
        company_name:        companyName,
        application_purpose: applicationPurpose,
        description,
        submitted_at:        submittedAt,
        attachment_name:     hasAttachment ? attachmentName : null,
        attachment_mime:     hasAttachment ? attachmentMime : null,
        attachment_data:     hasAttachment ? attachmentData : null,
      };
    } catch (err) {
      return jsonRes({ success: false, error: 'Database error: ' + err.message }, 500);
    }

    // 2. Send email via Microsoft Graph API
    let emailWarning;
    try {
      await sendViaMicrosoftGraph(newEntry, env);
    } catch (err) {
      emailWarning = err.message;
      console.error('[submit] email error:', err.message);
    }

    return jsonRes({
      success: true,
      entry: newEntry,
      ...(emailWarning && { emailWarning }),
    });

  } catch (err) {
    return jsonRes({ success: false, error: 'Unexpected error: ' + err.message }, 500);
  }
}

// ── Microsoft Graph API email ─────────────────────────────────────────────────
async function sendViaMicrosoftGraph(entry, env) {
  const { MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, EMAIL_FROM, EMAIL_TO } = env;

  if (!MS_TENANT_ID || !MS_CLIENT_ID || !MS_CLIENT_SECRET || !EMAIL_FROM || !EMAIL_TO) {
    throw new Error('Microsoft Graph email env vars not fully configured.');
  }

  // Step 1 — Get OAuth2 access token via client credentials flow
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'client_credentials',
        client_id:     MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        scope:         'https://graph.microsoft.com/.default',
      }),
    }
  );

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Azure token error (HTTP ${tokenRes.status}): ${err.slice(0, 200)}`);
  }

  const { access_token } = await tokenRes.json();

  // Step 2 — Send email via Microsoft Graph
  const mailRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${EMAIL_FROM}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `New Blueprint Submission — ${entry.company_name}`,
          body: {
            contentType: 'HTML',
            content: buildEmailHtml({
              companyName:        entry.company_name,
              applicationPurpose: entry.application_purpose,
              description:        entry.description,
              submittedAt:        entry.submitted_at,
              id:                 entry.id,
              attachmentName:     entry.attachment_name || null,
            }),
          },
          toRecipients: [{ emailAddress: { address: EMAIL_TO } }],
          from:          { emailAddress: { address: EMAIL_FROM } },
          // Attach file if present
          ...(entry.attachment_name && entry.attachment_data && {
            attachments: [{
              '@odata.type':  '#microsoft.graph.fileAttachment',
              name:           entry.attachment_name,
              contentType:    entry.attachment_mime || 'application/octet-stream',
              contentBytes:   entry.attachment_data,
            }],
          }),
        },
        saveToSentItems: true,
      }),
    }
  );

  if (!mailRes.ok) {
    const err = await mailRes.text();
    throw new Error(`Graph API error (HTTP ${mailRes.status}): ${err.slice(0, 300)}`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildEmailHtml({ companyName, applicationPurpose, description, submittedAt, id, attachmentName }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0d1b2a;color:#1e90ff;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:20px;">&#128196; New Blueprint Submission</h2>
      </div>
      <div style="border:1px solid #d0d7de;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tbody>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;width:160px;color:#57606a;border-bottom:1px solid #d0d7de;">Record #</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;">${id}</td>
            </tr>
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#57606a;border-bottom:1px solid #d0d7de;">Company Name</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;">${escapeHtml(companyName)}</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;color:#57606a;border-bottom:1px solid #d0d7de;">App Purpose</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;">${escapeHtml(applicationPurpose)}</td>
            </tr>
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#57606a;border-bottom:1px solid #d0d7de;vertical-align:top;">Description</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;white-space:pre-wrap;">${escapeHtml(description)}</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;color:#57606a;border-bottom:1px solid #d0d7de;">Submitted At</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;">${submittedAt}</td>
            </tr>
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#57606a;">Attachment</th>
              <td style="padding:12px 16px;">${attachmentName
                ? `&#128206; ${escapeHtml(attachmentName)} <em style="color:#8c949e;font-size:12px;">(see attached)</em>`
                : '<em style="color:#8c949e;">None</em>'}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="color:#8c949e;font-size:12px;text-align:center;margin-top:16px;">Sent by Blueprint App</p>
    </div>`;
}

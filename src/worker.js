/**
 * Cloudflare Worker — Blueprint App
 *
 * With run_worker_first: false in wrangler.jsonc, Cloudflare serves
 * static files from public/ BEFORE invoking this worker.
 * The worker is only called for routes that have no matching static file:
 *
 *   GET  /entries  → fetch all blueprints from D1
 *   POST /submit   → save to D1 + send email via Resend
 *
 * Bindings (configured in wrangler.jsonc / Cloudflare dashboard):
 *   env.db             — D1 database
 *
 * Environment variables (Cloudflare dashboard → Worker → Settings):
 *   RESEND_API_KEY     — Resend API key
 *   EMAIL_FROM         — Verified sender address
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

// ── GET /entries ──────────────────────────────────────────────────────────────
async function handleEntries(env) {
  try {
    if (!env.db) {
      return jsonRes({ success: false, error: 'D1 binding "db" not found. Check Cloudflare dashboard → Workers → Settings → D1 database bindings.' }, 503);
    }

    const { results } = await env.db.prepare(
      `SELECT id, company_name, application_purpose, description, submitted_at
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

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonRes({ success: false, error: 'Invalid JSON body.' }, 400);
    }

    const { applicationPurpose, description, companyName } = body;

    if (!applicationPurpose || !description || !companyName) {
      return jsonRes({ success: false, error: 'All fields are required.' }, 400);
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });

    // 1. Save to D1
    let newEntry;
    try {
      const result = await env.db.prepare(
        `INSERT INTO blueprints (company_name, application_purpose, description, submitted_at)
         VALUES (?, ?, ?, ?)`
      ).bind(companyName, applicationPurpose, description, submittedAt).run();

      newEntry = {
        id:                  result.meta.last_row_id,
        company_name:        companyName,
        application_purpose: applicationPurpose,
        description,
        submitted_at:        submittedAt,
      };
    } catch (err) {
      return jsonRes({ success: false, error: 'Database error: ' + err.message }, 500);
    }

    // 2. Send email via Resend
    let emailWarning;
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.EMAIL_TO) {
      emailWarning = 'Email skipped — RESEND_API_KEY / EMAIL_FROM / EMAIL_TO not configured.';
    } else {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization:  `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    env.EMAIL_FROM,
            to:      env.EMAIL_TO,
            subject: `New Blueprint Submission — ${companyName}`,
            text:    `Record #${newEntry.id}\nCompany: ${companyName}\nPurpose: ${applicationPurpose}\nDescription: ${description}\nSubmitted: ${submittedAt}`,
            html:    buildEmailHtml({ companyName, applicationPurpose, description, submittedAt, id: newEntry.id }),
          }),
        });

        if (!emailRes.ok) {
          const e = await emailRes.json().catch(() => ({}));
          emailWarning = e.message || `Resend HTTP ${emailRes.status}`;
        }
      } catch (err) {
        emailWarning = err.message;
      }
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

function buildEmailHtml({ companyName, applicationPurpose, description, submittedAt, id }) {
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
              <th style="padding:12px 16px;text-align:left;color:#57606a;">Submitted At</th>
              <td style="padding:12px 16px;">${submittedAt}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="color:#8c949e;font-size:12px;text-align:center;margin-top:16px;">Sent by Blueprint App</p>
    </div>`;
}

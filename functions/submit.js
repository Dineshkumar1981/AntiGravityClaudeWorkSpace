/**
 * POST /submit
 * Saves a blueprint to D1 then sends an email via Resend.
 *
 * Required bindings (Cloudflare Pages → Settings → Functions):
 *   DB             — D1 database binding
 *
 * Required env vars (Cloudflare Pages → Settings → Environment Variables):
 *   RESEND_API_KEY — Resend API key
 *   EMAIL_FROM     — Verified sender address  e.g. noreply@yourdomain.com
 *   EMAIL_TO       — Recipient address
 */
export async function onRequest(context) {
  const { request, env } = context;

  // Top-level safety net — always return JSON, never an empty body
  try {

    if (request.method !== 'POST') {
      return Response.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
    }

    // Guard: DB binding missing
    if (!env.DB) {
      return Response.json(
        { success: false, error: 'D1 database binding "DB" is not configured. Add it in Cloudflare Pages → Settings → Functions → D1 database bindings.' },
        { status: 503 }
      );
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { applicationPurpose, description, companyName } = body;

    if (!applicationPurpose || !description || !companyName) {
      return Response.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });

    // ── 1. Save to D1 ───────────────────────────────────────────────────────
    let newEntry;
    try {
      const result = await env.DB.prepare(
        `INSERT INTO blueprints (company_name, application_purpose, description, submitted_at)
         VALUES (?, ?, ?, ?)`
      )
        .bind(companyName, applicationPurpose, description, submittedAt)
        .run();

      newEntry = {
        id:                  result.meta.last_row_id,
        company_name:        companyName,
        application_purpose: applicationPurpose,
        description,
        submitted_at:        submittedAt,
      };
    } catch (err) {
      console.error('[submit] DB insert error:', err.message);
      return Response.json(
        { success: false, error: 'Database error: ' + err.message },
        { status: 500 }
      );
    }

    // ── 2. Send email via Resend ─────────────────────────────────────────────
    let emailWarning;
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM || !env.EMAIL_TO) {
      emailWarning = 'Email env vars (RESEND_API_KEY / EMAIL_FROM / EMAIL_TO) not configured.';
      console.warn('[submit]', emailWarning);
    } else {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method:  'POST',
          headers: {
            Authorization:  `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from:    env.EMAIL_FROM,
            to:      env.EMAIL_TO,
            subject: `New Blueprint Submission — ${companyName}`,
            text:    `New Blueprint Submission\n\nRecord #: ${newEntry.id}\nCompany Name: ${companyName}\nApplication Purpose: ${applicationPurpose}\nDescription: ${description}\nSubmitted At: ${submittedAt}`,
            html:    buildEmailHtml({ companyName, applicationPurpose, description, submittedAt, id: newEntry.id }),
          }),
        });

        if (!emailRes.ok) {
          const errData = await emailRes.json().catch(() => ({}));
          emailWarning = errData.message || `Resend returned HTTP ${emailRes.status}`;
          console.error('[submit] email error:', emailWarning);
        }
      } catch (err) {
        emailWarning = err.message;
        console.error('[submit] email fetch error:', err.message);
      }
    }

    return Response.json({
      success: true,
      entry: newEntry,
      ...(emailWarning && { emailWarning }),
    });

  } catch (err) {
    // Catch-all — ensures we never return an empty body
    console.error('[submit] unexpected error:', err.message);
    return Response.json(
      { success: false, error: 'Unexpected server error: ' + err.message },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailHtml({ companyName, applicationPurpose, description, submittedAt, id }) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#0d1b2a;color:#1e90ff;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;font-size:20px;letter-spacing:1px;">&#128196; New Blueprint Submission</h2>
      </div>
      <div style="border:1px solid #d0d7de;border-top:none;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tbody>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;width:180px;color:#57606a;font-weight:600;border-bottom:1px solid #d0d7de;">Record #</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;color:#24292f;">${id}</td>
            </tr>
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#57606a;font-weight:600;border-bottom:1px solid #d0d7de;">Company Name</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;color:#24292f;">${escapeHtml(companyName)}</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;color:#57606a;font-weight:600;border-bottom:1px solid #d0d7de;">Application Purpose</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;color:#24292f;">${escapeHtml(applicationPurpose)}</td>
            </tr>
            <tr>
              <th style="padding:12px 16px;text-align:left;color:#57606a;font-weight:600;border-bottom:1px solid #d0d7de;vertical-align:top;">Description</th>
              <td style="padding:12px 16px;border-bottom:1px solid #d0d7de;color:#24292f;white-space:pre-wrap;">${escapeHtml(description)}</td>
            </tr>
            <tr style="background:#f6f8fa;">
              <th style="padding:12px 16px;text-align:left;color:#57606a;font-weight:600;">Submitted At</th>
              <td style="padding:12px 16px;color:#24292f;">${submittedAt}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="color:#8c949e;font-size:12px;text-align:center;margin-top:16px;">Sent by Blueprint App</p>
    </div>
  `;
}

/**
 * GET /entries
 * Returns all blueprint submissions from D1, newest first.
 */
export async function onRequest(context) {
  const { env } = context;

  // Top-level safety net — always return JSON, never an empty body
  try {

    // Guard: DB binding missing (not configured in Pages dashboard)
    if (!env.DB) {
      return Response.json(
        { success: false, error: 'D1 database binding "DB" is not configured. Add it in Cloudflare Pages → Settings → Functions → D1 database bindings.' },
        { status: 503 }
      );
    }

    const { results } = await env.DB.prepare(
      `SELECT id, company_name, application_purpose, description, submitted_at
       FROM blueprints
       ORDER BY id DESC`
    ).all();

    return Response.json({ success: true, entries: results || [] });

  } catch (err) {
    console.error('[entries] unexpected error:', err.message);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

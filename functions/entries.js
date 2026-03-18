/**
 * GET /entries
 * Returns all blueprint submissions from D1, newest first.
 */
export async function onRequest(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, company_name, application_purpose, description, submitted_at
       FROM blueprints
       ORDER BY id DESC`
    ).all();

    return Response.json({ success: true, entries: results || [] });
  } catch (err) {
    console.error('DB read error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}

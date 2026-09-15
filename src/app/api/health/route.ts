/**
 * Liveness probe for Thoughtful.
 *
 * Deliberately database-independent: the app currently has no database in
 * its runtime architecture, so the health check must not import or
 * initialize any database client (this import chain previously caused
 * "DATABASE_URL is required" failures during production builds).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true });
}

/**
 * Cheap protection for the paid AI endpoints. The counter lives in one
 * function instance's memory, so it only slows a single client down; put a
 * shared limiter (Vercel firewall rule, Arcjet) in front before wide launch.
 */
const WINDOW_MS = 10 * 60 * 1000;

/** A full test sends nine answers; this leaves room for a retake. */
export const REQUESTS_PER_WINDOW = 30;

const hits = new Map<string, number[]>();

export function allowRequest(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= REQUESTS_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

/** Browsers always send Origin on a cross-site POST; anything else is not our page. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

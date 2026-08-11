import { markFoucReady } from "$lib/fouc/gate";

/** Escape JSON for an inline `<script type="application/json">` (avoid `</script>` breakouts). */
export function escapeJsonForInlineScript(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

/** Read and parse the boot payload element. `null` if missing or invalid JSON. */
export function readFoucBootPayload<T>(dataId: string): T | null {
  const dataEl = document.getElementById(dataId);
  if (!dataEl) return null;

  try {
    return JSON.parse(dataEl.textContent || "{}") as T;
  } catch {
    return null;
  }
}

/**
 * Run pre-paint work, always mark ready afterward (success or failure).
 * Keeps hydrate surfaces from staying `visibility: hidden` forever.
 */
export function runFoucBoot(readyAttr: string, paint: () => void): void {
  try {
    paint();
  } finally {
    markFoucReady(readyAttr);
  }
}

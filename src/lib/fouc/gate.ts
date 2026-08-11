/**
 * FOUC gate: hide `[data-{hydrate}]` until `data-{ready}` is set on `<html>`.
 * Only applies when `html.js` is present (theme boot already ran).
 */

export interface FoucGateAttrs {
  /** Dataset key without `data-` prefix, e.g. `lessons-ready`. */
  readyAttr: string;
  /** Dataset key without `data-` prefix, e.g. `lessons-hydrate`. */
  hydrateAttr: string;
}

export interface FoucSurface extends FoucGateAttrs {
  /** Inline JSON payload element id, e.g. `lessons-boot-data`. */
  dataId: string;
}

/** Derive ready / hydrate / data ids from a short namespace (`lessons` → `lessons-ready`, …). */
export function defineFoucSurface(namespace: string): FoucSurface {
  return {
    readyAttr: `${namespace}-ready`,
    hydrateAttr: `${namespace}-hydrate`,
    dataId: `${namespace}-boot-data`,
  };
}

/** Inline CSS for a blocking boot shell. */
export function foucHideUntilReadyStyle({
  readyAttr,
  hydrateAttr,
}: FoucGateAttrs): string {
  return `html.js:not([data-${readyAttr}]) [data-${hydrateAttr}]{visibility:hidden}`;
}

export function markFoucReady(readyAttr: string): void {
  document.documentElement.setAttribute(`data-${readyAttr}`, "1");
}

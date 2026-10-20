/**
 * Moves the test overlay to <body>. Rendered in place it would sit inside the
 * page's sticky aside, whose stacking context keeps it under the site header.
 */
export function portal(node: HTMLElement): { destroy: () => void } {
  document.body.appendChild(node);
  return { destroy: () => node.remove() };
}

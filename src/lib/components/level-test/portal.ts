/**
 * Moves the test overlay to <body>. Rendered in place it would sit inside the
 * page's sticky aside, whose stacking context keeps it under the site header.
 *
 * While it is open the rest of the page is inert, so focus and screen readers
 * stay in the overlay that aria-modal promises.
 */
export function portal(node: HTMLElement): { destroy: () => void } {
  document.body.appendChild(node);
  const behind = [...document.body.children].filter(
    (element): element is HTMLElement =>
      element !== node && element instanceof HTMLElement && !element.inert,
  );
  for (const element of behind) element.inert = true;

  return {
    destroy: () => {
      for (const element of behind) element.inert = false;
      node.remove();
    },
  };
}

/**
 * Accent tools such as PowerToys Quick Accent replace a held letter by
 * sending Backspace and the accented letter. The letter boxes have already
 * moved on to the next box by then, so that Backspace belongs to the box the
 * letter was typed into, not to the box it lands in.
 *
 * Shared by every letter gap on the page, since the last box of one gap
 * moves on to the first box of the next.
 */
export interface TypedAdvance<Box> {
  /** A letter typed into `from` moved the focus to `to`. */
  moved: (from: Box, to: Box | null) => void;
  /** Any other key, click or edit: the next Backspace is an ordinary one. */
  forget: () => void;
  /** The box a Backspace pressed in `box` should clear instead, if any. */
  backspaceTarget: (box: Box) => Box | null;
}

export function createTypedAdvance<Box>(): TypedAdvance<Box> {
  let last: { from: Box; to: Box } | null = null;

  return {
    moved(from, to) {
      last = to !== null && to !== from ? { from, to } : null;
    },
    forget() {
      last = null;
    },
    backspaceTarget(box) {
      const target = last?.to === box ? last.from : null;
      last = null;
      return target;
    },
  };
}

export const typedAdvance = createTypedAdvance<HTMLInputElement>();

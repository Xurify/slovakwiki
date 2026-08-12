/**
 * Map bare number keys to 0-based choice indexes (Digit1 / "1" → 0).
 * Shared by story say-gates and any numbered ChoiceOptions UI.
 */

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== "object") return false;

  const el = target as { isContentEditable?: boolean; tagName?: string };
  if (el.isContentEditable) return true;

  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * Returns a 0-based index for Digit1–9 / "1"–"9", or null if this key should
 * not select a choice (modifiers, editable focus, non-digit).
 */
export function choiceIndexFromKeyboardEvent(event: KeyboardEvent): number | null {
  if (event.metaKey || event.ctrlKey || event.altKey) return null;
  if (isEditableTarget(event.target)) return null;

  const fromCode = /^Digit([1-9])$/.exec(event.code);
  if (fromCode) {
    return Number(fromCode[1]) - 1;
  }

  const fromKey = /^[1-9]$/.exec(event.key);
  if (fromKey) {
    return Number(fromKey[0]) - 1;
  }

  return null;
}

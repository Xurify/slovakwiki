import { describe, expect, it } from "vitest";

import { choiceIndexFromKeyboardEvent } from "./choice-keys";

function keyEvent(
  partial: Partial<KeyboardEvent> & Pick<KeyboardEvent, "key" | "code">,
): KeyboardEvent {
  return {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    target: null,
    ...partial,
  } as KeyboardEvent;
}

describe("choiceIndexFromKeyboardEvent", () => {
  it("maps Digit1–3 and 1–3 to 0-based indexes", () => {
    expect(choiceIndexFromKeyboardEvent(keyEvent({ key: "1", code: "Digit1" }))).toBe(0);
    expect(choiceIndexFromKeyboardEvent(keyEvent({ key: "2", code: "Digit2" }))).toBe(1);
    expect(choiceIndexFromKeyboardEvent(keyEvent({ key: "3", code: "Digit3" }))).toBe(2);
  });

  it("ignores modifiers", () => {
    expect(
      choiceIndexFromKeyboardEvent(keyEvent({ key: "1", code: "Digit1", ctrlKey: true })),
    ).toBeNull();
    expect(
      choiceIndexFromKeyboardEvent(keyEvent({ key: "1", code: "Digit1", metaKey: true })),
    ).toBeNull();
    expect(
      choiceIndexFromKeyboardEvent(keyEvent({ key: "1", code: "Digit1", altKey: true })),
    ).toBeNull();
  });

  it("ignores editable targets", () => {
    const input = { isContentEditable: false, tagName: "INPUT" } as HTMLElement;
    expect(
      choiceIndexFromKeyboardEvent(keyEvent({ key: "1", code: "Digit1", target: input })),
    ).toBeNull();
  });

  it("ignores non-digit keys", () => {
    expect(
      choiceIndexFromKeyboardEvent(keyEvent({ key: "Enter", code: "Enter" })),
    ).toBeNull();
    expect(choiceIndexFromKeyboardEvent(keyEvent({ key: "a", code: "KeyA" }))).toBeNull();
  });
});

import { formatClockFaceLabel } from "$lib/learning/time/clock";

import type { ClockQ1Choice, ClockQ1Clock, ClockQ1View } from "./clock-q1-view";

const TILE_CLASS =
  "press-key min-h-11 shrink-0 cursor-pointer rounded-(--control-radius) px-3.5 py-2 font-serif text-base font-semibold text-blue-800";

const TEXT_CHOICE_CLASS =
  "press-key min-h-14 w-full cursor-pointer rounded-(--control-radius) px-4 py-3.5 text-left font-serif text-base font-semibold";

const CLOCK_CHOICE_CLASS =
  "press-key grid min-h-14 w-full cursor-pointer justify-items-center gap-2 rounded-(--frame-radius) px-3 py-4 text-center font-serif text-sm font-semibold";

function qs(root: ParentNode, selector: string): HTMLElement | null {
  return root.querySelector(selector);
}

function clockFaceSvg(clock: ClockQ1Clock, size: number): string {
  const faceHour = ((Math.trunc(clock.hour) % 12) + 12) % 12 || 12;
  const faceMinute = Math.max(0, Math.min(59, Math.trunc(clock.minute)));
  const minuteAngle = faceMinute * 6;
  const hourAngle = faceHour * 30 + faceMinute * 0.5;
  const label = formatClockFaceLabel(clock);

  const ticks = Array.from({ length: 60 }, (_, index) => {
    const hour = index % 5 === 0;
    return `<line x1="50" y1="${hour ? 5.2 : 5.5}" x2="50" y2="${hour ? 11.2 : 8.4}" stroke="currentColor" stroke-width="${hour ? 1.55 : 0.7}" stroke-linecap="butt" opacity="${hour ? 0.88 : 0.38}" transform="rotate(${index * 6} 50 50)"/>`;
  }).join("");

  const numerals = Array.from({ length: 12 }, (_, index) => {
    const value = index === 0 ? 12 : index;
    const rad = (index * 30 * Math.PI) / 180;
    return `<text x="${50 + 31.5 * Math.sin(rad)}" y="${50 - 31.5 * Math.cos(rad)}" text-anchor="middle" dominant-baseline="central" fill="currentColor" font-size="${value >= 10 ? 8 : 8.75}" font-weight="600" font-family="ui-sans-serif, system-ui, sans-serif">${value}</text>`;
  }).join("");

  return `<svg class="block shrink-0 text-slate-900" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="${label}"><circle cx="50" cy="50" r="47" fill="var(--surface, #fafcfd)" stroke="currentColor" stroke-width="1.6"/>${ticks}${numerals}<g transform="translate(50 50)"><g style="transform:rotate(${hourAngle}deg)"><line x1="0" y1="0" x2="0" y2="-16" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"/></g><g style="transform:rotate(${minuteAngle}deg)"><line x1="0" y1="0" x2="0" y2="-26" stroke="var(--accent, #1f6b8f)" stroke-width="2.15" stroke-linecap="round"/></g></g><circle cx="50" cy="50" r="3.4" fill="var(--surface, #fafcfd)"/><circle cx="50" cy="50" r="2.4" fill="var(--accent, #1f6b8f)"/></svg>`;
}

function paintScene(root: ParentNode, view: ClockQ1View): void {
  const host = qs(root, "[data-clock-q1-scene]");
  const template = root.querySelector<HTMLTemplateElement>(
    "[data-clock-q1-scene-template]",
  );
  if (!host) return;

  host.replaceChildren();
  host.hidden = view.scene.length === 0;
  if (!template || view.scene.length === 0) return;

  for (const line of view.scene) {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const sk = clone.querySelector("[data-clock-q1-scene-sk]");
    const en = clone.querySelector("[data-clock-q1-scene-en]");
    if (sk) sk.textContent = line.slovak;
    if (en) {
      en.textContent = line.english;
      (en as HTMLElement).hidden = !line.english;
    }
    host.append(clone);
  }
}

function paintTiles(root: ParentNode, tiles: string[] | null): void {
  const host = qs(root, "[data-clock-q1-tiles]");
  if (!host) return;
  host.hidden = !tiles;
  host.replaceChildren();
  if (!tiles) return;

  const tray = document.createElement("div");
  tray.className = "relative min-h-[4.75rem] border-b-2 border-slate-200 pb-3";

  const hint = document.createElement("p");
  hint.className =
    "pointer-events-none absolute inset-x-0 top-0 m-0 px-1 py-3 font-serif text-sm font-semibold text-slate-500";
  hint.textContent = "Tap words below to build the sentence.";
  tray.append(hint);

  const bank = document.createElement("div");
  bank.className = "mt-5 flex flex-wrap gap-2";
  bank.setAttribute("role", "list");
  bank.setAttribute("aria-label", "Word bank");

  for (const tile of tiles) {
    const button = document.createElement("button");
    button.className = TILE_CLASS;
    button.type = "button";
    button.setAttribute("aria-disabled", "true");
    button.tabIndex = -1;
    const label = document.createElement("span");
    label.lang = "sk";
    label.textContent = tile;
    button.append(label);
    bank.append(button);
  }

  host.className = "mt-6 grid gap-5";
  host.append(tray, bank);
}

function paintChoice(choice: ClockQ1Choice, style: "text" | "clock"): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-disabled", "true");
  button.tabIndex = -1;
  button.className = style === "clock" ? CLOCK_CHOICE_CLASS : TEXT_CHOICE_CLASS;

  if (choice.clock) {
    button.insertAdjacentHTML("beforeend", clockFaceSvg(choice.clock, 88));
  }

  if (choice.label) {
    const span = document.createElement("span");
    span.lang = "sk";
    span.textContent = choice.label;
    button.append(span);
  }

  return button;
}

function paintChoices(root: ParentNode, view: ClockQ1View): void {
  const host = qs(root, "[data-clock-q1-choices]");
  if (!host) return;
  host.hidden = !view.choices;
  host.replaceChildren();
  if (!view.choices) return;

  host.className =
    view.choiceStyle === "clock"
      ? "mt-6 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3"
      : "mt-6 grid gap-2.5";

  for (const choice of view.choices) {
    host.append(paintChoice(choice, view.choiceStyle));
  }
}

function paintHint(root: ParentNode, chip: string | null): void {
  const host = qs(root, "[data-clock-q1-hint]");
  const label = qs(root, "[data-clock-q1-hint-chip]");
  if (!host) return;
  host.hidden = !chip;
  if (label) label.textContent = chip ?? "";
}

/** Apply a clock Q1 view to the boot markup. Idempotent. */
export function applyClockQ1View(view: ClockQ1View, root: ParentNode = document): void {
  const boot = root.querySelector("[data-clock-q1-boot]") ?? root;
  const kicker = qs(boot, "[data-clock-q1-kicker]");
  const promptSk = qs(boot, "[data-clock-q1-prompt-sk]");
  const prompt = qs(boot, "[data-clock-q1-prompt]");
  const promptClock = qs(boot, "[data-clock-q1-prompt-clock]");
  const typed = qs(boot, "[data-clock-q1-typed]");
  const source = qs(boot, "[data-clock-q1-source-label]");
  const sourceWrap = qs(boot, "[data-clock-q1-source]");
  const sourceLink = boot.querySelector<HTMLAnchorElement>("[data-clock-q1-source-href]");

  if (kicker) {
    kicker.textContent = view.kicker ?? "";
    kicker.hidden = !view.kicker;
  }

  paintScene(boot, view);

  if (promptSk) {
    promptSk.textContent = view.promptSk ?? "";
    promptSk.hidden = !view.promptSk;
  }

  if (prompt) {
    prompt.textContent = view.prompt;
    const extra = view.promptSk ? "mt-1.5 " : view.scene.length > 0 ? "mt-5 " : "";
    prompt.className = `${extra}m-0 font-serif text-[clamp(1.1rem,2.5vw,1.35rem)] font-semibold leading-snug text-pretty text-slate-900`;
    if (view.promptLang === "sk") prompt.lang = "sk";
    else prompt.removeAttribute("lang");
  }

  if (promptClock) {
    promptClock.hidden = !view.promptClock;
    promptClock.replaceChildren();
    if (view.promptClock) {
      promptClock.insertAdjacentHTML("beforeend", clockFaceSvg(view.promptClock, 120));
    }
  }

  paintTiles(boot, view.tiles);
  paintChoices(boot, view);
  paintHint(boot, view.hintChip);

  if (typed) typed.hidden = !view.typed;

  if (sourceWrap) sourceWrap.hidden = !view.sourceHref;
  if (source) source.textContent = view.sourceLabel;
  if (sourceLink && view.sourceHref) sourceLink.href = view.sourceHref;
}

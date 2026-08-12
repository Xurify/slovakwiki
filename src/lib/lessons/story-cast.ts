/** Client-safe cast styling for the lesson story stage (no node:crypto). */

export type StoryCastId =
  | "alex"
  | "anna"
  | "guide"
  | "lucia"
  | "marek"
  | "maria"
  | "narrator"
  | "receptionist"
  | "waiter";

export type StoryCastSide = "other" | "you" | "narrator";

export interface StoryCastStyle {
  /** Soft fill behind the avatar. */
  fillClass: string;
  /** Accent stroke / hair / clothing. */
  inkClass: string;
  /** Secondary accent. */
  accentClass: string;
  id: StoryCastId;
  side: StoryCastSide;
}

const styles: Record<StoryCastId, Omit<StoryCastStyle, "id" | "side">> = {
  alex: {
    fillClass: "fill-emerald-50",
    inkClass: "fill-emerald-700",
    accentClass: "fill-blue-600",
  },
  anna: {
    fillClass: "fill-blue-50",
    inkClass: "fill-blue-800",
    accentClass: "fill-rose-500",
  },
  guide: {
    fillClass: "fill-slate-100",
    inkClass: "fill-slate-700",
    accentClass: "fill-blue-600",
  },
  lucia: {
    fillClass: "fill-blue-50",
    inkClass: "fill-blue-700",
    accentClass: "fill-emerald-600",
  },
  marek: {
    fillClass: "fill-slate-100",
    inkClass: "fill-slate-800",
    accentClass: "fill-blue-600",
  },
  maria: {
    fillClass: "fill-rose-50",
    inkClass: "fill-slate-800",
    accentClass: "fill-rose-600",
  },
  narrator: {
    fillClass: "fill-slate-100",
    inkClass: "fill-slate-600",
    accentClass: "fill-slate-500",
  },
  receptionist: {
    fillClass: "fill-blue-50",
    inkClass: "fill-blue-900",
    accentClass: "fill-blue-600",
  },
  waiter: {
    fillClass: "fill-emerald-50",
    inkClass: "fill-slate-800",
    accentClass: "fill-emerald-600",
  },
};

/** Keep in sync with `content/audio/config.json` speaker labels. */
const speakerToId: Record<string, StoryCastId> = {
  Anna: "anna",
  You: "alex",
  Mária: "maria",
  Receptionist: "receptionist",
  Waiter: "waiter",
  Notice: "narrator",
  Sentence: "narrator",
  Narrator: "narrator",
};

export function storyCastForSpeaker(speaker: string): StoryCastStyle {
  const id = speakerToId[speaker] ?? "narrator";
  const side: StoryCastSide =
    speaker === "You" ? "you" : id === "narrator" ? "narrator" : "other";

  return {
    id,
    side,
    ...styles[id],
  };
}

export function isLearnerSpeaker(speaker: string): boolean {
  return speaker === "You";
}

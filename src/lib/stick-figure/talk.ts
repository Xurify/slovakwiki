import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { DialogueSayChoices } from "$lib/learning/types";
import type { StickGestureId } from "./gestures";
import type { TimeOfDay } from "./scene-mood";
import type { StageSetting } from "./stage-setting";

/**
 * A conversation that branches on what Alex says: each node is what the
 * other person says, then Alex's turn. Every reply that fits leads on, and
 * different ones can lead to different places ("Som unavený" gets a
 * coffee offered; "Mám sa dobre" goes straight to the weekend). A reply
 * that does not fit is answered in character, and Alex tries again.
 */

/** How the one spoken to takes a line that does not fit. */
export type TalkReaction = Extract<StickGestureId, "puzzle" | "laugh" | "frown">;

export interface Said {
  english: string;
  slovak: string;
}

export interface TalkReply<L = Said> {
  line: L;
  /** Where the talk goes when Alex says this. A reply without it, and without `miss`, ends the talk. */
  next?: string;
  /** Does not fit here: why, how the other person takes it, and what they say to it. */
  miss?: { answer?: L; reaction: TalkReaction; why: string };
}

export interface TalkNode<L = Said> {
  id: string;
  /** What the other person says first; empty when Alex opens. */
  says: L[];
  /** Alex's turn after it; none, and the talk is over. */
  replies?: TalkReply<L>[];
}

export interface Talk<L = Said> {
  id: string;
  /** Before it starts: the time of day, who comes, and who they are to Alex. */
  intro: Said;
  /** A line from it, its name in the list of scenes. */
  name: string;
  nodes: TalkNode<L>[];
  setting: StageSetting;
  time: TimeOfDay;
  /** What it is about, in English, under its name in the list. */
  topic: string;
  who: LessonCharacterId;
}

export function fits<L>(reply: TalkReply<L>): boolean {
  return !reply.miss;
}

/** The reply a node takes when Alex has picked none: the first that fits. */
export function defaultReply<L>(node: TalkNode<L>): number {
  return Math.max(0, node.replies?.findIndex(fits) ?? 0);
}

export interface WalkedTalk<L> {
  lines: L[];
  /** Alex's turns: the line index each one sits at, and the node it answers. */
  turns: Map<number, TalkNode<L>>;
}

/**
 * The talk as one run of lines, along the replies picked so far and, past
 * them, the first reply that fits. A pick only changes what comes after
 * it, so the lines already played keep their places.
 */
export function walkTalk<L>(
  nodes: readonly TalkNode<L>[],
  picks: Readonly<Record<string, number>> = {},
): WalkedTalk<L> {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const lines: L[] = [];
  const turns = new Map<number, TalkNode<L>>();
  const seen = new Set<string>();
  let node: TalkNode<L> | undefined = nodes[0];

  while (node && !seen.has(node.id)) {
    seen.add(node.id);
    lines.push(...node.says);
    if (!node.replies?.length) break;

    const reply: TalkReply<L> = node.replies[picks[node.id] ?? defaultReply(node)];
    turns.set(lines.length, node);
    lines.push(reply.line);
    node = reply.next ? byId.get(reply.next) : undefined;
  }

  return { lines, turns };
}

/** Alex's turn as the pick-the-line exercise takes it: every reply, any that fits right. */
export function replyChoices<L extends { slovak: string }>(
  node: TalkNode<L>,
): DialogueSayChoices {
  const replies = node.replies ?? [];
  return {
    answerIds: replies.flatMap((reply, index) => (fits(reply) ? [String(index)] : [])),
    choices: replies.map((reply, index) => ({
      id: String(index),
      label: reply.line.slovak,
      whyWrong: reply.miss?.why,
    })),
  };
}

/** Each node's lines and replies given clip ids: the other person's, Alex's, and their answers to slips. */
export function withLineIds(
  talk: Talk,
  alexId: (slovak: string) => string,
): Talk<Said & { id: string }> {
  return {
    ...talk,
    nodes: talk.nodes.map((node) => ({
      ...node,
      says: node.says.map((line, index) => ({
        ...line,
        id: `${talk.id}/${node.id}/${index}`,
      })),
      replies: node.replies?.map((reply, index) => ({
        ...reply,
        line: { ...reply.line, id: alexId(reply.line.slovak) },
        miss: reply.miss && {
          ...reply.miss,
          answer: reply.miss.answer && {
            ...reply.miss.answer,
            id: `${talk.id}/${node.id}/miss-${index}`,
          },
        },
      })),
    })),
  };
}

import type { PlannedTask, ScoringCapabilities, StepKind, TestSection } from "./types";

export type TaskKind = Exclude<StepKind, "planned"> | PlannedTask;

/** How a task is scored: drives the tags on the intro page and the planned notes. */
export type TaskScoring = "adaptive" | "interactive" | "ai" | "speech" | "planned";

export interface TaskInfo {
  label: string;
  description: string;
  section: TestSection;
  scoring: TaskScoring;
}

export const TASK_INFO: Record<TaskKind, TaskInfo> = {
  readSelect: {
    label: "Read and Select",
    description: "Decide whether each word is real Slovak or made up.",
    section: "adaptive",
    scoring: "adaptive",
  },
  listenSelect: {
    label: "Listen and Select",
    description: "Hear six words and tick the real ones.",
    section: "adaptive",
    scoring: "adaptive",
  },
  listenLength: {
    label: "Short or Long",
    description:
      "Hear six words and pick the one you heard: mala or malá, dobre or dobré.",
    section: "adaptive",
    scoring: "adaptive",
  },
  fillBlank: {
    label: "Fill in the Blanks",
    description: "Finish one word in a sentence.",
    section: "adaptive",
    scoring: "adaptive",
  },
  readComplete: {
    label: "Read and Complete",
    description: "Restore the missing letters across a short text.",
    section: "adaptive",
    scoring: "adaptive",
  },
  listenType: {
    label: "Listen and Type",
    description: "Type a sentence you hear, with up to three plays.",
    section: "adaptive",
    scoring: "adaptive",
  },
  interactiveReading: {
    label: "Interactive Reading",
    description:
      "One passage, five kinds of question: fill gaps, add the missing sentence, highlight answers, find the main idea, pick a title.",
    section: "reading",
    scoring: "interactive",
  },
  interactiveListening: {
    label: "Interactive Listening",
    description:
      "Complete notes on a scenario, then reply in a conversation with Marek or Mária.",
    section: "listening",
    scoring: "interactive",
  },
  summarizeConversation: {
    label: "Summarize the Conversation",
    description: "Sum up that conversation in writing.",
    section: "listening",
    scoring: "ai",
  },
  writePhoto: {
    label: "Write About the Photo",
    description: "Describe a photo in one minute.",
    section: "writing",
    scoring: "ai",
  },
  interactiveWriting: {
    label: "Interactive Writing",
    description: "Answer a question, then a follow-up on the same topic.",
    section: "writing",
    scoring: "ai",
  },
  writingSample: {
    label: "Writing Sample",
    description: "Five minutes on a personal or opinion topic.",
    section: "writing",
    scoring: "ai",
  },
  readAloud: {
    label: "Read Aloud",
    description: "Say a sentence out loud; speech recognition checks every word.",
    section: "speaking",
    scoring: "speech",
  },
  speakPhoto: {
    label: "Speak About the Photo",
    description: "Describe a photo out loud.",
    section: "speaking",
    scoring: "ai",
  },
  readThenSpeak: {
    label: "Read, Then Speak",
    description: "Read a question with prompts, then answer out loud.",
    section: "speaking",
    scoring: "ai",
  },
  interactiveSpeaking: {
    label: "Interactive Speaking",
    description: "A spoken conversation whose follow-up questions adapt to what you say.",
    section: "speaking",
    scoring: "planned",
  },
  speakingSample: {
    label: "Speaking Sample",
    description: "Speak for up to three minutes on a topic.",
    section: "speaking",
    scoring: "ai",
  },
};

export const TASK_ORDER: readonly TaskKind[] = Object.keys(TASK_INFO) as TaskKind[];

/** Why a task is a placeholder in this run, in one line. */
export function plannedReason(
  task: PlannedTask,
  capabilities: ScoringCapabilities,
  microphone: boolean,
): string {
  const info = TASK_INFO[task];
  if (info.scoring === "planned") {
    return "Needs a live, two-way conversation with the scorer. Planned for a later version.";
  }
  if (info.section === "speaking" && !microphone) {
    return "Needs a microphone. Turn speaking on before you start to try it.";
  }
  if (info.section === "speaking" && !capabilities.transcription) {
    return "Needs speech recognition, which is not switched on for this site yet.";
  }
  return "Needs AI scoring, which is not switched on for this site yet.";
}

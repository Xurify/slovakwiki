<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { gradeChoice, gradeIdeaGap } from "$lib/level-test/grade";
  import { SUMMARY_TIME_SECONDS } from "$lib/level-test/plan";
  import { taskResponse } from "$lib/level-test/session";
  import type { InteractiveListeningSet, ItemResponse } from "$lib/level-test/types";

  import ClipButton from "../ClipButton.svelte";
  import SlovakKeys from "../SlovakKeys.svelte";
  import TaskFrame from "../TaskFrame.svelte";
  import {
    optionDotClass,
    optionRowClass,
    plannedTagClass,
    textAreaClass,
    textInputClass,
  } from "../level-test-ui";
  import type { StepDone } from "../steps";

  let {
    set,
    seconds,
    scoring,
    ondone,
  }: {
    set: InteractiveListeningSet;
    seconds: number | null;
    /** False when AI scoring is off: the summary becomes a planned note. */
    scoring: boolean;
    ondone: StepDone;
  } = $props();

  const RESPOND_GUESS = 1 / 3;

  let phase = $state<"complete" | "respond" | "summary">("complete");
  let typed = $state<string[]>([]);
  let turn = $state(0);
  let picked = $state<number | null>(null);
  let replies = $state<(number | null)[]>([]);
  let summary = $state("");
  let done = false;

  const current = $derived(set.turns[turn]);
  const lastTurn = $derived(turn >= set.turns.length - 1);

  function listeningResponses(): ItemResponse[] {
    return [
      ...set.complete.map((question, index) =>
        taskResponse(
          `${set.id}#complete-${index}`,
          "ilComplete",
          "listening",
          set.difficulty,
          gradeIdeaGap(question.accepted, typed[index] ?? ""),
        ),
      ),
      ...set.turns.map((entry, index) =>
        taskResponse(
          `${set.id}#turn-${index}`,
          "ilRespond",
          "listening",
          set.difficulty,
          gradeChoice(entry.answer, replies[index] ?? null),
          RESPOND_GUESS,
        ),
      ),
    ];
  }

  function finish(): void {
    if (done) return;
    done = true;
    const production =
      scoring && summary.trim()
        ? [
            {
              kind: "summarizeConversation" as const,
              skill: "writing" as const,
              prompt: `Summarize the conversation. Scenario: ${set.scenario.text}`,
              response: summary.trim(),
              contentKey: set.summaryKey,
            },
          ]
        : [];
    ondone({ responses: listeningResponses(), production });
  }

  function endConversation(): void {
    if (scoring) phase = "summary";
    else finish();
  }

  function answerTurn(): void {
    replies = [...replies.slice(0, turn), picked];
    picked = null;
    if (lastTurn) endConversation();
    else turn += 1;
  }

  /** The shared 6:30 ran out: unanswered turns count as misses. */
  function mainTimeUp(): void {
    if (phase === "summary") return;
    endConversation();
  }

  const heading = $derived(
    phase === "complete"
      ? "Listen to the scenario, then complete the sentences"
      : phase === "respond"
        ? "Take part in the conversation"
        : "Write a summary of the conversation in Slovak",
  );
</script>

{#key phase === "summary"}
  <TaskFrame
    {heading}
    seconds={seconds === null
      ? null
      : phase === "summary"
        ? SUMMARY_TIME_SECONDS
        : seconds}
    timerLabel={phase === "summary" ? "to write" : "for this conversation"}
    onexpire={phase === "summary" ? finish : mainTimeUp}
    meta={phase === "respond" ? `Reply ${turn + 1} of ${set.turns.length}` : undefined}
  >
    {#if phase === "complete"}
      <div class="grid gap-6">
        <div class="flex flex-col items-center gap-2">
          <ClipButton src={set.scenario.audio} label="Play the scenario" />
          <p class="m-0 text-xs text-slate-500">
            You can play the scenario as often as you like.
          </p>
        </div>

        <ol class="m-0 grid list-none gap-4 p-0">
          {#each set.complete as question, index (index)}
            {@const punctuation = /^[.,;:!?]+/u.exec(question.after)?.[0] ?? ""}
            {@const rest = question.after.slice(punctuation.length).trim()}
            <li class="grid gap-1.5">
              <label
                class="flex flex-wrap items-baseline gap-x-2 gap-y-2 font-serif text-lg text-slate-900"
                lang="sk"
              >
                <span>{question.before}</span>
                <span class="inline-flex items-baseline">
                  <input
                    class="{textInputClass} w-48 max-w-full"
                    value={typed[index] ?? ""}
                    oninput={(event) => {
                      const next = [...typed];
                      next[index] = (event.currentTarget as HTMLInputElement).value;
                      typed = next;
                    }}
                    autocomplete="off"
                    autocapitalize="none"
                    spellcheck="false"
                    lang="sk"
                  />{punctuation}</span
                >

                {#if rest}
                  <span>{rest}</span>
                {/if}
              </label>

              <p class="m-0 text-sm text-slate-500">{question.english}</p>
            </li>
          {/each}
        </ol>

        <SlovakKeys />
      </div>
    {:else if phase === "respond" && current}
      <div class="grid gap-6">
        <div
          class="flex items-center gap-4 rounded-(--control-radius) bg-subtle/60 px-4 py-3"
        >
          <LessonCharacterAvatar characterId={set.partner} size="lg" />

          <div class="grid gap-1">
            <p class="m-0 text-sm font-semibold text-slate-900">{set.partnerName}</p>
            <p class="m-0 text-xs text-slate-500">
              Listen closely: each line plays only once.
            </p>
          </div>

          <div class="ml-auto">
            {#key turn}
              <ClipButton
                src={current.line.audio}
                maxPlays={1}
                size="md"
                autoplay
                label={`Play what ${set.partnerName} says`}
              />
            {/key}
          </div>
        </div>

        <div class="grid gap-3" aria-live="polite">
          <p class={eyebrowMutedClass}>Choose the best reply</p>

          {#each current.options as option, index (index)}
            <button
              class={optionRowClass(picked === index)}
              type="button"
              lang="sk"
              onclick={() => (picked = index)}
            >
              <span class={optionDotClass(picked === index)} aria-hidden="true"></span>
              {option}
            </button>
          {/each}
        </div>
      </div>
    {:else if phase === "summary"}
      <div class="grid gap-3">
        <label class="sr-only" for="level-test-summary">Your summary</label>
        <textarea
          id="level-test-summary"
          class={textAreaClass}
          bind:value={summary}
          placeholder="V rozhovore…"
          spellcheck="false"
          lang="sk"></textarea>

        <SlovakKeys />
      </div>
    {/if}

    {#snippet footer()}
      {#if phase === "respond" && !scoring && lastTurn}
        <p class="m-0 mr-auto flex items-center gap-2 text-xs text-slate-500">
          <span class={plannedTagClass}>Planned</span>
          Summarize the Conversation needs AI scoring.
        </p>
      {/if}

      {#if phase === "complete"}
        <Button variant="accent" class="min-w-32" onclick={() => (phase = "respond")}
          >Next</Button
        >
      {:else if phase === "respond"}
        <Button variant="accent" class="min-w-32" onclick={answerTurn}>
          {picked === null ? "Skip" : "Reply"}
        </Button>
      {:else}
        <Button variant="accent" class="min-w-32" onclick={finish}>Next</Button>
      {/if}
    {/snippet}
  </TaskFrame>
{/key}

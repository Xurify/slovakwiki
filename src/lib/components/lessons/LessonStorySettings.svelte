<script lang="ts">
  import { onMount } from "svelte";
  import {
    AUDIO_VOLUME_CHANGE_EVENT,
    getAudioVolume,
    setAudioVolume,
  } from "$lib/client/audio-volume";
  import {
    STORY_PREFS_CHANGE_EVENT,
    getStoryAutoAdvance,
    getStoryShowEnglish,
    setStoryAutoAdvance,
    setStoryShowEnglish,
    toggleStoryBool,
    type StoryBoolPreference,
  } from "$lib/client/lesson-story-prefs";

  let {
    class: className = "",
  }: {
    class?: string;
  } = $props();

  let open = $state(false);
  let autoAdvance = $state<StoryBoolPreference>(getStoryAutoAdvance());
  let showEnglish = $state<StoryBoolPreference>(getStoryShowEnglish());
  let volume = $state(getAudioVolume());
  let rootEl: HTMLDivElement | undefined = $state();

  onMount(() => {
    autoAdvance = getStoryAutoAdvance();
    showEnglish = getStoryShowEnglish();
    volume = getAudioVolume();

    function onPrefsChange(): void {
      autoAdvance = getStoryAutoAdvance();
      showEnglish = getStoryShowEnglish();
    }

    function onVolumeChange(): void {
      volume = getAudioVolume();
    }

    function onPointerDown(event: PointerEvent): void {
      if (!open || !rootEl) return;
      if (event.target instanceof Node && rootEl.contains(event.target)) return;
      open = false;
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") open = false;
    }

    window.addEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
    window.addEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
      window.removeEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  function togglePanel(): void {
    open = !open;
  }

  function onAutoAdvanceToggle(): void {
    autoAdvance = toggleStoryBool(autoAdvance);
    setStoryAutoAdvance(autoAdvance);
  }

  function onShowEnglishToggle(): void {
    showEnglish = toggleStoryBool(showEnglish);
    setStoryShowEnglish(showEnglish);
  }

  function onVolumeInput(event: Event): void {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    volume = setAudioVolume(Number(target.value) / 100);
  }

  const volumePercent = $derived(Math.round(volume * 100));

  const triggerClass = $derived(
    [
      "inline-grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border bg-(--surface) text-blue-900 shadow-(--shadow-border)",
      "transition-[background-color,border-color,box-shadow,transform] duration-200",
      "hover:border-blue-700 hover:bg-blue-50 hover:shadow-(--shadow-border-hover) active:scale-[0.98]",
      open
        ? "border-blue-700 bg-blue-50 shadow-(--shadow-border-hover)"
        : "border-slate-300",
    ].join(" "),
  );
</script>

<div class="relative {className}" bind:this={rootEl}>
  <button
    class={triggerClass}
    type="button"
    aria-label="Story settings"
    aria-expanded={open}
    aria-haspopup="dialog"
    aria-controls={open ? "lesson-story-settings" : undefined}
    title="Story settings"
    onclick={togglePanel}
  >
    <svg
      class="size-[1.125rem] fill-none stroke-current"
      viewBox="0 0 24 24"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <!-- Lucide settings — stroke-native cog (not a filled gear outline) -->
      <path
        d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </button>

  {#if open}
    <div
      id="lesson-story-settings"
      class="absolute top-[calc(100%+0.625rem)] right-0 z-40 w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border) ring-1 ring-slate-200/90 ring-inset"
      role="dialog"
      aria-label="Story settings"
    >
      <div class="border-b border-slate-200/80 px-3.5 py-2.5">
        <p
          class="m-0 text-[0.62rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
        >
          Story
        </p>
      </div>

      <ul class="m-0 list-none p-0">
        <li class="border-b border-slate-200/70 last:border-b-0">
          <button
            class="flex w-full cursor-pointer items-start justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-subtle"
            type="button"
            aria-pressed={autoAdvance === "on"}
            onclick={onAutoAdvanceToggle}
          >
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-slate-900">Auto-advance</span>
              <span class="mt-0.5 block text-xs leading-snug text-pretty text-slate-500">
                Play the next line when audio ends. Needs sound on.
              </span>
            </span>

            <span
              class="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors {autoAdvance ===
              'on'
                ? 'bg-blue-700'
                : 'bg-slate-300'}"
              aria-hidden="true"
            >
              <span
                class="size-4 rounded-full bg-white shadow-sm transition-transform {autoAdvance ===
                'on'
                  ? 'translate-x-4'
                  : 'translate-x-0'}"
              ></span>
            </span>
          </button>
        </li>

        <li class="border-b border-slate-200/70 last:border-b-0">
          <div class="px-3.5 py-3">
            <label
              class="flex items-baseline justify-between gap-3"
              for="lesson-story-volume"
            >
              <span class="text-sm font-semibold text-slate-900">Volume</span>
              <span class="text-xs tabular-nums text-slate-500">{volumePercent}%</span>
            </label>

            <input
              id="lesson-story-volume"
              class="mt-2.5 block w-full cursor-pointer accent-blue-700"
              type="range"
              min="0"
              max="100"
              step="1"
              value={volumePercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volumePercent}
              aria-valuetext="{volumePercent} percent"
              oninput={onVolumeInput}
            />

            <p class="m-0 mt-1.5 text-xs leading-snug text-pretty text-slate-500">
              How loud story and listen audio plays
            </p>
          </div>
        </li>

        <li class="border-b border-slate-200/70 last:border-b-0">
          <button
            class="flex w-full cursor-pointer items-start justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-subtle"
            type="button"
            aria-pressed={showEnglish === "on"}
            onclick={onShowEnglishToggle}
          >
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-slate-900">Show English</span>
              <span class="mt-0.5 block text-xs leading-snug text-pretty text-slate-500">
                Always show translations under Slovak
              </span>
            </span>

            <span
              class="mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors {showEnglish ===
              'on'
                ? 'bg-blue-700'
                : 'bg-slate-300'}"
              aria-hidden="true"
            >
              <span
                class="size-4 rounded-full bg-white shadow-sm transition-transform {showEnglish ===
                'on'
                  ? 'translate-x-4'
                  : 'translate-x-0'}"
              ></span>
            </span>
          </button>
        </li>
      </ul>
    </div>
  {/if}
</div>

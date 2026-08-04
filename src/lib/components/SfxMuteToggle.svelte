<script lang="ts">
  import { onMount } from "svelte";
  import {
    SFX_CHANGE_EVENT,
    getInitialSfxPreference,
    setSfxPreference,
    toggleSfxPreference,
    type SfxPreference,
  } from "$lib/client/sfx";

  let {
    class: className = "",
  }: {
    class?: string;
  } = $props();

  let preference = $state<SfxPreference>(getInitialSfxPreference());

  onMount(() => {
    preference = getInitialSfxPreference();

    function onSfxChange(): void {
      preference = getInitialSfxPreference();
    }

    window.addEventListener(SFX_CHANGE_EVENT, onSfxChange);

    return () => {
      window.removeEventListener(SFX_CHANGE_EVENT, onSfxChange);
    };
  });

  function onToggle(): void {
    preference = toggleSfxPreference(preference);
    setSfxPreference(preference);
  }

  const enabled = $derived(preference === "on");
  const label = $derived(
    enabled ? "Sound effects on. Click to mute." : "Sound effects off. Click to unmute.",
  );
</script>

<button
  class="relative inline-grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-slate-300 bg-(--surface) text-blue-900 shadow-(--shadow-border) transition-[background-color,border-color,box-shadow,transform,scale,color] duration-200 hover:border-blue-700 hover:bg-blue-50 hover:shadow-(--shadow-border-hover) active:scale-[0.98] data-muted:bg-slate-50 data-muted:text-slate-500 data-muted:hover:border-slate-400 data-muted:hover:bg-slate-100 data-muted:hover:text-slate-700 {className}"
  type="button"
  aria-label={label}
  aria-pressed={enabled}
  title={label}
  data-muted={!enabled ? "" : undefined}
  onclick={onToggle}
>
  <span class="relative size-[1.125rem]" aria-hidden="true">
    <svg
      class="absolute inset-0 size-full fill-none stroke-current transition-[opacity,transform,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none {enabled
        ? 'scale-100 opacity-100 blur-none'
        : 'scale-[0.25] opacity-0 blur-[4px] motion-reduce:scale-100'}"
      viewBox="0 0 24 24"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
      <path d="M15.2 9.2a4.2 4.2 0 0 1 0 5.6" />
      <path d="M18.2 7a7 7 0 0 1 0 10" />
    </svg>

    <svg
      class="absolute inset-0 size-full fill-none stroke-current transition-[opacity,transform,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none {!enabled
        ? 'scale-100 opacity-100 blur-none'
        : 'scale-[0.25] opacity-0 blur-[4px] motion-reduce:scale-100'}"
      viewBox="0 0 24 24"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
      <path d="M16 9l5 5M21 9l-5 5" />
    </svg>
  </span>
</button>

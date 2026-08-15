<script lang="ts">
  import type { LessonMotifId } from "$lib/lesson-story/lesson-motifs";

  let {
    motif,
    size = "sm",
    class: className = "",
  }: {
    motif: LessonMotifId;
    size?: "sm" | "lg";
    class?: string;
  } = $props();

  const tintClass: Record<LessonMotifId, string> = {
    greetings: "bg-blue-50",
    numbers: "bg-blue-50",
    time: "bg-blue-50",
    negation: "bg-rose-50",
    "present-tense": "bg-blue-50",
    byt: "bg-blue-50",
    mat: "bg-emerald-50",
    stress: "bg-blue-50",
    default: "bg-blue-50",
  };

  const isLg = $derived(size === "lg");

  const shellClass = $derived(
    isLg
      ? "inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-(--control-radius) ring-1 ring-slate-200/70 ring-inset"
      : "inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-(--control-radius) ring-1 ring-slate-200/70 ring-inset",
  );

  const svgClass = $derived(isLg ? "size-9" : "size-8");
</script>

<span class="{shellClass} {tintClass[motif]} {className}" aria-hidden="true">
  <svg class={svgClass} viewBox="0 0 32 32" fill="none">
    {#if motif === "greetings"}
      <!-- Overlapping speech bubbles -->
      <rect x="3" y="6" width="14" height="11" rx="3" class="fill-blue-200" />
      <path d="M7 17v4l4-4H7Z" class="fill-blue-200" />
      <rect x="13" y="12" width="14" height="11" rx="3" class="fill-blue-600" />
      <path d="M23 23v4l-4-4h4Z" class="fill-blue-600" />
      <circle cx="8" cy="11.5" r="1.15" class="fill-blue-700" />
      <circle cx="12" cy="11.5" r="1.15" class="fill-blue-700" />
      <circle cx="18" cy="17.5" r="1.15" class="fill-white" />
      <circle cx="22" cy="17.5" r="1.15" class="fill-white" />
    {:else if motif === "numbers"}
      <!-- Solid badge + even 123 (Monzo/Cleo-style numeric tile) -->
      <rect x="4" y="7" width="24" height="18" rx="4" class="fill-blue-700" />
      <text
        x="16"
        y="20"
        text-anchor="middle"
        class="fill-white"
        font-family="var(--font-reading), Georgia, serif"
        font-size="11"
        font-weight="700"
        letter-spacing="0.06em">123</text
      >
    {:else if motif === "time"}
      <!-- Clock -->
      <circle cx="16" cy="16" r="11" class="fill-blue-100" />
      <circle cx="16" cy="16" r="11" class="stroke-blue-600" stroke-width="1.75" />
      <path
        d="M16 9v7l5 3"
        class="stroke-blue-800"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="16" cy="16" r="1.5" class="fill-blue-800" />
    {:else if motif === "negation"}
      <!-- Crossed mark -->
      <circle cx="16" cy="16" r="11" class="fill-rose-100" />
      <path
        d="M10.5 10.5l11 11M21.5 10.5l-11 11"
        class="stroke-rose-600"
        stroke-width="2.25"
        stroke-linecap="round"
      />
    {:else if motif === "present-tense"}
      <!-- Six ending cells -->
      <rect x="4" y="5" width="11" height="6" rx="1.25" class="fill-blue-600" />
      <rect x="17" y="5" width="11" height="6" rx="1.25" class="fill-blue-200" />
      <rect x="4" y="13" width="11" height="6" rx="1.25" class="fill-blue-200" />
      <rect x="17" y="13" width="11" height="6" rx="1.25" class="fill-blue-600" />
      <rect x="4" y="21" width="11" height="6" rx="1.25" class="fill-slate-300" />
      <rect x="17" y="21" width="11" height="6" rx="1.25" class="fill-blue-800" />
    {:else if motif === "byt"}
      <!-- Person + equals -->
      <circle cx="11" cy="11" r="4.25" class="fill-blue-600" />
      <path d="M4 26c0-4 3.2-7 7-7s7 3 7 7" class="fill-blue-200" />
      <path
        d="M21 12h8M21 18h8"
        class="stroke-blue-800"
        stroke-width="2"
        stroke-linecap="round"
      />
    {:else if motif === "mat"}
      <!-- Possession card -->
      <rect x="5" y="8" width="22" height="14" rx="2.5" class="fill-emerald-100" />
      <rect
        x="5"
        y="8"
        width="22"
        height="14"
        rx="2.5"
        class="stroke-emerald-600"
        stroke-width="1.5"
      />
      <circle cx="12" cy="15" r="2.25" class="fill-emerald-600" />
      <path
        d="M17 13h7M17 17h5"
        class="stroke-emerald-700"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M10 26h12"
        class="stroke-slate-400"
        stroke-width="1.75"
        stroke-linecap="round"
      />
    {:else if motif === "stress"}
      <!-- Speaker + waves (pronunciation / hear) -->
      <path
        d="M6 12.5h3.5L14 8.5v15l-4.5-4H6a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 6 12.5Z"
        class="fill-blue-700"
      />
      <path
        d="M17.5 13.5a4 4 0 0 1 0 5"
        class="stroke-blue-600"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <path
        d="M20.5 11a7 7 0 0 1 0 10"
        class="stroke-blue-400"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <path
        d="M23.5 8.5a10 10 0 0 1 0 15"
        class="stroke-blue-300"
        stroke-width="1.75"
        stroke-linecap="round"
      />
    {:else}
      <rect x="8" y="4" width="16" height="24" rx="2" class="fill-blue-100" />
      <path d="M8 4h16v11l-8-4-8 4V4Z" class="fill-blue-600" />
    {/if}
  </svg>
</span>

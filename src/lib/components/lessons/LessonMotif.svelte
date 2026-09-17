<script lang="ts">
  import type { LessonMotifId } from "$lib/lesson-story/lesson-motifs";

  let {
    motif,
    size = "sm",
    bare = false,
    class: className = "",
  }: {
    motif: LessonMotifId;
    size?: "sm" | "lg" | "xl";
    bare?: boolean;
    class?: string;
  } = $props();

  const tintClass: Record<LessonMotifId, string> = {
    greetings: "bg-blue-50",
    questions: "bg-blue-50",
    numbers: "bg-blue-50",
    time: "bg-blue-50",
    negation: "bg-rose-50",
    "present-tense": "bg-blue-50",
    byt: "bg-blue-50",
    mat: "bg-emerald-50",
    stress: "bg-blue-50",
    default: "bg-blue-50",
  };

  const svgClass = $derived(
    size === "xl" ? "size-16" : size === "lg" ? "size-9" : "size-8",
  );

  const shellClass = $derived(
    size === "xl"
      ? "inline-flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-(--control-radius) ring-1 ring-slate-200/70 ring-inset"
      : size === "lg"
        ? "inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-(--control-radius) ring-1 ring-slate-200/70 ring-inset"
        : "inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-(--control-radius) ring-1 ring-slate-200/70 ring-inset",
  );
</script>

{#snippet mark()}
  <svg class="{svgClass} {bare ? className : ''}" viewBox="0 0 32 32" fill="none">
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
    {:else if motif === "questions"}
      <rect x="4" y="5" width="18" height="13" rx="3" class="fill-blue-600" />
      <path d="M8 18v4.5l5-4.5H8Z" class="fill-blue-600" />
      <text
        x="13"
        y="15"
        text-anchor="middle"
        class="fill-white"
        font-family="var(--font-reading), Georgia, serif"
        font-size="11"
        font-weight="700">?</text
      >
      <rect x="14" y="14" width="14" height="11" rx="3" class="fill-blue-200" />
      <path d="M24 25v4l-4-4h4Z" class="fill-blue-200" />
      <circle cx="21" cy="19.5" r="1.2" class="fill-blue-800" />
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
      <!-- Name badge: portrait + som -->
      <rect x="5" y="4" width="22" height="24" rx="5" class="fill-white" />
      <circle cx="16" cy="12" r="4.5" class="fill-blue-700" />
      <path d="M7 22c.8-4 4.2-6 9-6s8.2 2 9 6" class="fill-blue-200" />
      <rect x="5" y="19" width="22" height="9" rx="5" class="fill-blue-800" />
      <rect x="5" y="19" width="22" height="5" class="fill-blue-800" />
      <text
        x="16"
        y="25.5"
        text-anchor="middle"
        class="fill-white"
        font-family="var(--font-reading), Georgia, serif"
        font-size="5.5"
        font-weight="700">som</text
      >
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
{/snippet}

{#if bare}
  <span aria-hidden="true">
    {@render mark()}
  </span>
{:else}
  <span class="{shellClass} {tintClass[motif]} {className}" aria-hidden="true">
    {@render mark()}
  </span>
{/if}

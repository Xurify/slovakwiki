<script lang="ts">
  import type { LessonMotifId } from "$lib/lessons/lesson-motifs";

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
    time: "bg-slate-100",
    negation: "bg-rose-50",
    "present-tense": "bg-blue-50",
    byt: "bg-blue-50",
    mat: "bg-emerald-50",
    stress: "bg-blue-50",
    default: "bg-subtle",
  };

  const shellClass = $derived(
    size === "lg"
      ? "inline-flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-(--frame-radius) ring-1 ring-slate-200/80 ring-inset"
      : "inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-(--control-radius) ring-1 ring-slate-200/80 ring-inset",
  );

  const svgClass = $derived(size === "lg" ? "size-14" : "size-9");
</script>

<span class="{shellClass} {tintClass[motif]} {className}" aria-hidden="true">
  <svg class={svgClass} viewBox="0 0 36 36" fill="none">
    {#if motif === "greetings"}
      <!-- Two speech bubbles meeting -->
      <rect x="4" y="8" width="16" height="12" rx="3" class="fill-blue-200" />
      <rect x="16" y="16" width="16" height="12" rx="3" class="fill-blue-600" />
      <circle cx="9" cy="14" r="1.2" class="fill-blue-700" />
      <circle cx="13" cy="14" r="1.2" class="fill-blue-700" />
      <circle cx="21" cy="22" r="1.2" class="fill-white" />
      <circle cx="25" cy="22" r="1.2" class="fill-white" />
    {:else if motif === "numbers"}
      <!-- Digit pad + hash -->
      <rect x="6" y="5" width="24" height="26" rx="4" class="fill-blue-100" />
      <rect x="10" y="9" width="6" height="5" rx="1" class="fill-blue-600" />
      <rect x="20" y="9" width="6" height="5" rx="1" class="fill-slate-400" />
      <rect x="10" y="16" width="6" height="5" rx="1" class="fill-slate-400" />
      <rect x="20" y="16" width="6" height="5" rx="1" class="fill-blue-600" />
      <rect x="10" y="23" width="16" height="4" rx="1" class="fill-blue-800" />
    {:else if motif === "time"}
      <!-- Clock face -->
      <circle cx="18" cy="18" r="13" class="fill-blue-100" />
      <circle cx="18" cy="18" r="13" class="stroke-blue-600" stroke-width="2" />
      <path
        d="M18 10v8l5 3"
        class="stroke-blue-800"
        stroke-width="2.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="18" cy="18" r="1.75" class="fill-blue-800" />
    {:else if motif === "negation"}
      <!-- Crossed speech / nie -->
      <circle cx="18" cy="18" r="12" class="fill-rose-100" />
      <path
        d="M11 11l14 14M25 11 11 25"
        class="stroke-rose-600"
        stroke-width="2.5"
        stroke-linecap="round"
      />
    {:else if motif === "present-tense"}
      <!-- Conjugation grid: six cells -->
      <rect x="5" y="6" width="11" height="7" rx="1.5" class="fill-blue-600" />
      <rect x="20" y="6" width="11" height="7" rx="1.5" class="fill-blue-200" />
      <rect x="5" y="15" width="11" height="7" rx="1.5" class="fill-blue-200" />
      <rect x="20" y="15" width="11" height="7" rx="1.5" class="fill-blue-600" />
      <rect x="5" y="24" width="11" height="6" rx="1.5" class="fill-slate-300" />
      <rect x="20" y="24" width="11" height="6" rx="1.5" class="fill-blue-800" />
    {:else if motif === "byt"}
      <!-- Identity badge: person + equals -->
      <circle cx="12" cy="13" r="5" class="fill-blue-600" />
      <path d="M5 28c0-4 3.2-7 7-7s7 3 7 7" class="fill-blue-200" />
      <path
        d="M22 14h9M22 20h9"
        class="stroke-blue-800"
        stroke-width="2.25"
        stroke-linecap="round"
      />
    {:else if motif === "mat"}
      <!-- Open hand / possession card -->
      <rect x="7" y="8" width="22" height="16" rx="3" class="fill-emerald-100" />
      <rect
        x="7"
        y="8"
        width="22"
        height="16"
        rx="3"
        class="stroke-emerald-600"
        stroke-width="1.75"
      />
      <circle cx="14" cy="16" r="2.5" class="fill-emerald-600" />
      <path
        d="M19 14h7M19 18h5"
        class="stroke-emerald-700"
        stroke-width="1.75"
        stroke-linecap="round"
      />
      <path
        d="M12 26h12"
        class="stroke-slate-400"
        stroke-width="2"
        stroke-linecap="round"
      />
    {:else if motif === "stress"}
      <!-- Wave with first-beat mark -->
      <path
        d="M4 22c3-8 5-8 8 0s5 8 8 0 5-8 8 0"
        class="stroke-blue-300"
        stroke-width="2"
        stroke-linecap="round"
        fill="none"
      />
      <path
        d="M8 8v10"
        class="stroke-blue-800"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <circle cx="8" cy="7" r="2.5" class="fill-blue-600" />
    {:else}
      <!-- Default bookmark -->
      <rect x="10" y="6" width="16" height="24" rx="2" class="fill-blue-100" />
      <path d="M10 6h16v10l-8-4-8 4V6Z" class="fill-blue-600" />
    {/if}
  </svg>
</span>

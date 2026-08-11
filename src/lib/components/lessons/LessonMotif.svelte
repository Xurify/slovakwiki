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

  const isLg = $derived(size === "lg");

  const shellClass = $derived(
    isLg
      ? "inline-flex h-28 w-full max-w-[14rem] shrink-0 items-center justify-center overflow-hidden rounded-(--frame-radius) ring-1 ring-slate-200/80 ring-inset"
      : "inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-(--control-radius) ring-1 ring-slate-200/80 ring-inset",
  );
</script>

<span class="{shellClass} {tintClass[motif]} {className}" aria-hidden="true">
  {#if isLg}
    <svg class="h-[4.75rem] w-[6rem]" viewBox="0 0 80 64" fill="none">
      {#if motif === "greetings"}
        <!-- Two figures + overlapping speech bubbles -->
        <circle cx="22" cy="18" r="6" class="fill-blue-600" />
        <path d="M12 42c0-6.5 4.5-11 10-11s10 4.5 10 11" class="fill-blue-200" />
        <circle cx="58" cy="18" r="6" class="fill-slate-500" />
        <path d="M48 42c0-6.5 4.5-11 10-11s10 4.5 10 11" class="fill-slate-300" />
        <rect x="28" y="8" width="18" height="12" rx="4" class="fill-blue-100" />
        <rect x="34" y="22" width="18" height="12" rx="4" class="fill-blue-600" />
        <circle cx="34" cy="14" r="1.4" class="fill-blue-700" />
        <circle cx="40" cy="14" r="1.4" class="fill-blue-700" />
        <circle cx="40" cy="28" r="1.4" class="fill-white" />
        <circle cx="46" cy="28" r="1.4" class="fill-white" />
      {:else if motif === "numbers"}
        <!-- Phone + price tag -->
        <rect x="10" y="8" width="28" height="48" rx="5" class="fill-blue-100" />
        <rect
          x="10"
          y="8"
          width="28"
          height="48"
          rx="5"
          class="stroke-blue-600"
          stroke-width="2"
        />
        <rect x="15" y="14" width="18" height="22" rx="2" class="fill-blue-600" />
        <circle cx="24" cy="46" r="3" class="fill-blue-800" />
        <path d="M48 18h22l6 10-6 10H48V18Z" class="fill-emerald-100" />
        <path
          d="M48 18h22l6 10-6 10H48V18Z"
          class="stroke-emerald-600"
          stroke-width="1.75"
          stroke-linejoin="round"
        />
        <circle cx="54" cy="28" r="2.5" class="fill-emerald-600" />
        <path
          d="M60 24h6M60 32h4"
          class="stroke-emerald-700"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      {:else if motif === "time"}
        <!-- Clock + calendar leaf -->
        <circle cx="28" cy="32" r="20" class="fill-blue-100" />
        <circle cx="28" cy="32" r="20" class="stroke-blue-600" stroke-width="2.25" />
        <path
          d="M28 18v14l9 5"
          class="stroke-blue-800"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="28" cy="32" r="2.5" class="fill-blue-800" />
        <rect x="50" y="14" width="22" height="26" rx="3" class="fill-white" />
        <rect x="50" y="14" width="22" height="8" rx="3" class="fill-blue-600" />
        <rect x="50" y="18" width="22" height="4" class="fill-blue-600" />
        <circle cx="56" cy="12" r="2" class="fill-slate-400" />
        <circle cx="66" cy="12" r="2" class="fill-slate-400" />
        <rect x="54" y="28" width="5" height="5" rx="1" class="fill-blue-200" />
        <rect x="62" y="28" width="5" height="5" rx="1" class="fill-blue-600" />
        <rect x="54" y="36" width="5" height="5" rx="1" class="fill-slate-300" />
        <rect x="62" y="36" width="5" height="5" rx="1" class="fill-slate-300" />
      {:else if motif === "negation"}
        <!-- Offer bubble crossed by × -->
        <rect x="8" y="14" width="44" height="28" rx="8" class="fill-rose-100" />
        <path d="M24 42l-6 8h12l-6-8Z" class="fill-rose-100" />
        <circle cx="22" cy="28" r="2.2" class="fill-rose-400" />
        <circle cx="30" cy="28" r="2.2" class="fill-rose-400" />
        <circle cx="38" cy="28" r="2.2" class="fill-rose-400" />
        <path
          d="M48 12l20 40M68 12 48 52"
          class="stroke-rose-600"
          stroke-width="3.5"
          stroke-linecap="round"
        />
      {:else if motif === "present-tense"}
        <!-- Verb stem + six ending chips -->
        <rect x="8" y="20" width="28" height="24" rx="4" class="fill-blue-600" />
        <path
          d="M16 32h12M16 38h8"
          class="stroke-white"
          stroke-width="2"
          stroke-linecap="round"
        />
        <rect x="42" y="10" width="12" height="10" rx="2.5" class="fill-blue-200" />
        <rect x="58" y="10" width="12" height="10" rx="2.5" class="fill-blue-600" />
        <rect x="42" y="26" width="12" height="10" rx="2.5" class="fill-blue-200" />
        <rect x="58" y="26" width="12" height="10" rx="2.5" class="fill-blue-800" />
        <rect x="42" y="42" width="12" height="10" rx="2.5" class="fill-slate-300" />
        <rect x="58" y="42" width="12" height="10" rx="2.5" class="fill-blue-600" />
      {:else if motif === "byt"}
        <!-- ID badge + som mark -->
        <rect x="14" y="8" width="36" height="48" rx="5" class="fill-blue-100" />
        <rect
          x="14"
          y="8"
          width="36"
          height="48"
          rx="5"
          class="stroke-blue-600"
          stroke-width="2"
        />
        <rect x="14" y="8" width="36" height="12" rx="5" class="fill-blue-600" />
        <rect x="14" y="14" width="36" height="6" class="fill-blue-600" />
        <circle cx="32" cy="30" r="7" class="fill-blue-600" />
        <path d="M20 52c0-6 5.5-10 12-10s12 4 12 10" class="fill-blue-200" />
        <rect x="56" y="24" width="16" height="10" rx="2" class="fill-blue-800" />
        <path d="M60 29h8" class="stroke-white" stroke-width="2" stroke-linecap="round" />
        <path
          d="M60 40h10M60 46h7"
          class="stroke-blue-600"
          stroke-width="2"
          stroke-linecap="round"
        />
      {:else if motif === "mat"}
        <!-- Open hand holding a card / object -->
        <path
          d="M12 38c0-4 3-8 8-8h8c2 0 4 1 5 3l8-6c2-1.5 5-.5 6 1.5s0 5-2 6.5l-4 3c2 .5 3.5 2.5 3.5 5V48c0 4-3 7-7 7H22c-5.5 0-10-4.5-10-10v-7Z"
          class="fill-emerald-100"
        />
        <path
          d="M12 38c0-4 3-8 8-8h8c2 0 4 1 5 3l8-6c2-1.5 5-.5 6 1.5s0 5-2 6.5l-4 3c2 .5 3.5 2.5 3.5 5V48c0 4-3 7-7 7H22c-5.5 0-10-4.5-10-10v-7Z"
          class="stroke-emerald-600"
          stroke-width="1.75"
          stroke-linejoin="round"
        />
        <rect x="44" y="10" width="24" height="18" rx="3" class="fill-white" />
        <rect
          x="44"
          y="10"
          width="24"
          height="18"
          rx="3"
          class="stroke-emerald-600"
          stroke-width="1.75"
        />
        <circle cx="52" cy="19" r="3" class="fill-emerald-600" />
        <path
          d="M58 16h6M58 22h4"
          class="stroke-emerald-700"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      {:else if motif === "stress"}
        <!-- Waveform with loud first-beat spike -->
        <path
          d="M8 40c4-4 6-4 10 0s6 4 10 0 6-4 10 0 6 4 10 0 6-4 10 0 6 4 8 0"
          class="stroke-blue-200"
          stroke-width="2.5"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M14 48V16"
          class="stroke-blue-800"
          stroke-width="3.5"
          stroke-linecap="round"
        />
        <path
          d="M28 48V28M40 48V34M52 48V30M64 48V36"
          class="stroke-blue-400"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <circle cx="14" cy="12" r="4" class="fill-blue-600" />
        <path
          d="M14 8v-4"
          class="stroke-blue-800"
          stroke-width="2"
          stroke-linecap="round"
        />
      {:else}
        <!-- Book stack / bookmark -->
        <rect x="18" y="14" width="36" height="40" rx="3" class="fill-blue-100" />
        <rect x="22" y="10" width="36" height="40" rx="3" class="fill-blue-200" />
        <rect x="26" y="6" width="36" height="40" rx="3" class="fill-blue-600" />
        <path d="M26 6h36v14l-10-5-10 5V6Z" class="fill-blue-800" />
        <path
          d="M34 28h20M34 36h14"
          class="stroke-blue-100"
          stroke-width="2"
          stroke-linecap="round"
        />
      {/if}
    </svg>
  {:else}
    <svg class="size-9" viewBox="0 0 36 36" fill="none">
      {#if motif === "greetings"}
        <rect x="4" y="8" width="16" height="12" rx="3" class="fill-blue-200" />
        <rect x="16" y="16" width="16" height="12" rx="3" class="fill-blue-600" />
        <circle cx="9" cy="14" r="1.2" class="fill-blue-700" />
        <circle cx="13" cy="14" r="1.2" class="fill-blue-700" />
        <circle cx="21" cy="22" r="1.2" class="fill-white" />
        <circle cx="25" cy="22" r="1.2" class="fill-white" />
      {:else if motif === "numbers"}
        <rect x="6" y="5" width="24" height="26" rx="4" class="fill-blue-100" />
        <rect x="10" y="9" width="6" height="5" rx="1" class="fill-blue-600" />
        <rect x="20" y="9" width="6" height="5" rx="1" class="fill-slate-400" />
        <rect x="10" y="16" width="6" height="5" rx="1" class="fill-slate-400" />
        <rect x="20" y="16" width="6" height="5" rx="1" class="fill-blue-600" />
        <rect x="10" y="23" width="16" height="4" rx="1" class="fill-blue-800" />
      {:else if motif === "time"}
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
        <circle cx="18" cy="18" r="12" class="fill-rose-100" />
        <path
          d="M11 11l14 14M25 11 11 25"
          class="stroke-rose-600"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      {:else if motif === "present-tense"}
        <rect x="5" y="6" width="11" height="7" rx="1.5" class="fill-blue-600" />
        <rect x="20" y="6" width="11" height="7" rx="1.5" class="fill-blue-200" />
        <rect x="5" y="15" width="11" height="7" rx="1.5" class="fill-blue-200" />
        <rect x="20" y="15" width="11" height="7" rx="1.5" class="fill-blue-600" />
        <rect x="5" y="24" width="11" height="6" rx="1.5" class="fill-slate-300" />
        <rect x="20" y="24" width="11" height="6" rx="1.5" class="fill-blue-800" />
      {:else if motif === "byt"}
        <circle cx="12" cy="13" r="5" class="fill-blue-600" />
        <path d="M5 28c0-4 3.2-7 7-7s7 3 7 7" class="fill-blue-200" />
        <path
          d="M22 14h9M22 20h9"
          class="stroke-blue-800"
          stroke-width="2.25"
          stroke-linecap="round"
        />
      {:else if motif === "mat"}
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
        <rect x="10" y="6" width="16" height="24" rx="2" class="fill-blue-100" />
        <path d="M10 6h16v10l-8-4-8 4V6Z" class="fill-blue-600" />
      {/if}
    </svg>
  {/if}
</span>

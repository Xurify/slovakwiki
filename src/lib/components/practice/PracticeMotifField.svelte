<script lang="ts">
  import {
    practiceGraphicId,
    practiceMotifWellClass,
  } from "$lib/catalog/practice/motifs";

  let {
    setId,
    lessonId,
    variant = "card",
  }: {
    setId: string;
    lessonId: string;
    variant?: "card" | "stage";
  } = $props();

  const graphic = $derived(practiceGraphicId(setId, lessonId));
  const stage = $derived(variant === "stage");
  const wellClass = $derived(
    stage
      ? "flex shrink-0 items-end justify-center pb-1"
      : `flex size-[7.25rem] shrink-0 items-center justify-center rounded-lg max-[520px]:size-[5.75rem] ${practiceMotifWellClass[graphic]}`,
  );
  const svgClass = $derived(
    stage ? "size-[6.75rem]" : "size-[3.75rem] max-[520px]:size-12",
  );

  const hoverTilt = $derived(
    graphic === "time"
      ? "group-hover:rotate-6"
      : graphic === "byt"
        ? "group-hover:rotate-6"
        : graphic === "greetings" || graphic === "questions"
          ? "group-hover:-rotate-3"
          : "group-hover:-rotate-2",
  );
</script>

<div class={wellClass} aria-hidden="true">
  <svg
    class="{svgClass} origin-center transition-transform duration-200 ease-out group-hover:scale-110 {hoverTilt}"
    viewBox="0 0 80 80"
    fill="none"
  >
    {#if graphic === "greetings"}
      <rect x="6" y="14" width="38" height="28" rx="8" class="fill-blue-200" />
      <path d="M16 42v12l12-12H16Z" class="fill-blue-200" />
      <rect x="32" y="30" width="42" height="30" rx="8" class="fill-blue-700" />
      <path d="M62 60v12l-12-12h12Z" class="fill-blue-700" />
      <circle cx="20" cy="28" r="3" class="fill-blue-700" />
      <circle cx="30" cy="28" r="3" class="fill-blue-700" />
      <circle cx="46" cy="45" r="3" class="fill-white" />
      <circle cx="56" cy="45" r="3" class="fill-white" />
      <circle cx="66" cy="45" r="3" class="fill-white" />
    {:else if graphic === "questions"}
      <rect x="10" y="10" width="48" height="34" rx="8" class="fill-blue-700" />
      <path d="M20 44v14l14-14H20Z" class="fill-blue-700" />
      <text
        x="34"
        y="36"
        text-anchor="middle"
        class="fill-white"
        font-family="var(--font-reading), Georgia, serif"
        font-size="26"
        font-weight="700">?</text
      >
      <rect x="36" y="38" width="34" height="24" rx="7" class="fill-blue-200" />
      <path d="M60 62v10l-10-10h10Z" class="fill-blue-200" />
      <circle cx="48" cy="50" r="2.5" class="fill-blue-800" />
      <circle cx="56" cy="50" r="2.5" class="fill-blue-800" />
    {:else if graphic === "numbers"}
      <rect x="8" y="18" width="20" height="44" rx="8" class="fill-blue-500" />
      <rect x="30" y="10" width="20" height="60" rx="8" class="fill-white" />
      <rect x="52" y="22" width="20" height="36" rx="8" class="fill-blue-200" />
      <text
        x="18"
        y="48"
        text-anchor="middle"
        class="fill-white"
        font-family="var(--font-reading), Georgia, serif"
        font-size="22"
        font-weight="700">1</text
      >
      <text
        x="40"
        y="48"
        text-anchor="middle"
        class="fill-blue-800"
        font-family="var(--font-reading), Georgia, serif"
        font-size="22"
        font-weight="700">2</text
      >
      <text
        x="62"
        y="48"
        text-anchor="middle"
        class="fill-blue-800"
        font-family="var(--font-reading), Georgia, serif"
        font-size="22"
        font-weight="700">3</text
      >
    {:else if graphic === "time"}
      <circle cx="40" cy="40" r="28" class="fill-white" />
      <circle cx="40" cy="40" r="28" class="stroke-blue-600" stroke-width="3.5" />
      <circle cx="40" cy="16" r="2" class="fill-blue-400" />
      <circle cx="64" cy="40" r="2" class="fill-blue-400" />
      <circle cx="40" cy="64" r="2" class="fill-blue-400" />
      <circle cx="16" cy="40" r="2" class="fill-blue-400" />
      <path
        d="M40 22v20l14 8"
        class="stroke-blue-800"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="40" cy="40" r="4" class="fill-blue-800" />
    {:else if graphic === "negation"}
      <circle cx="40" cy="40" r="28" class="fill-white" />
      <path
        d="M26 26l28 28M54 26L26 54"
        class="stroke-rose-600"
        stroke-width="6"
        stroke-linecap="round"
      />
    {:else if graphic === "present-tense"}
      <rect x="8" y="10" width="30" height="18" rx="5" class="fill-blue-700" />
      <rect x="42" y="10" width="30" height="18" rx="5" class="fill-blue-200" />
      <rect x="8" y="31" width="30" height="18" rx="5" class="fill-blue-200" />
      <rect x="42" y="31" width="30" height="18" rx="5" class="fill-blue-600" />
      <rect x="8" y="52" width="30" height="18" rx="5" class="fill-slate-300" />
      <rect x="42" y="52" width="30" height="18" rx="5" class="fill-blue-800" />
    {:else if graphic === "byt"}
      <rect x="10" y="8" width="60" height="64" rx="14" class="fill-white" />
      <circle cx="40" cy="30" r="13" class="fill-blue-700" />
      <path d="M16 58c2-12 12-18 24-18s22 6 24 18" class="fill-blue-200" />
      <rect x="10" y="50" width="60" height="22" rx="14" class="fill-blue-800" />
      <rect x="10" y="50" width="60" height="12" class="fill-blue-800" />
      <text
        x="40"
        y="66"
        text-anchor="middle"
        class="fill-white"
        font-family="var(--font-reading), Georgia, serif"
        font-size="13"
        font-weight="700">som</text
      >
    {:else if graphic === "mat"}
      <rect x="10" y="18" width="60" height="38" rx="8" class="fill-white" />
      <rect
        x="10"
        y="18"
        width="60"
        height="38"
        rx="8"
        class="stroke-emerald-600"
        stroke-width="3"
      />
      <circle cx="28" cy="37" r="7" class="fill-emerald-600" />
      <path
        d="M42 32h20M42 42h14"
        class="stroke-emerald-700"
        stroke-width="3.5"
        stroke-linecap="round"
      />
      <path
        d="M22 66h36"
        class="stroke-emerald-400"
        stroke-width="4"
        stroke-linecap="round"
      />
    {:else if graphic === "stress"}
      <path
        d="M12 28h10l14-12v48L22 52H12a6 6 0 0 1-6-6V34a6 6 0 0 1 6-6Z"
        class="fill-white"
      />
      <path
        d="M44 32a12 12 0 0 1 0 16"
        class="stroke-blue-200"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M52 24a22 22 0 0 1 0 32"
        class="stroke-blue-300"
        stroke-width="4"
        stroke-linecap="round"
      />
      <path
        d="M60 16a32 32 0 0 1 0 48"
        class="stroke-white"
        stroke-width="4"
        stroke-linecap="round"
      />
    {:else if graphic === "phrase-stress"}
      <rect x="12" y="14" width="16" height="52" rx="6" class="fill-blue-800" />
      <rect x="32" y="32" width="16" height="34" rx="6" class="fill-blue-300" />
      <rect x="52" y="40" width="16" height="26" rx="6" class="fill-blue-200" />
    {:else}
      <rect x="22" y="8" width="36" height="64" rx="6" class="fill-blue-100" />
      <path d="M22 8h36v28L40 28 22 36V8Z" class="fill-blue-700" />
    {/if}
  </svg>
</div>

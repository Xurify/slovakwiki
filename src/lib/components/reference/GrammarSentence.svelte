<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * One spoken sentence: its play button, the Slovak, and the English under it.
   * Example rows and contrast cards both use it, so their sentences line up alike.
   */
  let {
    audioKey,
    reserveAudio,
    english,
    children,
  }: {
    /** `data-audio-mount` key; omit when this sentence has no clip. */
    audioKey?: string;
    /** Keep the button's column when a neighbour has a clip, so the text lines up. */
    reserveAudio: boolean;
    english: string;
    /** The Slovak, with its words marked. */
    children: Snippet;
  } = $props();
</script>

<!-- The button's centre sits 16px down, level with the middle of the Slovak's
     lowercase letters (baseline at 20px, x-height 9px), which is where the eye
     reads the line; centring it on the line box left it looking high. -->
<div class="flex min-w-0 items-start gap-3">
  {#if reserveAudio}
    <span
      class="mt-0.5 inline-grid size-7 shrink-0 place-items-center"
      data-audio-mount={audioKey}
    ></span>
  {/if}

  <div class="min-w-0">
    <p
      class="m-0 pt-0.5 font-serif text-lg leading-snug font-semibold text-balance text-slate-900"
      lang="sk"
    >
      {@render children()}
    </p>

    <p class="m-0 mt-0.5 text-[0.95rem] leading-snug text-slate-600">{english}</p>
  </div>
</div>

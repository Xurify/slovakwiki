<script lang="ts">
  import AudioButton from "$lib/audio/AudioButton.svelte";

  let {
    audioSrc,
    audioText,
    english,
    hero = false,
    slovak,
    speaker,
  }: {
    audioSrc?: string;
    audioText?: string;
    english: string;
    /** Large Slovak for teach / preview moments. */
    hero?: boolean;
    slovak: string;
    speaker: string;
  } = $props();
</script>

<div
  class="rounded-(--frame-radius) bg-surface/80 px-5 py-4 shadow-(--shadow-border) sm:px-6 sm:py-5"
>
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0 flex-1">
      <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
        {speaker}
      </p>

      <p
        class="m-0 mt-2 font-serif font-semibold tracking-tight text-slate-900 {hero
          ? 'text-[clamp(1.5rem,3.6vw,2.15rem)] leading-[1.15]'
          : 'text-lg leading-snug'}"
        lang="sk"
      >
        {slovak}
      </p>

      <p class="m-0 mt-2 font-serif text-sm leading-relaxed text-slate-600">
        {english}
      </p>
    </div>

    {#if audioSrc}
      <AudioButton
        size={hero ? "md" : "sm"}
        src={audioSrc}
        text={audioText ?? slovak}
        label={`Listen: ${speaker}`}
      />
    {/if}
  </div>
</div>

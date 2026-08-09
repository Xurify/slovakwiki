<script lang="ts">
  import RichTeachingText from "$lib/components/practice/RichTeachingText.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { ClozeHint } from "$lib/content/learning-types";

  let {
    hint,
    variant = "inline",
  }: {
    hint: ClozeHint;
    variant?: "inline" | "rail";
  } = $props();
</script>

{#if variant === "inline"}
  <div class="border-l-4 border-blue-600 bg-blue-50 px-4 py-3">
    <Eyebrow compact>Grammar</Eyebrow>

    <RichTeachingText class="text-sm leading-6 text-slate-700" text={hint.note} />

    {#if hint.grammarTopicId}
      <TextLink class="mt-2 inline-block" href={`/grammar/${hint.grammarTopicId}`}>
        Open grammar topic
      </TextLink>
    {/if}
  </div>
{:else}
  <div class="border-t border-slate-200 pt-3 text-sm">
    <Eyebrow compact>Grammar hint</Eyebrow>

    <RichTeachingText class="leading-6 text-slate-700" text={hint.note} />

    {#if hint.grammarTopicId}
      <TextLink class="mt-2 inline-block" href={`/grammar/${hint.grammarTopicId}`}>
        Open grammar topic
      </TextLink>
    {/if}
  </div>
{/if}

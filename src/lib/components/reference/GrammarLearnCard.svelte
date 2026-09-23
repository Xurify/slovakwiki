<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { referenceCardClass } from "$lib/components/reference/reference-ui";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { lessonMotifId } from "$lib/lesson-story/lesson-motifs";

  export type GrammarPracticeLink = {
    href: string;
    title: string;
  };

  let {
    lessonLink,
    practice,
  }: {
    lessonLink?: { href: string; label: string };
    practice?: GrammarPracticeLink;
  } = $props();

  const lessonId = $derived(lessonLink?.href.replace(/^\/lessons\//, "") ?? "");
</script>

{#if lessonLink || practice}
  <article class={referenceCardClass} aria-labelledby="grammar-learn-heading">
    {#if lessonLink}
      <div class="relative h-28 overflow-hidden border-b border-slate-200/70">
        <img
          src={motifArtSrc(lessonMotifId(lessonId))}
          alt=""
          width="512"
          height="512"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 size-full object-cover"
        />
      </div>
    {/if}

    <div class="px-5 pt-4 pb-5">
      <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
        {lessonLink ? "Learn it in a lesson" : "Practice it"}
      </p>

      <h2
        id="grammar-learn-heading"
        class="m-0 mt-2 font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
      >
        {lessonLink ? lessonLink.label : practice?.title}
      </h2>

      <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
        {#if lessonLink}
          See this pattern used in a short scene, then correct it yourself.
        {:else}
          Short drills on this pattern, a couple of minutes each.
        {/if}
      </p>

      <div class="mt-5 flex flex-col gap-3">
        {#if lessonLink}
          <Button href={lessonLink.href} variant="accent" class="w-full px-4">
            Open the lesson
            <ArrowRight />
          </Button>
        {/if}

        {#if practice}
          {#if lessonLink}
            <a
              class="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline"
              href={practice.href}
            >
              Practice: {practice.title}
              <ArrowRight />
            </a>
          {:else}
            <Button href={practice.href} variant="accent" class="w-full px-4">
              Start the set
              <ArrowRight />
            </Button>
          {/if}
        {/if}
      </div>
    </div>
  </article>
{/if}

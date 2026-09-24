<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import { grammarEntries } from "$lib/catalog/entries";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { sentenceCase } from "$lib/catalog/search/ui";

  type QuestionPart = { text: string; sk?: boolean };

  const questions: { parts: QuestionPart[]; slug: string }[] = [
    {
      slug: "cases-overview",
      parts: [
        { text: "Why " },
        { text: "káva", sk: true },
        { text: " but " },
        { text: "Mám kávu", sk: true },
        { text: "?" },
      ],
    },
    {
      slug: "byt-present",
      parts: [{ text: "Som, si, je", sk: true }, { text: " — which one when?" }],
    },
    {
      slug: "aspect",
      parts: [
        { text: "Robiť", sk: true },
        { text: " or " },
        { text: "urobiť", sk: true },
        { text: "?" },
      ],
    },
    {
      slug: "ty-vs-vy",
      parts: [
        { text: "Ty", sk: true },
        { text: " or " },
        { text: "vy", sk: true },
        { text: " with someone new?" },
      ],
    },
    {
      slug: "numbers-and-numerals",
      parts: [
        { text: "Why " },
        { text: "tri hodiny", sk: true },
        { text: " but " },
        { text: "päť hodín", sk: true },
        { text: "?" },
      ],
    },
    {
      slug: "telling-time",
      parts: [
        { text: "Is " },
        { text: "pol tretej", sk: true },
        { text: " 2:30 or 3:30?" },
      ],
    },
  ];

  const rows = questions.flatMap((question) => {
    const topic = grammarEntries.find((entry) => entry.slug === question.slug);
    return topic ? [{ ...question, title: sentenceCase(topic.english) }] : [];
  });
</script>

<article
  class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
  aria-labelledby="grammar-questions-heading"
>
  <div class="relative h-32 overflow-hidden border-b border-slate-200/70">
    <img
      src={motifArtSrc("questions")}
      alt=""
      width="512"
      height="512"
      decoding="async"
      class="absolute inset-0 size-full object-cover"
    />
  </div>

  <div class="px-5 pt-4 pb-3">
    <p class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase">
      Quick answers
    </p>

    <h2
      id="grammar-questions-heading"
      class="m-0 mt-2 font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
    >
      Stuck on something?
    </h2>
  </div>

  <ul class="m-0 list-none divide-y divide-slate-200/70 border-t border-slate-200/70 p-0">
    {#each rows as row (row.slug)}
      <li>
        <a
          class="group flex items-center justify-between gap-3 px-5 py-3 no-underline transition-colors hover:bg-slate-50"
          href="/grammar/{row.slug}"
        >
          <span class="min-w-0">
            <span class="block text-sm leading-snug text-slate-900">
              {#each row.parts as part, index (index)}
                {#if part.sk}
                  <span class="font-serif font-semibold" lang="sk">{part.text}</span>
                {:else}
                  {part.text}
                {/if}
              {/each}
            </span>

            <span class="mt-0.5 block text-xs text-blue-800 group-hover:underline">
              {row.title}
            </span>
          </span>

          <ArrowRight class="text-slate-400 group-hover:text-blue-800" />
        </a>
      </li>
    {/each}
  </ul>

  <p class="m-0 border-t border-slate-200/70 px-5 py-3 text-sm text-slate-600">
    New to the terms?
    <a class="font-semibold text-blue-800 underline underline-offset-2" href="/glossary"
      >Open the glossary</a
    >
  </p>
</article>

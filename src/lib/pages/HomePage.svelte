<script lang="ts">
  import { grammarEntries, pronunciationEntries, words } from "$lib/content/data";
  import { lessonTracks, lessons } from "$lib/content/lessons";

  const featuredWord = words.find((word) => word.slug === "dakujem") ?? words[0];
  const popularWords = words.slice(0, 6);
  const trackLinks = lessonTracks.map((track) => ({ ...track, lesson: lessons.find((lesson) => lesson.track === track.id) }));
</script>

<main class="home-page">
  <section class="border-b border-slate-200 bg-slate-50">
    <div class="shell grid grid-cols-[minmax(320px,.88fr)_minmax(420px,1.12fr)] items-center gap-16 py-12 max-[900px]:grid-cols-1 max-[900px]:gap-7 max-[600px]:py-8">
      <div><p class="section-label">Slovak for English speakers</p><h1 class="max-w-2xl">Look it up. Learn it. Use it.</h1><p class="lead">A practical Slovak reference with short lessons and practice for the forms you want to remember.</p><div class="mt-6 flex max-w-xl flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-slate-300 pt-4"><strong class="font-serif text-base text-blue-800" lang="sk">Dobrý deň. Ako sa máte?</strong><span class="text-xs text-slate-500">Good day. How are you?</span></div></div>
      <form class="rounded-lg bg-slate-800 p-6 text-white shadow-lg max-[600px]:p-4" action="/search" method="get" role="search">
        <label class="mb-2 block text-sm font-semibold" for="home-search">Search the reference</label>
        <div class="flex min-h-[50px] rounded border border-white/30 bg-white focus-within:border-white focus-within:ring-4 focus-within:ring-white/20 max-[600px]:flex-col"><input class="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-slate-900 outline-0 max-[600px]:min-h-[46px]" id="home-search" name="q" type="search" placeholder="Try ďakujem, cases, or soft consonants"><button class="min-w-[92px] cursor-pointer rounded-r bg-rose-600 px-4 font-bold text-white hover:bg-rose-700 max-[600px]:min-h-[46px] max-[600px]:rounded-b max-[600px]:rounded-r-none" type="submit">Search</button></div>
        <p class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">Popular: {#each popularWords as word (word.slug)}<a class="text-white underline decoration-white/50 underline-offset-2" href="/dictionary/{word.slug}" lang="sk">{word.slovak}</a>{/each}</p>
      </form>
    </div>
  </section>

  <section class="shell grid grid-cols-[minmax(0,1.45fr)_minmax(310px,.8fr)] items-start gap-5 py-7 pb-16 max-[900px]:grid-cols-1">
    <div class="grid gap-5">
      <article class="rounded border border-slate-200 bg-white p-6">
        <div class="flex items-start justify-between gap-6 border-b border-slate-200 pb-4"><div><p class="section-label">Word to know</p><h2 class="text-4xl" lang="sk">{featuredWord.slovak}</h2></div><span class="text-sm font-semibold text-slate-600">{featuredWord.english}</span></div>
        <dl class="grid grid-cols-3 border-b border-slate-200 py-4"><div class="grid gap-1"><dt class="text-xs text-slate-500">Reference</dt><dd class="m-0 text-sm font-semibold">Dictionary</dd></div><div class="grid gap-1"><dt class="text-xs text-slate-500">Topic</dt><dd class="m-0 text-sm font-semibold">{featuredWord.category}</dd></div><div class="grid gap-1"><dt class="text-xs text-slate-500">See it in</dt><dd class="m-0 text-sm font-semibold">Polite speech</dd></div></dl>
        <blockquote class="my-4 border border-slate-200 border-l-4 border-l-blue-600 bg-slate-50 px-4 py-3"><p class="m-0 font-serif font-semibold" lang="sk">{featuredWord.examples[0].slovak}</p><footer class="mt-1 text-xs text-slate-500">{featuredWord.examples[0].english}</footer></blockquote><a class="text-link" href="/dictionary/{featuredWord.slug}">Open full entry <span aria-hidden="true">→</span></a>
      </article>

      <section class="rounded border border-slate-200 bg-white p-6" aria-labelledby="words-heading"><div class="flex items-start justify-between gap-6 border-b border-slate-200 pb-4"><div><p class="section-label">Dictionary</p><h2 id="words-heading" class="text-xl">Essential words</h2></div><a class="text-link" href="/wiki">Full index <span aria-hidden="true">→</span></a></div><ul class="m-0 grid list-none grid-cols-2 p-0 max-[600px]:grid-cols-1">{#each words.slice(0, 12) as word (word.slug)}<li class="border-b border-slate-200 odd:border-r max-[600px]:odd:border-r-0"><a class="grid min-h-12 grid-cols-[minmax(90px,.75fr)_1fr_auto] items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50" href="/dictionary/{word.slug}"><strong class="font-serif text-blue-800">{word.slovak}</strong><span class="text-slate-500">{word.english}</span><span aria-hidden="true">›</span></a></li>{/each}</ul></section>
    </div>

    <aside class="grid gap-5">
      <section class="border-t-4 border-blue-700 pt-5" aria-labelledby="reference-heading"><div class="flex items-start justify-between gap-6 border-b border-slate-200 pb-4"><div><p class="section-label">Reference</p><h2 id="reference-heading" class="text-xl">Browse by topic</h2></div><a class="text-link" href="/wiki">All <span aria-hidden="true">→</span></a></div><nav class="grid" aria-label="Reference sections">{#each [{href:"/wiki",title:"Dictionary",desc:"Words, meanings, and examples"},{href:"/grammar",title:"Grammar",desc:"Patterns, cases, and conjugations"},{href:"/pronunciation",title:"Pronunciation",desc:"Sounds, stress, and spelling"},{href:"/grammar/terms",title:"Language terms",desc:"Plain explanations of the terminology"}] as item (item.href)}<a class="grid gap-1 border-b border-slate-200 px-1.5 py-3 hover:bg-slate-50" href={item.href}><strong class="font-serif text-blue-800">{item.title}</strong><small class="text-xs text-slate-500">{item.desc}</small></a>{/each}</nav><div class="mt-5"><h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Grammar entries</h3><ul class="m-0 list-none p-0">{#each grammarEntries.slice(0, 3) as entry (entry.slug)}<li><a class="flex justify-between gap-3 border-b border-slate-200 px-1.5 py-2 font-serif text-sm text-blue-800" href="/grammar/{entry.slug}"><span>{entry.english}</span><small class="truncate text-slate-500" lang="sk">{entry.slovak}</small></a></li>{/each}</ul><h3 class="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Pronunciation entries</h3><ul class="m-0 list-none p-0">{#each pronunciationEntries.slice(0, 2) as entry (entry.slug)}<li><a class="flex justify-between gap-3 border-b border-slate-200 px-1.5 py-2 font-serif text-sm text-blue-800" href="/pronunciation/{entry.slug}"><span>{entry.english}</span><small class="truncate text-slate-500" lang="sk">{entry.slovak}</small></a></li>{/each}</ul></div></section>
      <section class="border-t-4 border-emerald-700 pt-5" aria-labelledby="lessons-heading"><div class="flex items-start justify-between gap-6 border-b border-slate-200 pb-4"><div><p class="section-label">Lessons</p><h2 id="lessons-heading" class="text-xl">Start with a scene</h2></div><a class="text-link" href="/lessons">All lessons <span aria-hidden="true">→</span></a></div><p class="my-4 font-serif text-sm leading-6 text-slate-700">See Slovak in context, notice the pattern, then make your own sentence.</p><nav class="grid border-t border-slate-200" aria-label="Lesson tracks">{#each trackLinks as item (item.id)}{#if item.lesson}<a class="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-slate-200 px-1.5 py-3 hover:bg-slate-50" href="/lessons/{item.lesson.track}/{item.lesson.slug}"><span class="font-serif text-sm text-blue-800">{item.title}</span><small class="text-right text-xs text-slate-500">{item.lesson.title} <b class="text-blue-800" aria-hidden="true">→</b></small></a>{/if}{/each}</nav></section>
      <section class="border-t-4 border-rose-600 pt-5" aria-labelledby="practice-heading"><div><p class="section-label">Practice</p><h2 id="practice-heading" class="text-xl">Keep the hard parts close</h2></div><p class="my-4 font-serif text-sm leading-6 text-slate-700">Review missed or revealed forms, or practise a lesson again.</p><a class="button w-full gap-2" href="/practice">Open Practice <span aria-hidden="true">→</span></a></section>
    </aside>
  </section>
</main>

<style>
  .home-page > section:first-child {
    background: color-mix(in srgb, var(--surface-subtle) 68%, transparent);
  }

  .home-page article,
  .home-page section[aria-labelledby] {
    border: 0;
    border-radius: var(--frame-radius);
    box-shadow: var(--shadow-border);
    transition-property: box-shadow, transform;
    transition-duration: 160ms;
    transition-timing-function: ease-out;
  }

  .home-page article:hover,
  .home-page section[aria-labelledby]:hover {
    box-shadow: var(--shadow-border-hover);
  }

  .home-page aside section[aria-labelledby] {
    padding: 1.25rem;
    background: color-mix(in srgb, var(--surface) 92%, transparent);
  }

  .home-page aside section[aria-labelledby] > div:first-child {
    padding-bottom: 0.9rem;
  }

  .home-page article blockquote {
    border-radius: calc(var(--control-radius) - 2px);
  }

  .home-page form button,
  .home-page .button {
    transition-property: background-color, box-shadow, transform, scale;
  }

  .home-page article > div:first-child,
  .home-page section[aria-labelledby] > div:first-child,
  .home-page aside section > div:first-child {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-6);
    border-bottom: 1px solid var(--line);
    padding-bottom: var(--space-4);
  }

  .home-page article > div:first-child > :first-child,
  .home-page section[aria-labelledby] > div:first-child > :first-child,
  .home-page aside section > div:first-child > :first-child {
    min-width: 0;
  }

  @media (max-width: 600px) {
    .home-page article > div:first-child,
    .home-page section[aria-labelledby] > div:first-child,
    .home-page aside section > div:first-child {
      gap: var(--space-4);
    }
  }
</style>

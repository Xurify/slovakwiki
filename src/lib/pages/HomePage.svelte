<script lang="ts">
  import { button, cx, lead, sectionLabel, shell, textLink } from "$lib/ui/classes";

  import { grammarEntries, pronunciationEntries, words } from "$lib/content/data";
  import { lessonTracks, lessons } from "$lib/content/lessons";

  const featuredWord = words.find((word) => word.slug === "dakujem") ?? words[0];
  const popularWords = words.slice(0, 6);

  const trackLinks = lessonTracks.map((track) => ({
    ...track,
    lesson: lessons.find((lesson) => lesson.track === track.id),
  }));

  const referenceSections = [
    { href: "/wiki", title: "Dictionary", desc: "Words, meanings, and examples" },
    { href: "/grammar", title: "Grammar", desc: "Patterns, cases, and conjugations" },
    {
      href: "/pronunciation",
      title: "Pronunciation",
      desc: "Sounds, stress, and spelling",
    },
    {
      href: "/grammar/terms",
      title: "Language terms",
      desc: "Plain explanations of the terminology",
    },
  ];

  const panelClass = cx(
    "rounded-(--frame-radius) border-0 bg-white p-6 shadow-(--shadow-border)",
    "transition-[box-shadow,transform] duration-160 ease-out",
    "hover:shadow-(--shadow-border-hover)",
  );
  const asidePanelClass = cx(
    "rounded-(--frame-radius) border-0 p-5 shadow-(--shadow-border)",
    "bg-[color-mix(in_srgb,var(--surface)_92%,transparent)]",
    "transition-[box-shadow,transform] duration-160 ease-out",
    "hover:shadow-(--shadow-border-hover)",
  );
  const headingRowClass = cx(
    "flex items-start justify-between gap-6 border-b border-slate-200 pb-4",
    "max-[600px]:gap-4 [&_:first-child]:min-w-0",
  );
</script>

<main>
  <section
    class="border-b border-slate-200 bg-[color-mix(in_srgb,var(--surface-subtle)_68%,transparent)]"
  >
    <div
      class={cx(
        shell,
        "grid grid-cols-[minmax(320px,.88fr)_minmax(420px,1.12fr)] items-center gap-16 py-12",
        "max-[900px]:grid-cols-1 max-[900px]:gap-7 max-[600px]:py-8",
      )}
    >
      <div>
        <p class={sectionLabel}>Slovak for English speakers</p>
        <h1 class="max-w-2xl">Look it up. Learn it. Use it.</h1>
        <p class={lead}>
          A practical Slovak reference with short lessons and practice for the forms you
          want to remember.
        </p>

        <div
          class="mt-6 flex max-w-xl flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-slate-300 pt-4"
        >
          <strong class="font-serif text-base text-blue-800" lang="sk">
            Dobrý deň. Ako sa máte?
          </strong>
          <span class="text-xs text-slate-500">Good day. How are you?</span>
        </div>
      </div>

      <form
        class="rounded-lg bg-slate-800 p-6 text-white shadow-lg max-[600px]:p-4"
        action="/search"
        method="get"
        role="search"
      >
        <label class="mb-2 block text-sm font-semibold" for="home-search">
          Search the reference
        </label>
        <div
          class="flex min-h-[50px] rounded border border-white/30 bg-white max-[600px]:flex-col"
        >
          <input
            class="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-slate-900 outline-none max-[600px]:min-h-[46px]"
            id="home-search"
            name="q"
            type="search"
            placeholder="Try ďakujem, cases, or soft consonants"
          />
          <button
            class="min-w-[92px] cursor-pointer rounded-r bg-rose-600 px-4 font-bold text-white transition-[background-color,box-shadow,transform,scale] hover:bg-rose-700 max-[600px]:min-h-[46px] max-[600px]:rounded-b max-[600px]:rounded-r-none"
            type="submit"
          >
            Search
          </button>
        </div>
        <p class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
          Popular:
          {#each popularWords as word (word.slug)}
            <a
              class="text-white underline decoration-white/50 underline-offset-2"
              href="/dictionary/{word.slug}"
              lang="sk"
            >
              {word.slovak}
            </a>
          {/each}
        </p>
      </form>
    </div>
  </section>

  <section
    class={cx(
      shell,
      "grid grid-cols-[minmax(0,1.45fr)_minmax(310px,.8fr)] items-start gap-5 py-7 pb-16",
      "max-[900px]:grid-cols-1",
    )}
  >
    <div class="grid gap-5">
      <article class={panelClass}>
        <div class={headingRowClass}>
          <div class="min-w-0">
            <p class={sectionLabel}>Word to know</p>
            <h2 class="text-4xl" lang="sk">{featuredWord.slovak}</h2>
          </div>
          <span class="text-sm font-semibold text-slate-600">{featuredWord.english}</span>
        </div>

        <dl
          class="grid grid-cols-3 gap-3 border-b border-slate-200 py-4 max-[600px]:grid-cols-1"
        >
          <div class="grid gap-1">
            <dt class="text-xs text-slate-500">Reference</dt>
            <dd class="m-0 text-sm font-semibold">Dictionary</dd>
          </div>
          <div class="grid gap-1">
            <dt class="text-xs text-slate-500">Topic</dt>
            <dd class="m-0 text-sm font-semibold">{featuredWord.category}</dd>
          </div>
          <div class="grid gap-1">
            <dt class="text-xs text-slate-500">See it in</dt>
            <dd class="m-0 text-sm font-semibold">Polite speech</dd>
          </div>
        </dl>

        <blockquote
          class="my-4 rounded-[calc(var(--control-radius)-2px)] border border-slate-200 border-l-4 border-l-blue-600 bg-slate-50 px-4 py-3"
        >
          <p class="m-0 font-serif font-semibold" lang="sk">
            {featuredWord.examples[0].slovak}
          </p>
          <footer class="mt-1 text-xs text-slate-500">
            {featuredWord.examples[0].english}
          </footer>
        </blockquote>

        <a class={textLink} href="/dictionary/{featuredWord.slug}">
          Open full entry <span aria-hidden="true">→</span>
        </a>
      </article>

      <section class={panelClass} aria-labelledby="words-heading">
        <div class={headingRowClass}>
          <div class="min-w-0">
            <p class={sectionLabel}>Dictionary</p>
            <h2 id="words-heading" class="text-xl">Essential words</h2>
          </div>
          <a class={textLink} href="/wiki">
            Full index <span aria-hidden="true">→</span>
          </a>
        </div>

        <ul class="m-0 grid list-none grid-cols-2 p-0 max-[600px]:grid-cols-1">
          {#each words.slice(0, 12) as word (word.slug)}
            <li class="border-b border-slate-200 odd:border-r max-[600px]:odd:border-r-0">
              <a
                class="grid min-h-12 grid-cols-[minmax(90px,.75fr)_1fr_auto] items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50"
                href="/dictionary/{word.slug}"
              >
                <strong class="font-serif text-blue-800">{word.slovak}</strong>
                <span class="text-slate-500">{word.english}</span>
                <span aria-hidden="true">›</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    </div>

    <aside class="grid gap-5">
      <section class={asidePanelClass} aria-labelledby="reference-heading">
        <div class={headingRowClass}>
          <div class="min-w-0">
            <p class={sectionLabel}>Reference</p>
            <h2 id="reference-heading" class="text-xl">Browse by topic</h2>
          </div>
          <a class={textLink} href="/wiki">All <span aria-hidden="true">→</span></a>
        </div>

        <nav class="grid" aria-label="Reference sections">
          {#each referenceSections as item (item.href)}
            <a
              class="grid gap-1 border-b border-slate-200 px-1.5 py-3 hover:bg-slate-50"
              href={item.href}
            >
              <strong class="font-serif text-blue-800">{item.title}</strong>
              <small class="text-xs text-slate-500">{item.desc}</small>
            </a>
          {/each}
        </nav>

        <div class="mt-5">
          <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Grammar entries
          </h3>
          <ul class="m-0 list-none p-0">
            {#each grammarEntries.slice(0, 3) as entry (entry.slug)}
              <li>
                <a
                  class="flex justify-between gap-3 border-b border-slate-200 px-1.5 py-2 font-serif text-sm text-blue-800"
                  href="/grammar/{entry.slug}"
                >
                  <span>{entry.english}</span>
                  <small class="truncate text-slate-500" lang="sk">{entry.slovak}</small>
                </a>
              </li>
            {/each}
          </ul>

          <h3
            class="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Pronunciation entries
          </h3>
          <ul class="m-0 list-none p-0">
            {#each pronunciationEntries.slice(0, 2) as entry (entry.slug)}
              <li>
                <a
                  class="flex justify-between gap-3 border-b border-slate-200 px-1.5 py-2 font-serif text-sm text-blue-800"
                  href="/pronunciation/{entry.slug}"
                >
                  <span>{entry.english}</span>
                  <small class="truncate text-slate-500" lang="sk">{entry.slovak}</small>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </section>

      <section class={asidePanelClass} aria-labelledby="lessons-heading">
        <div class={headingRowClass}>
          <div class="min-w-0">
            <p class={sectionLabel}>Lessons</p>
            <h2 id="lessons-heading" class="text-xl">Start with a scene</h2>
          </div>
          <a class={textLink} href="/lessons">
            All lessons <span aria-hidden="true">→</span>
          </a>
        </div>

        <p class="my-4 font-serif text-sm leading-6 text-slate-700">
          See Slovak in context, notice the pattern, then make your own sentence.
        </p>

        <nav class="grid border-t border-slate-200" aria-label="Lesson tracks">
          {#each trackLinks as item (item.id)}
            {#if item.lesson}
              <a
                class="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-slate-200 px-1.5 py-3 hover:bg-slate-50"
                href="/lessons/{item.lesson.track}/{item.lesson.slug}"
              >
                <span class="font-serif text-sm text-blue-800">{item.title}</span>
                <small class="text-right text-xs text-slate-500">
                  {item.lesson.title}
                  <b class="text-blue-800" aria-hidden="true">→</b>
                </small>
              </a>
            {/if}
          {/each}
        </nav>
      </section>

      <section class={asidePanelClass} aria-labelledby="practice-heading">
        <div class={headingRowClass}>
          <div class="min-w-0">
            <p class={sectionLabel}>Practice</p>
            <h2 id="practice-heading" class="text-xl">Keep the hard parts close</h2>
          </div>
        </div>

        <p class="my-4 font-serif text-sm leading-6 text-slate-700">
          Review missed or revealed forms, or practise a lesson again.
        </p>

        <a
          class={cx(
            button,
            "w-full gap-2 transition-[background-color,box-shadow,transform,scale]",
          )}
          href="/practice"
        >
          Open Practice <span aria-hidden="true">→</span>
        </a>
      </section>
    </aside>
  </section>
</main>

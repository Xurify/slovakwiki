<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { lessonPath } from "$lib/content/lessons";

  let { data } = $props();
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/lessons">Lessons</TextLink>
      <span aria-hidden="true">/</span>
      <span>{data.track.title}</span>
    </nav>

    <header class="max-w-[640px] border-b border-slate-200 pb-8">
      <h1>{data.track.title}</h1>
      <Lead>{data.track.description}</Lead>
    </header>

    <section class="mt-2" aria-labelledby="lesson-list-heading">
      <h2 id="lesson-list-heading" class="sr-only">Lessons</h2>
      <ol class="m-0 list-none p-0">
        {#each data.lessons as lesson, index (lesson.id)}
          <li class="border-b border-slate-200">
            <a
              class="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-start gap-4 -mx-4 px-4 py-6 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_50%,transparent)]"
              href={lessonPath(lesson)}
            >
              <span class="pt-1 font-sans text-xs font-bold tabular-nums text-slate-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div class="grid gap-1">
                {#if lesson.group}
                  <small
                    class="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-slate-500"
                  >
                    {lesson.group}
                  </small>
                {/if}
                <strong class="font-serif text-xl text-blue-800">{lesson.title}</strong>
                <p class="m-0 font-serif text-sm leading-relaxed text-slate-600">
                  {lesson.promise}
                </p>
              </div>
              <ArrowRight class="mt-1 text-blue-800" />
            </a>
          </li>
        {/each}
      </ol>
    </section>
  </PageShell>
</main>

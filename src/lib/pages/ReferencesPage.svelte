<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { referenceGroups, referencesByGroup } from "$lib/content/references";

  const groupBlockClass = "mt-12 border-t border-slate-200 pt-10";
  const sourceBlockClass = "mt-8 first:mt-6";
  const linkListClass = "mt-3 space-y-2 text-sm";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/dictionary">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span>References</span>
    </nav>

    <header class="max-w-[640px]">
      <Eyebrow>Attribution</Eyebrow>
      <h1>References</h1>
      <Lead>
        Trusted sources behind dictionary entries, frequency lists, and optional example
        sentences.
      </Lead>
    </header>

    {#each referenceGroups as group (group.id)}
      <section class={groupBlockClass} aria-labelledby="ref-{group.id}">
        <h2 id="ref-{group.id}" class="font-serif text-2xl text-blue-800">
          {group.title}
        </h2>
        <p
          class="mt-2 max-w-[56ch] font-serif text-[1.02rem] leading-relaxed text-slate-600"
        >
          {group.summary}
        </p>

        {#each referencesByGroup(group.id) as source (source.id)}
          <article class={sourceBlockClass}>
            <h3 class="font-serif text-lg font-semibold text-slate-900">{source.name}</h3>
            <p class="mt-1 max-w-[56ch] text-sm leading-relaxed text-slate-600">
              {source.usedFor}
            </p>

            {#if source.license}
              <p class="mt-2 text-xs text-slate-500">{source.license}</p>
            {/if}

            <ul class={linkListClass}>
              {#each source.links as link (link.href)}
                <li>
                  <a
                    class="text-blue-800 underline decoration-slate-300 underline-offset-2 hover:decoration-blue-800"
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                  {#if link.note}
                    <span class="mt-0.5 block text-xs text-slate-500">{link.note}</span>
                  {/if}
                </li>
              {/each}
            </ul>
          </article>
        {/each}
      </section>
    {/each}
  </PageShell>
</main>

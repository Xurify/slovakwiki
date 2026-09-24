<script lang="ts">
  import type { Snippet } from "svelte";

  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  interface Crumb {
    href: string;
    label: string;
  }

  let {
    crumbs,
    eyebrow,
    slovak,
    english,
    summary,
    art,
    children,
  }: {
    crumbs: Crumb[];
    eyebrow?: string;
    /** Display word set large above the English title. */
    slovak: string;
    english: string;
    summary: string;
    art: string;
    /** Extra line under the title (e.g. case question words). */
    children?: Snippet;
  } = $props();

  const glyph = $derived(
    [...slovak].find((letter) => /[áäčďéíĺľňóôŕšťúýž]/i.test(letter)) ?? "",
  );
</script>

<header class="relative isolate pt-14 pb-16 max-[600px]:pt-8 max-[600px]:pb-12">
  {#if glyph}
    <span
      class="pointer-events-none absolute top-2 right-[18%] -z-10 rotate-6 font-serif text-[clamp(8rem,20vw,15rem)] leading-none font-semibold text-slate-900/[0.045] select-none max-[700px]:right-0"
      aria-hidden="true"
      lang="sk"
    >
      {glyph}
    </span>
  {/if}

  <nav class="mb-8 flex flex-wrap gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
    {#each crumbs as crumb, index (crumb.href)}
      {#if index > 0}
        <span aria-hidden="true">/</span>
      {/if}

      <TextLink href={crumb.href}>{crumb.label}</TextLink>
    {/each}
  </nav>

  <div
    class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-12 gap-y-8 max-[700px]:grid-cols-1"
  >
    <div class="max-w-160 min-w-0">
      {#if eyebrow}
        <Eyebrow>{eyebrow}</Eyebrow>
      {/if}

      <h1 class="m-0">
        <span
          class="block font-serif text-[clamp(3rem,7.5vw,5.25rem)] leading-[0.95] font-semibold tracking-[-0.05em] text-balance text-slate-900"
          lang="sk"
        >
          {slovak}
        </span>

        <span
          class="mt-4 block font-sans text-[clamp(1.2rem,2.3vw,1.5rem)] leading-snug font-semibold tracking-[-0.025em] text-slate-700"
        >
          {english}
        </span>
      </h1>

      {#if children}
        {@render children()}
      {/if}

      <Lead class="text-pretty">{summary}</Lead>
    </div>

    <img
      src={art}
      alt=""
      width="512"
      height="512"
      decoding="async"
      class="size-44 rotate-2 rounded-(--frame-radius) object-cover shadow-(--shadow-border) max-[700px]:hidden"
    />
  </div>
</header>

<script lang="ts" module>
  export interface StripLink {
    eyebrow: string;
    label: string;
    href: string;
    rel?: string;
  }
</script>

<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";

  let { links, label }: { links: StripLink[]; label: string } = $props();
</script>

{#if links.length > 0}
  <nav
    class="grid gap-x-10 gap-y-5 border-t border-slate-200 py-7 sm:grid-cols-3 max-[560px]:py-5"
    aria-label={label}
  >
    {#each links as link (link.href)}
      <a class="group block no-underline" href={link.href} rel={link.rel}>
        <Eyebrow tone="muted" compact>{link.eyebrow}</Eyebrow>

        <span
          class="flex items-baseline gap-2 font-serif text-[1.15rem] leading-snug font-semibold tracking-[-0.02em] text-slate-900 group-hover:text-blue-800"
        >
          {link.label}
          <ArrowRight class="shrink-0 text-slate-400 group-hover:text-blue-800" />
        </span>
      </a>
    {/each}
  </nav>
{/if}

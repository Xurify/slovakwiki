<script lang="ts" module>
  export interface LeaderLink {
    href: string;
    primary: string;
    secondary: string;
    slug: string;
  }
</script>

<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";

  import { grammarLeaderClass } from "$lib/components/reference/grammar-topic-ui";

  let {
    title,
    links,
    primaryLang,
  }: {
    title: string;
    links: LeaderLink[];
    /** Which side is Slovak; the other is English. */
    primaryLang: "sk" | "en";
  } = $props();
</script>

{#if links.length > 0}
  <section aria-label={title}>
    <Eyebrow tone="muted" compact>{title}</Eyebrow>

    <ul class="m-0 list-none p-0">
      {#each links as link (link.slug)}
        <li>
          <a class="group flex items-baseline gap-2 py-1.5 no-underline" href={link.href}>
            <span
              class="font-serif text-[1.02rem] text-slate-900 group-hover:text-blue-800"
              lang={primaryLang === "sk" ? "sk" : undefined}
            >
              {link.primary}
            </span>

            <span class={grammarLeaderClass} aria-hidden="true"></span>

            <span
              class="text-right text-[0.8rem] text-slate-500"
              lang={primaryLang === "sk" ? undefined : "sk"}
            >
              {link.secondary}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

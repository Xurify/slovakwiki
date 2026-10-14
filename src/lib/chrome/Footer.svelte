<script lang="ts">
  import BrandLockup from "$lib/components/ui/BrandLockup.svelte";

  const links = [
    { href: "/lessons", label: "Lessons" },
    { href: "/dictionary", label: "Dictionary" },
    { href: "/dictionary/common/verb", label: "Most common" },
    { href: "/practice", label: "Practice" },
    { href: "/resources", label: "Resources" },
    { href: "/references", label: "References" },
    { href: "/downloads", label: "Downloads" },
  ];
</script>

<footer class="bg-panel-inverse text-panel-inverse-ink">
  <div
    class="mx-auto flex w-[min(var(--workspace-max),calc(100%-48px))] items-center justify-between gap-6 py-10 max-[800px]:w-[calc(100%-28px)] max-[480px]:w-[calc(100%-24px)] max-[680px]:flex-col max-[680px]:items-start"
  >
    <div>
      <BrandLockup size="footer" tone="inverse" />

      <p class="m-0 mt-1.5 text-[0.75rem] text-panel-inverse-ink/70">
        Reference and practice for English speakers.
      </p>
    </div>

    <nav
      class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] text-panel-inverse-ink/80"
      aria-label="Footer"
    >
      {#each links as link (link.href)}
        <a class="hover:text-panel-inverse-ink hover:underline" href={link.href}>
          {link.label}
        </a>
      {/each}
    </nav>
  </div>
</footer>

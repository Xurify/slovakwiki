<script lang="ts">
  import BrandLockup from "$lib/components/ui/BrandLockup.svelte";
</script>

<footer
  class="border-t border-(--line) bg-[color-mix(in_srgb,var(--paper)_70%,transparent)]"
>
  <div
    class="mx-auto flex w-[min(var(--workspace-max),calc(100%-48px))] items-center justify-between gap-6 py-8 max-[800px]:w-[calc(100%-28px)] max-[480px]:w-[calc(100%-24px)] max-[680px]:flex-col max-[680px]:items-start"
  >
    <div>
      <BrandLockup size="footer" />

      <p class="mt-1 text-[0.72rem] text-(--muted)">
        Reference and practice for English speakers.
      </p>
    </div>

    <nav
      class="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.74rem] text-(--muted-strong)"
      aria-label="Footer"
    >
      <a class="hover:text-(--accent-strong) hover:underline" href="/lessons">Lessons</a>
      <a class="hover:text-(--accent-strong) hover:underline" href="/dictionary"
        >Dictionary</a
      >
      <a
        class="hover:text-(--accent-strong) hover:underline"
        href="/dictionary/common/verb">Most common</a
      >
      <a class="hover:text-(--accent-strong) hover:underline" href="/practice">Practice</a
      >
      <a class="hover:text-(--accent-strong) hover:underline" href="/resources"
        >Resources</a
      >
      <a class="hover:text-(--accent-strong) hover:underline" href="/references"
        >References</a
      >
      <a class="hover:text-(--accent-strong) hover:underline" href="/downloads"
        >Downloads</a
      >
    </nav>
  </div>
</footer>

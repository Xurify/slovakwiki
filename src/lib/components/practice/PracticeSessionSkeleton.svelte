<script lang="ts">
  import SessionChrome from "$lib/components/learning/SessionChrome.svelte";

  let {
    title,
    subtitle,
    total,
    backHref = "/practice",
    backLabel = "Practice",
  }: {
    title: string;
    subtitle?: string;
    total: number;
    backHref?: string;
    backLabel?: string;
  } = $props();
</script>

<div class="mx-auto w-full max-w-[640px]" aria-busy="true" aria-label="Loading practice">
  <SessionChrome
    progressLabel="Practice progress"
    {backHref}
    {backLabel}
    {subtitle}
    {title}
    {total}
  />

  <section
    class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
  >
    <div class="grid gap-3 px-7 py-8 max-[560px]:px-4 max-[560px]:py-6">
      <span class="h-2.5 w-28 rounded-full bg-slate-200"></span>
      <span class="h-6 w-3/4 rounded-full bg-slate-200"></span>
      <span class="mt-3 h-14 rounded-(--control-radius) bg-slate-50"></span>
      <span class="h-14 rounded-(--control-radius) bg-slate-50"></span>
    </div>

    <div
      class="flex justify-end border-t border-slate-200 bg-subtle/60 px-7 py-5 max-[560px]:px-4 max-[560px]:py-4"
    >
      <span class="h-11 w-full rounded-(--control-radius) bg-slate-200 sm:w-36"></span>
    </div>
  </section>
</div>

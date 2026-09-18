<script lang="ts">
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { judgePickLabel } from "$lib/catalog/dictionary/image-judge";
  import {
    IMAGE_SOURCE_IDS,
    SOURCE_ORDERS,
    pickWinner,
    sourceLabel,
    type ImageSourceId,
    type ImageSourcePreviewRow,
  } from "$lib/catalog/dictionary/image-source-preview";

  let {
    generatedAt,
    judgedAt,
    judgeModel,
    rows,
  }: {
    generatedAt?: string;
    judgedAt?: string;
    judgeModel?: string;
    rows: ImageSourcePreviewRow[];
  } = $props();

  let orderId = $state(SOURCE_ORDERS[0]!.id);

  const order = $derived(
    SOURCE_ORDERS.find((item) => item.id === orderId)?.order ?? SOURCE_ORDERS[0]!.order,
  );

  function winnerFor(row: ImageSourcePreviewRow): ImageSourceId | undefined {
    return pickWinner(row.hits, order);
  }
</script>

<main class="py-12 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1180px]">
    <header class="max-w-[720px]">
      <p
        class="m-0 font-mono text-xs font-medium tracking-widest text-blue-700 uppercase"
      >
        Images
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-blue-950 sm:text-4xl">
        Source order preview
      </h1>
      <Lead class="mt-3">
        Blue ring = chain (first file in chip order). Green ring = agent / vision pick for
        the Slovak sense. Live catalog unchanged. Cursor-only: run
        <code class="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em]">
          bun scripts/images/judge.ts -- --agent
        </code>
        after a preview snapshot.
      </Lead>
      <p class="mt-3 m-0 text-sm text-slate-500">
        <a class="underline decoration-slate-300 hover:text-slate-800" href="/dev/images">
          Audit
        </a>
        {#if generatedAt}
          <span aria-hidden="true"> · </span>
          snapshot {generatedAt.slice(0, 16).replace("T", " ")} UTC
        {/if}
        {#if judgedAt}
          <span aria-hidden="true"> · </span>
          judged {judgedAt.slice(0, 16).replace("T", " ")} UTC
          {#if judgeModel}
            ({judgeModel})
          {/if}
        {/if}
      </p>
    </header>

    {#if rows.length === 0}
      <p class="mt-10 max-w-[40rem] text-slate-700">
        No snapshot. Run
        <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm">
          bun scripts/images/preview-sources.ts -- --limit 24
        </code>
        then refresh.
      </p>
    {:else}
      <div class="mt-8 flex flex-wrap gap-2">
        {#each SOURCE_ORDERS as preset (preset.id)}
          <button
            class="min-h-10 rounded-(--control-radius) px-3 text-sm font-semibold
              {orderId === preset.id
              ? 'bg-blue-600 text-paper'
              : 'bg-control text-blue-800 shadow-(--shadow-border)'}"
            type="button"
            onclick={() => {
              orderId = preset.id;
            }}
          >
            {preset.label}
          </button>
        {/each}
      </div>

      <ul class="mt-8 flex list-none flex-col gap-8 p-0">
        {#each rows as row (row.slug)}
          {@const winner = winnerFor(row)}
          {@const ai = row.aiPick}
          <li class="border-b border-slate-200 pb-8">
            <div class="mb-3">
              <a
                class="font-serif text-xl font-semibold text-blue-950 hover:underline"
                href="/dictionary/{row.slug}"
              >
                {row.slovak}
              </a>
              <p class="m-0 text-sm text-slate-600">
                {row.english}
                <span class="text-slate-400"> · {row.category}</span>
                {#if winner}
                  <span class="text-slate-400">
                    · chain {sourceLabel(winner)}
                  </span>
                {/if}
                {#if ai?.sourceId}
                  <span class="font-medium text-emerald-800">
                    · AI {judgePickLabel(ai.sourceId)}
                  </span>
                {:else if ai}
                  <span class="font-medium text-slate-600"> · AI none</span>
                {/if}
              </p>
              {#if ai?.reason}
                <p class="m-0 mt-1 text-sm text-slate-500">{ai.reason}</p>
              {/if}
            </div>

            <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <figure class="m-0">
                <div
                  class="overflow-hidden rounded-(--control-radius) border bg-slate-50
                    {ai?.sourceId === 'live'
                    ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                    : 'border-slate-200'}"
                >
                  {#if row.liveSrc}
                    <img
                      alt="Live {row.slovak}"
                      class="aspect-[4/3] h-auto w-full object-cover"
                      decoding="async"
                      loading="lazy"
                      src={row.liveSrc}
                    />
                  {:else}
                    <div
                      class="flex aspect-[4/3] items-center justify-center text-xs text-slate-400"
                    >
                      No live image
                    </div>
                  {/if}
                </div>
                <figcaption class="mt-1.5 text-xs text-slate-500">
                  Live
                  {#if ai?.sourceId === "live"}
                    <span class="font-semibold text-emerald-800"> · AI</span>
                  {/if}
                </figcaption>
              </figure>

              {#each IMAGE_SOURCE_IDS as sourceId (sourceId)}
                {@const hit = row.hits[sourceId]}
                <figure class="m-0">
                  <div
                    class="overflow-hidden rounded-(--control-radius) border bg-slate-50
                      {ai?.sourceId === sourceId
                      ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                      : winner === sourceId
                        ? 'border-blue-600 ring-2 ring-blue-600/30'
                        : 'border-slate-200'}"
                  >
                    {#if hit}
                      <img
                        alt="{sourceLabel(sourceId)} {row.slovak}"
                        class="aspect-[4/3] h-auto w-full object-cover"
                        decoding="async"
                        loading="lazy"
                        src={hit.thumbUrl}
                      />
                    {:else}
                      <div
                        class="flex aspect-[4/3] items-center justify-center text-xs text-slate-400"
                      >
                        Miss
                      </div>
                    {/if}
                  </div>
                  <figcaption class="mt-1.5 text-xs leading-snug text-slate-500">
                    {sourceLabel(sourceId)}
                    {#if ai?.sourceId === sourceId}
                      <span class="font-semibold text-emerald-800"> · AI</span>
                    {/if}
                    {#if winner === sourceId}
                      <span class="font-semibold text-blue-700"> · chain</span>
                    {/if}
                    {#if hit}
                      <span class="block break-all text-slate-400">{hit.fileTitle}</span>
                    {/if}
                  </figcaption>
                </figure>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </PageShell>
</main>

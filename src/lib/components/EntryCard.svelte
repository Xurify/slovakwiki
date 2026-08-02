<script lang="ts">
  import type { ContentEntry } from "$lib/content/types";

  let { entry }: { entry: ContentEntry } = $props();

  const routeBase = { grammar: "grammar", pronunciation: "pronunciation", word: "dictionary" };
  const kindLabel = { grammar: "Grammar", pronunciation: "Pronunciation", word: "Word" };
</script>

<a
  class="group grid min-h-[72px] grid-cols-[110px_minmax(180px,0.8fr)_minmax(260px,1.5fr)_20px] items-center gap-[18px] border-b border-slate-200 px-2.5 py-3 hover:bg-slate-50 max-[700px]:grid-cols-[88px_1fr_16px] max-[700px]:gap-2 max-[430px]:grid-cols-[1fr_16px] max-[430px]:px-2"
  href="/{routeBase[entry.kind]}/{entry.slug}"
>
  <span class="text-xs font-bold uppercase tracking-wide text-slate-500 max-[430px]:col-span-1"
    >{kindLabel[entry.kind]}</span
  >
  <span class="grid gap-0.5 max-[430px]:col-span-1">
    <strong class="font-serif text-base text-slate-800 hover:underline" lang="sk"
      >{entry.slovak}</strong
    >
    <small class="font-serif text-xs text-slate-600">{entry.english}</small>
  </span>
  <span
    class="text-sm leading-5 text-slate-700 max-[700px]:col-start-2 max-[700px]:mt-[-3px] max-[430px]:col-span-1"
    >{entry.summary}</span
  >
  <span
    class="text-xl text-blue-600 max-[700px]:col-start-3 max-[700px]:row-span-2 max-[430px]:col-start-2 max-[430px]:row-span-3"
    aria-hidden="true">›</span
  >
</a>

<script lang="ts">
  import { ClockIllustration } from "$lib/learning/time";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";

  let {
    lines,
    withClocks = false,
  }: {
    lines: string[];
    /** Show mini clock faces for `HH:MM → …` rows (telling-time). */
    withClocks?: boolean;
  } = $props();

  type TimeRow = {
    digital: string;
    hour: number;
    lookingAhead: boolean;
    minute: number;
    slovak: string;
  };

  type PairRow = { label: string; phrases: string[] };
  type PlainRow = { text: string };

  function splitPhrases(right: string): string[] {
    return right
      .split(/\s*·\s*/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function parseLine(line: string): TimeRow | PairRow | PlainRow {
    const arrow = line.indexOf("→");

    if (arrow === -1) {
      return { text: line };
    }

    const left = line.slice(0, arrow).trim();
    const right = line.slice(arrow + 1).trim();
    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(left);

    if (withClocks && timeMatch) {
      const hour = Number(timeMatch[1]);
      const minute = Number(timeMatch[2]);

      return {
        digital: left,
        hour,
        lookingAhead: minute !== 0,
        minute,
        slovak: right,
      };
    }

    return { label: left, phrases: splitPhrases(right) };
  }

  const rows = $derived(lines.map(parseLine));

  const timeRows = $derived(rows.filter((row): row is TimeRow => "digital" in row));
  const pairRows = $derived(rows.filter((row): row is PairRow => "label" in row));
  const plainRows = $derived(rows.filter((row): row is PlainRow => "text" in row));

  const hasSections = $derived(timeRows.length > 0 && pairRows.length > 0);
</script>

<div class="overflow-hidden rounded-lg border border-slate-200 bg-surface">
  {#if timeRows.length > 0}
    <ul class="m-0 list-none divide-y divide-slate-200 p-0" aria-label="Time patterns">
      {#each timeRows as row (row.digital + row.slovak)}
        <li
          class="grid grid-cols-[2.5rem_3.5rem_minmax(0,1fr)] items-center gap-x-3 border-l-2 px-4 py-2.5 motion-safe:transition-colors motion-safe:duration-150 hover:bg-slate-50 max-[420px]:grid-cols-[2.5rem_minmax(0,1fr)] max-[420px]:gap-x-2.5 {row.lookingAhead
            ? 'border-l-emerald-600 bg-emerald-50/30'
            : 'border-l-transparent'}"
        >
          <ClockIllustration
            hour={row.hour}
            minute={row.minute}
            label={row.digital}
            size={36}
          />

          <span
            class="font-sans text-[0.8125rem] font-semibold tabular-nums text-slate-500 max-[420px]:col-start-2"
          >
            {row.digital}
          </span>

          <p
            class="m-0 min-w-0 font-serif text-[0.95rem] leading-snug text-blue-800 max-[420px]:col-span-2 max-[420px]:col-start-2"
            lang="sk"
          >
            {row.slovak}
          </p>
        </li>
      {/each}
    </ul>
  {/if}

  {#if pairRows.length > 0}
    <div class={hasSections ? "border-t border-slate-200" : ""}>
      {#if hasSections}
        <div class="border-b border-slate-200 bg-slate-50/70 px-4 pt-3 pb-2">
          <Eyebrow tone="muted" compact class="!mb-0">Also</Eyebrow>
        </div>
      {/if}

      <ul
        class="m-0 list-none divide-y divide-slate-200 bg-slate-50/40 p-0"
        aria-label="Related patterns"
      >
        {#each pairRows as row (row.label + row.phrases.join())}
          <li
            class="grid grid-cols-[9rem_minmax(0,1fr)] items-baseline gap-x-4 border-l-2 border-l-transparent px-4 py-2.5 motion-safe:transition-colors motion-safe:duration-150 hover:bg-slate-50 max-[480px]:grid-cols-1 max-[480px]:gap-y-0.5"
          >
            <span class="text-sm text-slate-500">{row.label}</span>

            <p
              class="m-0 min-w-0 font-serif text-[0.95rem] leading-snug text-blue-800"
              lang="sk"
            >
              {row.phrases.join(" · ")}
            </p>
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if plainRows.length > 0}
    <ul
      class="m-0 list-none divide-y divide-slate-200 p-0 {timeRows.length > 0 ||
      pairRows.length > 0
        ? 'border-t border-slate-200'
        : ''}"
    >
      {#each plainRows as row (row.text)}
        <li
          class="px-4 py-2.5 font-serif text-[0.95rem] leading-snug text-blue-800 motion-safe:transition-colors motion-safe:duration-150 hover:bg-slate-50"
        >
          {row.text}
        </li>
      {/each}
    </ul>
  {/if}
</div>

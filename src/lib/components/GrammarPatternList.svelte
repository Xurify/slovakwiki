<script lang="ts">
  import ClockIllustration from "$lib/components/ClockIllustration.svelte";

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

  type PairRow = { left: string; right: string };
  type PlainRow = { text: string };

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

    return { left, right };
  }

  const rows = $derived(lines.map(parseLine));

  const timeRows = $derived(rows.filter((row): row is TimeRow => "digital" in row));
  const pairRows = $derived(rows.filter((row): row is PairRow => "left" in row));
  const plainRows = $derived(rows.filter((row): row is PlainRow => "text" in row));

  const hasSections = $derived(timeRows.length > 0 && pairRows.length > 0);
</script>

<div class="overflow-hidden rounded-lg border border-slate-200 bg-surface">
  {#if timeRows.length > 0}
    <ul class="m-0 list-none divide-y divide-slate-200 p-0" aria-label="Time patterns">
      {#each timeRows as row (row.digital + row.slovak)}
        <li
          class="grid grid-cols-[2.5rem_3.75rem_minmax(0,1fr)] items-center gap-x-3 px-4 py-2.5 motion-safe:transition-colors motion-safe:duration-200 hover:bg-blue-50/60 max-[420px]:grid-cols-[2.5rem_minmax(0,1fr)] max-[420px]:gap-x-2.5 {row.lookingAhead
            ? 'bg-emerald-50/45'
            : ''}"
        >
          <ClockIllustration
            hour={row.hour}
            minute={row.minute}
            label={row.digital}
            size={40}
          />

          <span
            class="font-sans text-sm font-semibold tabular-nums text-slate-600 max-[420px]:col-start-2"
          >
            {row.digital}
          </span>

          <p
            class="m-0 min-w-0 font-serif text-base leading-snug text-blue-800 max-[420px]:col-span-2 max-[420px]:col-start-2"
            lang="sk"
          >
            {row.slovak}
          </p>
        </li>
      {/each}
    </ul>
  {/if}

  {#if pairRows.length > 0}
    <ul
      class="m-0 list-none divide-y divide-slate-200 bg-slate-50/80 p-0 {hasSections
        ? 'border-t border-slate-200'
        : ''}"
      aria-label="Related patterns"
    >
      {#each pairRows as row (row.left + row.right)}
        <li
          class="grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-4 px-4 py-3 motion-safe:transition-colors motion-safe:duration-200 hover:bg-blue-50/60 max-[420px]:grid-cols-1 max-[420px]:gap-y-1"
        >
          <span
            class="text-[0.68rem] font-bold uppercase tracking-[0.07em] text-slate-500"
          >
            {row.left}
          </span>

          <span
            class="min-w-0 font-serif text-[0.95rem] leading-snug text-blue-800"
            lang="sk"
          >
            {row.right}
          </span>
        </li>
      {/each}
    </ul>
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
          class="px-4 py-3 font-serif text-base leading-snug text-blue-800 motion-safe:transition-colors motion-safe:duration-200 hover:bg-blue-50/60"
        >
          {row.text}
        </li>
      {/each}
    </ul>
  {/if}
</div>

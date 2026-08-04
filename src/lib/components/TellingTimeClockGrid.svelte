<script lang="ts">
  import ClockIllustration from "$lib/components/ClockIllustration.svelte";

  type GridItem = {
    english: string;
    hour: number;
    minute: number;
    note?: string;
    slovak: string;
  };

  const items: GridItem[] = [
    {
      hour: 1,
      minute: 0,
      slovak: "Je jedna hodina.",
      english: "It is one o’clock.",
    },
    {
      hour: 3,
      minute: 0,
      slovak: "Sú tri hodiny.",
      english: "It is three o’clock.",
    },
    {
      hour: 5,
      minute: 0,
      slovak: "Je päť hodín.",
      english: "It is five o’clock.",
    },
    {
      hour: 2,
      minute: 15,
      slovak: "Je štvrť na tri.",
      english: "It is quarter past two.",
      note: "Looking ahead to three.",
    },
    {
      hour: 2,
      minute: 30,
      slovak: "Je pol tretej.",
      english: "It is half past two.",
      note: "Halfway to three.",
    },
    {
      hour: 2,
      minute: 45,
      slovak: "Je trištvrte na tri.",
      english: "It is quarter to three.",
      note: "Three-quarters toward three.",
    },
    {
      hour: 12,
      minute: 0,
      slovak: "Je dvanásť hodín. / Je poludnie.",
      english: "It is twelve o’clock. / It is midday.",
    },
    {
      hour: 12,
      minute: 0,
      slovak: "Je polnoc.",
      english: "It is midnight.",
      note: "0:00 — same clock face as twelve, different word.",
    },
  ];
</script>

<ul
  class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-4 p-0"
  aria-label="Clock examples for telling time"
>
  {#each items as item, index (`${item.slovak}-${index}`)}
    <li
      class="grid justify-items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-4"
    >
      <ClockIllustration
        hour={item.hour}
        minute={item.minute}
        label={item.note?.startsWith("0:00")
          ? "0:00 midnight"
          : `${item.hour}:${String(item.minute).padStart(2, "0")}`}
        size={128}
      />
      <strong class="text-center font-serif text-sm leading-snug text-blue-800" lang="sk">
        {item.slovak}
      </strong>
      <span class="text-center text-xs leading-snug text-slate-500">{item.english}</span>
      {#if item.note}
        <small class="text-center font-serif text-xs leading-snug text-slate-600">
          {item.note}
        </small>
      {/if}
    </li>
  {/each}
</ul>

<script lang="ts">
  type LetterGroup = {
    label: string;
    tone: "plain" | "acute" | "caron" | "digraph";
    letters: string[];
  };

  let { class: className = "" }: { class?: string } = $props();

  const groups: LetterGroup[] = [
    {
      label: "Plain consonants and vowels",
      tone: "plain",
      letters: [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "ô",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
      ],
    },
    {
      label: "Acute vowels",
      tone: "acute",
      letters: ["á", "é", "í", "ó", "ú", "ý", "ä"],
    },
    {
      label: "Caron letters",
      tone: "caron",
      letters: ["č", "ď", "ľ", "ň", "š", "ť", "ž"],
    },
    {
      label: "Digraph",
      tone: "digraph",
      letters: ["ch"],
    },
  ];

  const toneClasses: Record<LetterGroup["tone"], string> = {
    plain: "border-slate-200 bg-slate-50",
    acute: "border-blue-200 bg-blue-50",
    caron: "border-rose-200 bg-rose-50",
    digraph: "border-emerald-200 bg-emerald-50",
  };
</script>

<div class="grid gap-5 {className}" aria-label="Slovak alphabet grouped by letter type">
  {#each groups as group (group.label)}
    <section aria-labelledby="{group.tone}-letters-heading">
      <h3
        id="{group.tone}-letters-heading"
        class="mb-2 text-sm font-semibold text-slate-700"
      >
        {group.label}
      </h3>

      <ul
        class="grid grid-cols-[repeat(auto-fit,minmax(3.25rem,1fr))] gap-2"
        aria-label={group.label}
      >
        {#each group.letters as letter (letter)}
          <li
            class="flex min-h-14 items-center justify-center rounded border font-serif text-2xl text-slate-800 {toneClasses[
              group.tone
            ]}"
            lang="sk"
          >
            {letter}
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</div>

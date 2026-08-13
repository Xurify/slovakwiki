<script lang="ts">
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { listedCharacters } from "$lib/content/character-ids";

  const roster = listedCharacters();
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <h1>Lesson faces</h1>
      <Lead>Every roster portrait. Unused voices have no dialogue speaker yet.</Lead>
    </header>

    <ul
      class="mt-12 grid list-none grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-4 p-0"
    >
      {#each roster as character (character.id)}
        <li
          class="flex flex-col items-center gap-3 rounded-(--frame-radius) bg-surface p-5 ring-1 ring-slate-200 ring-inset"
        >
          <LessonCharacterAvatar characterId={character.id} size="xl" />

          <div class="text-center">
            <p class="m-0 font-serif text-lg font-semibold text-blue-800">
              {character.displayName}
            </p>
            <p class="m-0 mt-0.5 font-sans text-xs tracking-wide text-slate-500">
              {character.id}
            </p>
            <p class="m-0 mt-1.5 font-sans text-sm text-slate-600">
              {character.speakers.length > 0
                ? character.speakers.join(", ")
                : "no speaker yet"}
            </p>
          </div>
        </li>
      {/each}
    </ul>
  </PageShell>
</main>

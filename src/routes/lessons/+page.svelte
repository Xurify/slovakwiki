<script lang="ts">
  import TrackCard from "$lib/components/lessons/TrackCard.svelte";
  import { lessonTracks, lessonsForTrack } from "$lib/content/lessons";
</script>

<svelte:head><title>Lessons | Slovak Wiki</title><meta name="description" content="Independent Slovak lessons for everyday language, grammar, and pronunciation."></svelte:head>

<main class="shell page max-w-[1050px] pt-14 max-[600px]:pt-8">
  <header class="max-w-[700px]"><p class="section-label">Lessons</p><h1>Learn Slovak in context</h1><p class="lead">Short, focused scenes that help you understand a pattern, then use it yourself.</p></header>
  <section class="mt-10 grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-1" aria-label="Lesson tracks">
    {#each lessonTracks as track (track.id)}
      {@const trackLessons = lessonsForTrack(track.id)}
      <TrackCard track={track} lessonCount={trackLessons.length} preview={trackLessons[0]?.keyPhrases[0]} />
    {/each}
  </section>
</main>

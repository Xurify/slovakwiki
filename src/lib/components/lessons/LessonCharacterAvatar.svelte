<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import StickHead from "$lib/components/stick-figure/StickHead.svelte";
  import { storyCastForId, storyCastForSpeaker } from "$lib/lesson-story/story-cast";
  import { LOOKS } from "$lib/stick-figure/looks";

  let {
    characterId,
    class: className = "",
    size = "md",
    speaker = "",
  }: {
    characterId?: LessonCharacterId;
    class?: string;
    size?: "sm" | "md" | "lg" | "xl";
    speaker?: string;
  } = $props();

  const cast = $derived(
    characterId ? storyCastForId(characterId) : storyCastForSpeaker(speaker),
  );
  const robot = $derived(LOOKS[cast.id].robot);
  const dog = $derived(LOOKS[cast.id].dog);
  const dim = $derived(
    size === "xl"
      ? "size-24"
      : size === "lg"
        ? "size-14"
        : size === "sm"
          ? "size-9"
          : "size-11",
  );
  const ground = $derived(
    cast.id === "alex" || cast.id === "lucia"
      ? "fill-portrait-ground-sage"
      : "fill-portrait-ground",
  );
</script>

<!--
  Portrait (64×64, read at 36px first): the head is StickHead, the one the
  stick figure wears on stage, seen from the front. Only the bust under it is
  drawn here, in the clothes StickTorso dresses the figure in, so a change to
  a face or a collar shows on the stage and beside the line alike.
-->

<span
  class="inline-grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-slate-200/80 ring-inset {dim} {className}"
  aria-hidden="true"
>
  <svg
    class="size-full"
    viewBox="0 0 64 64"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="32" cy="32" r="32" class={ground} />

    <StickHead characterId={cast.id} part="back" turn={0} />

    {#if dog}
      <!-- the dog's chest and red collar under the head -->
      <path
        d="M15 64c1-12 8-20 17-20s16 8 17 20Z"
        class="{dog.coat} stroke-portrait-ink"
        stroke-width="1.3"
      />
      <path d="M22 46.4q10 5 20 0" class={dog.collar} stroke-width="3" />
      <circle
        cx="32"
        cy="50.6"
        r="2"
        class="fill-scene-honey stroke-portrait-ink"
        stroke-width="0.8"
      />
    {:else if robot}
      <!-- light casing with the chest screen -->
      <rect
        x="29"
        y="42"
        width="6"
        height="4"
        rx="1.2"
        class="fill-portrait-vest stroke-portrait-ink"
        stroke-width="1.2"
      />
      <path
        d="M13 64c2-13 9-19 19-19s17 6 19 19Z"
        class="fill-portrait-bib stroke-portrait-ink"
        stroke-width="1.3"
      />
      <rect
        x="26.5"
        y="50.5"
        width="11"
        height="9"
        rx="2.4"
        class="fill-portrait-ink stroke-portrait-ink"
        stroke-width="0.9"
      />
      <circle cx="32" cy="55" r="1.8" class={robot.chest} />
    {:else}
      {#if cast.id === "alex"}
        <!-- blue zip hoodie over a white tee -->
        <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-blue-600" />
        <path d="M28.2 45.6 32 51.6 35.8 45.6Z" class="fill-portrait-bib" />
        <path d="M32 51.6V64" class="stroke-portrait-ink" stroke-width="0.9" />
      {:else if cast.id === "anna"}
        <!-- rose knit sweater over a white collar -->
        <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-rose-500" />
        <path
          d="M27.4 45.4Q29.8 50 32 47.8Q34.2 50 36.6 45.4Z"
          class="fill-portrait-bib stroke-portrait-ink"
          stroke-width="0.9"
        />
      {:else if cast.id === "lucia"}
        <!-- green A-line dress with a scoop neck and a shop name tag -->
        <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-emerald-600" />
        <path
          d="M27.6 45.4Q32 52 36.4 45.4Z"
          class="fill-portrait-skin stroke-portrait-ink"
          stroke-width="0.9"
        />
        <rect
          x="37.2"
          y="52.4"
          width="4.6"
          height="2.6"
          rx="0.5"
          class="fill-portrait-bib stroke-portrait-ink"
          stroke-width="0.7"
        />
      {:else if cast.id === "marek"}
        <!-- charcoal sweater over a collared shirt -->
        <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-portrait-vest" />
        <path
          d="M26.6 45.2 32 49.8 29.6 53.2ZM37.4 45.2 32 49.8 34.4 53.2Z"
          class="fill-portrait-bib stroke-portrait-ink"
          stroke-width="0.8"
        />
      {:else if cast.id === "maria"}
        <!-- rose cardigan open over a white blouse -->
        <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-rose-500" />
        <path d="M26.4 45.4 32 55.2 37.6 45.4Z" class="fill-portrait-bib" />
        <path
          d="M26.4 45.4 32 55.2 37.6 45.4"
          class="stroke-portrait-ink"
          stroke-width="1.25"
        />
        <path d="M32 55.2v8.6" class="stroke-portrait-ink" stroke-width="1.15" />
        <circle
          cx="32"
          cy="55.2"
          r="1.05"
          class="fill-portrait-bib stroke-portrait-ink"
          stroke-width="1"
        />
        <circle
          cx="32"
          cy="59.6"
          r="1.05"
          class="fill-portrait-bib stroke-portrait-ink"
          stroke-width="1"
        />
      {:else if cast.id === "receptionist"}
        <!-- blue blazer, white blouse -->
        <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-blue-600" />
        <path
          d="M26 45.6 32 52.2 38 45.6"
          class="stroke-portrait-bib"
          stroke-width="1.6"
        />
      {:else if cast.id === "waiter"}
        <!-- white shirt, dark waistcoat, bow tie -->
        <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-portrait-vest" />
        <path
          d="M25 46.5 22.4 64h19.2L39 46.5Q32 50.5 25 46.5Z"
          class="fill-portrait-bib"
        />
        <path
          d="M25 46.5 32 53.2 39 46.5"
          class="stroke-portrait-ink"
          stroke-width="1.35"
        />
        <path
          d="M28.4 45.2v4.2l3.6-2.1ZM35.6 45.2v4.2L32 47.3Z"
          class="fill-portrait-ink"
        />
      {/if}

      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
    {/if}

    <StickHead characterId={cast.id} turn={0} />
  </svg>
</span>

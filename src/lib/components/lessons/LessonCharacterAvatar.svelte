<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { storyCastForId, storyCastForSpeaker } from "$lib/lesson-story/story-cast";

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
  const hair = $derived(
    cast.id === "maria" ? "fill-portrait-hair-grey" : "fill-portrait-hair",
  );
</script>

<!--
  Portrait recipe (64×64, read at 44px first):
  - Shared skull: head ellipse 32,29 rx=13.2 ry=15.2. Do not restyle skin with UI 50/100.
  - Hair = a specific cut, not a blob. Name it (crop, side part, bob, bun) then draw that.
  - Short hair: ears visible, hair stops at ear-top, sideburns as thin ticks — not a helmet
    around the jaw and not a lid sitting on the forehead.
  - Long hair in a round bust: ONE mass behind the head (bob / lob / layers). Two
    separate side tails read as pigtails. Irregular hem. Part lives on the hairline.
  - Outer hair path: line segments / tufts (L), irregular. Inner hairline: soft (Q).
  - 1–2 ink strokes inside the fill for direction. Asymmetry > mirrored beziers.
  - Draw for size="md". Check /dev/faces at xl after.
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

    {#if cast.id === "alex"}
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-blue-600" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M18.6 25.8c-2.2.6-3 4.6-1.1 7.4 1 1.3 2.3.7 2.1-.9-.4-2.2-.6-4.6-1-6.5Z"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M45.4 25.8c2.2.6 3 4.6 1.1 7.4-1 1.3-2.3.7-2.1-.9.4-2.2.6-4.6 1-6.5Z"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M19.6 22.2 18.8 17.6 21.4 12.2 24.2 9.4 26.6 11.6 29.2 8.2 32.2 7.6 35.2 9.4 37.8 8 41.2 11.4 44.2 16.2 44.6 21.8Q40.2 17.6 32.2 17.2Q24.6 16.8 19.6 22.2Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M19.4 22.4c-.3 3.4 0 6.6.8 8.4.5-2.2.6-5.2.4-8.2Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.4"
      />
      <path
        d="M44.6 22.4c.3 3.4 0 6.6-.8 8.4-.5-2.2-.6-5.2-.4-8.2Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.4"
      />
      <path
        d="M24.4 13.4q3.4-1.6 7 .2M34.4 12.8q3.8.6 6.6 2.8"
        class="stroke-portrait-ink"
        stroke-width="1.15"
      />
      <path
        d="M23.2 24.8q2.8-1.2 5.8 0M35 24.8q2.8-1.2 5.8 0"
        class="stroke-portrait-hair"
        stroke-width="1.25"
      />
      <circle cx="26.2" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <path d="M32 31.2v3" class="stroke-portrait-ink" stroke-width="1.3" />
      <path d="M28.2 36.8q3.8 2.4 7.6 0" class="stroke-portrait-ink" stroke-width="1.4" />
    {:else if cast.id === "marek"}
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-slate-800" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M18.6 25.8c-2.2.6-3 4.6-1.1 7.4 1 1.3 2.3.7 2.1-.9-.4-2.2-.6-4.6-1-6.5Z"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M45.4 25.8c2.2.6 3 4.6 1.1 7.4-1 1.3-2.3.7-2.1-.9.4-2.2.6-4.6 1-6.5Z"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M19.8 21.6 19.4 17.2 22.6 13 25.8 11.2 27.6 13.2 29.4 11.4 31.2 14.6 33.4 9.2 36.8 7.4 40.6 9.6 44.2 14.2 45.6 19.4 44.8 22.2Q40.6 17.8 35.2 16.8Q32.4 16.4 30.6 18.6Q27.8 16.2 23.6 17.6Q21.2 18.6 19.8 21.6Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M19.6 22.2c-.3 3.2.1 6.2.8 7.8.4-2 .5-4.8.3-7.6Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.4"
      />
      <path
        d="M44.6 22c.4 3.4.2 6.4-.6 8.2-.5-2.2-.7-5.2-.5-8Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.4"
      />
      <path
        d="M29.6 11.6 31 16.8M36.2 10.4q4.2 1.6 7 4.8"
        class="stroke-portrait-ink"
        stroke-width="1.15"
      />
      <path
        d="M23.4 25q2.6-1 5.4.2M35.2 24.6q3.2-1.4 6.2.2"
        class="stroke-portrait-hair"
        stroke-width="1.25"
      />
      <circle cx="26.2" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <path d="M32 30.8q1.5 2.2 0 4" class="stroke-portrait-ink" stroke-width="1.3" />
      <path d="M28.4 37.2h7.2" class="stroke-portrait-ink" stroke-width="1.4" />
    {:else if cast.id === "anna"}
      <!-- side-part shoulder lob -->
      <path
        d="M15.4 48.8 14 39 15.2 29 14.2 20 18.2 11.4 25.2 7 33.2 6.4 41.6 8.6 47.8 15.2 50.4 24 48.6 34 50 43.5 47.6 50.8 42.4 47 37.2 51.6 31.4 47.2 25.6 51.4 20.2 47.2Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-rose-500" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M20.4 17.8C23.8 13.6 28.4 12.8 33.2 14.2C38.2 15.6 42.4 18.6 44.6 22.2C41.2 18.4 36.4 16.6 31.6 16.8C27.2 17 23.4 18 20.4 17.8Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.55"
      />
      <path
        d="M28.6 13.4 30.2 17.6M17.4 28 16.2 39.5M46.8 26.5 48.2 39"
        class="stroke-portrait-ink"
        stroke-width="1.15"
      />
      <path
        d="M23.4 23.4q3.2-2.6 6.4 0.2M34.4 23.4q3.2-2.6 6.4 0.2"
        class="stroke-portrait-hair"
        stroke-width="1.2"
      />
      <ellipse cx="24.4" cy="33.2" rx="2.2" ry="1.45" class="fill-rose-400/70" />
      <ellipse cx="39.6" cy="33.2" rx="2.2" ry="1.45" class="fill-rose-400/70" />
      <circle cx="26.2" cy="28.4" r="2.5" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.4" r="2.5" class="fill-portrait-ink" />
      <circle cx="25.35" cy="27.45" r="0.95" class="fill-portrait-bib" />
      <circle cx="36.95" cy="27.45" r="0.95" class="fill-portrait-bib" />
      <path
        d="M23.9 26.7q-1.3-1.7-2.1-.2M40.1 26.7q1.3-1.7 2.1-.2"
        class="stroke-portrait-ink"
        stroke-width="1.15"
      />
      <path d="M32 31.4v2.4" class="stroke-portrait-ink" stroke-width="1.2" />
      <path d="M28.6 36.2q3.4 3.2 6.8 0" class="stroke-portrait-ink" stroke-width="1.4" />
    {:else if cast.id === "lucia"}
      <path
        d="M19.2 21.5c.8-11 7.2-16.2 12.8-16.2s12 5.2 12.8 16.2c2 5.4 2.2 14.8-1.4 22.2-1.8 3.6-5.8 6.4-11.4 6.4s-9.6-2.8-11.4-6.4c-3.6-7.4-3.4-16.8-1.4-22.2Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-emerald-600" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M20 19.2c3.6-5.2 7.8-7.4 12-7.4s8.4 2.2 12 7.4c-2.8-2.2-7-3.8-12-3.8s-9.2 1.6-12 3.8Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M23.2 24.8q2.8-1.2 5.8 0M35 24.8q2.8-1.2 5.8 0"
        class="stroke-portrait-hair"
        stroke-width="1.25"
      />
      <circle cx="26.2" cy="28.6" r="1.7" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.6" r="1.7" class="fill-portrait-ink" />
      <path d="M32 30.8q1.5 2.2 0 4" class="stroke-portrait-ink" stroke-width="1.3" />
      <path d="M28.2 36.8q3.8 2.4 7.6 0" class="stroke-portrait-ink" stroke-width="1.4" />
    {:else if cast.id === "receptionist"}
      <path
        d="M18 22c-1.5-12 5-16 14-16s15.5 4 14 16c2 8 0 18-6 23-4 3-6-3-8-3.5-2 .5-4 6.5-8 3.5-6-5-8-15-6-23Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-blue-600" />
      <path d="M26 45.6 32 52.2 38 45.6" class="stroke-portrait-bib" stroke-width="1.6" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M20.6 18.8c3-2.8 7-4.2 11.4-4.2s8.4 1.4 11.4 4.2c-3-1.2-6.8-2-11.4-2s-8.4.8-11.4 2Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M23.4 24.6h6.6M34 24.6h6.6"
        class="stroke-portrait-hair"
        stroke-width="1.25"
      />
      <ellipse cx="26.2" cy="28.6" rx="2.15" ry="1.3" class="fill-portrait-ink" />
      <ellipse cx="37.8" cy="28.6" rx="2.15" ry="1.3" class="fill-portrait-ink" />
      <path d="M32 31.2v3" class="stroke-portrait-ink" stroke-width="1.3" />
      <path d="M28.2 36.8q3.8 2.4 7.6 0" class="stroke-portrait-ink" stroke-width="1.4" />
    {:else if cast.id === "maria"}
      <circle
        cx="32"
        cy="8.6"
        r="5.1"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M20.4 21.4c.8-8.6 6-12.4 11.6-12.4s10.8 3.8 11.6 12.4c-2.2-4-6.2-6.6-11.6-6.6s-9.4 2.6-11.6 6.6Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-rose-500" />
      <rect x="22.4" y="51" width="19.2" height="2.1" rx="1" class="fill-portrait-bib" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M23 24.8q2.8-1.2 5.8 0M35 24.8q2.8-1.2 5.8 0"
        class="stroke-portrait-hair-grey"
        stroke-width="1.2"
      />
      <circle cx="26.2" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <path d="M32 30.8q1.5 2.2 0 4" class="stroke-portrait-ink" stroke-width="1.3" />
      <path d="M28.4 37.2h7.2" class="stroke-portrait-ink" stroke-width="1.4" />
      <circle
        cx="26.2"
        cy="28.5"
        r="4.55"
        class="stroke-portrait-ink"
        stroke-width="1.55"
      />
      <circle
        cx="37.8"
        cy="28.5"
        r="4.55"
        class="stroke-portrait-ink"
        stroke-width="1.55"
      />
      <path
        d="M30.7 28.5h2.6M21.6 28.4h-2.6M42.4 28.4h2.6"
        class="stroke-portrait-ink"
        stroke-width="1.35"
      />
    {:else if cast.id === "waiter"}
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-slate-800" />
      <path
        d="M25 46.5 22.4 64h19.2L39 46.5Q32 50.5 25 46.5Z"
        class="fill-portrait-bib"
      />
      <path
        d="M25 46.5 32 53.2 39 46.5"
        class="stroke-portrait-ink"
        stroke-width="1.35"
      />
      <rect
        x="28.2"
        y="52.4"
        width="7.6"
        height="4"
        rx="0.7"
        class="fill-portrait-bib stroke-portrait-ink"
        stroke-width="1.1"
      />
      <rect
        x="29.6"
        y="53.6"
        width="4.8"
        height="1.15"
        rx="0.35"
        class="fill-emerald-600"
      />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M20.2 20.6C21.2 11.8 25.8 7.4 32 7.4s10.8 4.4 11.8 13.2c-2.8-1.8-7-2.8-11.8-2.8s-9 1-11.8 2.8Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M23.4 24.8h6.4M34.2 24.8h6.4"
        class="stroke-portrait-hair"
        stroke-width="1.2"
      />
      <circle cx="26.2" cy="28.6" r="1.5" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.6" r="1.5" class="fill-portrait-ink" />
      <path d="M32 31.2v3" class="stroke-portrait-ink" stroke-width="1.3" />
      <path d="M28.2 36.8q3.8 2.4 7.6 0" class="stroke-portrait-ink" stroke-width="1.4" />
    {:else if cast.id === "narrator"}
      <!-- low ponytail, site host -->
      <path
        d="M28.4 42.5 26.8 52 28.2 62 35.8 62 37.2 52 35.6 42.5Q32 45.2 28.4 42.5Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-slate-600" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M18.6 25.8c-2.2.6-3 4.6-1.1 7.4 1 1.3 2.3.7 2.1-.9-.4-2.2-.6-4.6-1-6.5Z"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M45.4 25.8c2.2.6 3 4.6 1.1 7.4-1 1.3-2.3.7-2.1-.9.4-2.2.6-4.6 1-6.5Z"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M19.8 21.4C19.2 16 22.8 10.4 28.6 8.2L32 9.4 35.6 8C41.2 10.6 44.8 16.2 44.4 21.6Q40 17.4 35.4 16.8L32 18.8 28.6 16.8Q24 17.6 19.8 21.4Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M23.4 24.8q2.8-1.2 5.8 0M35 24.8q2.8-1.2 5.8 0"
        class="stroke-portrait-hair"
        stroke-width="1.2"
      />
      <circle cx="26.2" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.6" r="1.55" class="fill-portrait-ink" />
      <path d="M32 31.2v2.8" class="stroke-portrait-ink" stroke-width="1.25" />
      <path
        d="M28.4 36.6q3.6 2.2 7.2 0"
        class="stroke-portrait-ink"
        stroke-width="1.35"
      />
    {:else}
      <!-- guide -->
      <path d="M13 64c2-13 9-19 19-19s17 6 19 19Z" class="fill-blue-600" />
      <path
        d="M26.5 43c.5 3.6 1.8 6.2 5.5 6.2s5-2.6 5.5-6.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.6"
      />
      <ellipse
        cx="32"
        cy="29"
        rx="13.2"
        ry="15.2"
        class="fill-portrait-skin stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M18.4 24.8C19 12.2 24.8 6 32 6c8 0 13.8 6.8 14.2 19.2-3.2-5.6-8-8.8-14.2-8.6-6.4.2-11 3.6-13.6 8.2Z"
        class="{hair} stroke-portrait-ink"
        stroke-width="1.7"
      />
      <path
        d="M23.2 24.6q3-1.4 6.2.1M34.6 24.6q3-1.4 6.2.1"
        class="stroke-portrait-hair"
        stroke-width="1.2"
      />
      <circle cx="26.2" cy="28.6" r="1.6" class="fill-portrait-ink" />
      <circle cx="37.8" cy="28.6" r="1.6" class="fill-portrait-ink" />
      <path d="M32 31.2v3" class="stroke-portrait-ink" stroke-width="1.3" />
      <path d="M28.2 36.8q3.8 2.4 7.6 0" class="stroke-portrait-ink" stroke-width="1.4" />
      <path
        d="M19.5 44.5Q32 51 44.5 44.5Q42.5 55 32 57Q21.5 55 19.5 44.5Z"
        class="fill-rose-500 stroke-portrait-ink"
        stroke-width="1.45"
      />
      <ellipse
        cx="32"
        cy="50.2"
        rx="3.4"
        ry="2.5"
        class="fill-rose-500 stroke-portrait-ink"
        stroke-width="1.3"
      />
    {/if}
  </svg>
</span>

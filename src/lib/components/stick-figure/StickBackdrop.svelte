<script lang="ts">
  import type { Component } from "svelte";

  import {
    BACKDROP_HEIGHT,
    BACKDROP_WIDTH,
    backdropScale,
  } from "$lib/stick-figure/backdrop-geometry";
  import { PLACES, backdropAlign, thingsIn } from "$lib/stick-figure/places";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import { litKey, thingBoxes } from "$lib/stick-figure/thing-words";
  import { cx } from "$lib/ui/classes";
  import Cafe from "./backdrops/Cafe.svelte";
  import Classroom from "./backdrops/Classroom.svelte";
  import Home from "./backdrops/Home.svelte";
  import Market from "./backdrops/Market.svelte";
  import Park from "./backdrops/Park.svelte";
  import Plaza from "./backdrops/Plaza.svelte";
  import Registration from "./backdrops/Registration.svelte";
  import Street from "./backdrops/Street.svelte";
  import Studio from "./backdrops/Studio.svelte";
  import Kitchen from "./backdrops/Kitchen.svelte";
  import MoodLayer from "./backdrops/MoodLayer.svelte";
  import SkyLayer from "./backdrops/SkyLayer.svelte";
  import StageLight from "./backdrops/StageLight.svelte";
  import { CLOCK_HOURS, DAYTIME, type SceneMood } from "$lib/stick-figure/scene-mood";
  import type { TramState } from "$lib/stick-figure/street";

  let {
    board,
    class: className = "",
    found = [],
    height = 0,
    hint,
    lit = [],
    mood = DAYTIME,
    onpick,
    picked,
    setting,
    tram = "away",
    width = 0,
  }: {
    /** Before each thing's name for assistive tech, when a tap shows its word rather than plays a game. */
    hint?: string;
    /** A line to chalk on the classroom board. */
    board?: string;
    class?: string;
    /** Things found in a game, ringed in green for the rest of it. */
    found?: readonly string[];
    /** The drawn size in px, once measured, so the slice can sit anywhere along it. */
    height?: number;
    /** Things to light up, named in the line playing: an id, or one copy's litKey. */
    lit?: readonly string[];
    /** Time of day and weather, from the dialogue or picked in the lab. */
    mood?: SceneMood;
    /** Makes each thing a button that reports its id. */
    onpick?: (id: string) => void;
    picked?: string;
    setting: StageSetting;
    /** Where the street's tram is. */
    tram?: TramState;
    width?: number;
  } = $props();

  /** Each place's drawing; every one takes the same props and uses what it needs. */
  const DRAWINGS: Record<
    StageSetting,
    Component<{ board?: string; hour: number; tram: TramState }>
  > = {
    cafe: Cafe,
    classroom: Classroom,
    default: Park,
    home: Home,
    kitchen: Kitchen,
    market: Market,
    plaza: Plaza,
    registration: Registration,
    street: Street,
    studio: Studio,
  };

  let focused = $state<string>();

  const align = $derived(backdropAlign(setting));
  /**
   * The part of the drawing the stage shows, as backdropToStage works it
   * out. preserveAspectRatio only slices at either end or the middle, so a
   * measured stage gets an exact viewBox instead.
   */
  const view = $derived.by(() => {
    if (!width || !height) {
      const x = align === 0 ? "xMin" : align === 1 ? "xMax" : "xMid";
      return { box: `0 0 ${BACKDROP_WIDTH} ${BACKDROP_HEIGHT}`, ratio: `${x}YMax slice` };
    }

    const scale = backdropScale(width, height);
    const shown = { height: height / scale, width: width / scale };
    const x = (BACKDROP_WIDTH - shown.width) * align;
    const y = BACKDROP_HEIGHT - shown.height;
    return { box: `${x} ${y} ${shown.width} ${shown.height}`, ratio: "none" };
  });
  const hour = $derived(CLOCK_HOURS[mood.time]);
  const Drawing = $derived(DRAWINGS[setting]);
  const things = $derived(thingsIn(PLACES[setting].things, setting, mood));
  /** Which thing the Tab key lands on: the last one focused, so leaving and coming back keeps the place. */
  let tabStop = $state(0);
  /** Right and Down go to the next thing, Left and Up to the one before; Home and End to the ends. */
  const ARROW_STEPS: Record<string, number> = {
    ArrowRight: 1,
    ArrowDown: 1,
    ArrowLeft: -1,
    ArrowUp: -1,
    Home: Number.NEGATIVE_INFINITY,
    End: Number.POSITIVE_INFINITY,
  };

  const boxes = $derived(
    things.flatMap((thing) =>
      thingBoxes(thing).map((box, copy) => ({ box, copy, thing })),
    ),
  );
  // The smallest on top, so the clock on the tower gets its own tap.
  const hitOrder = $derived(
    [...boxes].sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height),
  );
</script>

<!--
  960×300 with the floor line at y 226. Slice keeps the floor on the bottom
  edge and trims the sides on a narrow stage, so what names the place sits
  near the middle (or the end the setting keeps) or above head height
  (y < 70). Shapes are flat, without outlines, so the ink-outlined cast
  stands in front of them.
-->
<svg
  class="block {className}"
  role={onpick ? "group" : undefined}
  aria-label={onpick ? `Scene: ${PLACES[setting].label}` : undefined}
  aria-hidden={onpick ? undefined : "true"}
  viewBox={view.box}
  preserveAspectRatio={view.ratio}
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- Paint only: the things below carry the names. -->
  <g aria-hidden="true">
    {#if PLACES[setting].outdoors}
      <SkyLayer {mood} {setting} />
    {/if}

    <Drawing {board} {hour} {tram} />

    <MoodLayer {mood} {setting} />
    <StageLight />
  </g>

  {#each boxes as { box, copy, thing } (`${thing.id}-${copy}`)}
    {@const done = found.includes(thing.id)}
    <rect
      x={box.x - 5}
      y={box.y - 5}
      width={box.width + 10}
      height={box.height + 10}
      rx="8"
      class={cx(
        "fill-white/20 transition-opacity duration-150 ease-out",
        done ? "stroke-emerald-500" : "stroke-blue-500",
        done ||
          lit.includes(thing.id) ||
          lit.includes(litKey(thing.id, copy)) ||
          picked === thing.id ||
          focused === thing.id
          ? "opacity-100"
          : "opacity-0",
      )}
      stroke-width="2.5"
    />
  {/each}

  {#if onpick}
    <!-- One tab stop for the whole scene; the arrow keys move between its things. -->
    {#each hitOrder as { box, copy, thing }, index (`${thing.id}-${copy}`)}
      <rect
        x={box.x - 5}
        y={box.y - 5}
        width={box.width + 10}
        height={box.height + 10}
        rx="8"
        fill="transparent"
        class="cursor-pointer outline-none"
        role="button"
        tabindex={index === tabStop ? 0 : -1}
        aria-label={hint ? `${hint}: ${thing.word}` : thing.word}
        aria-pressed={picked === thing.id}
        onclick={() => onpick(thing.id)}
        onfocus={() => {
          focused = thing.id;
          tabStop = index;
        }}
        onblur={() => {
          focused = undefined;
        }}
        onkeydown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onpick(thing.id);
            return;
          }
          const step = ARROW_STEPS[event.key];
          if (step === undefined) return;
          event.preventDefault();
          const rects = [
            ...event.currentTarget.ownerSVGElement!.querySelectorAll<SVGRectElement>(
              'rect[role="button"]',
            ),
          ];
          const at = rects.indexOf(event.currentTarget);
          const next = Number.isFinite(step)
            ? (at + step + rects.length) % rects.length
            : step > 0
              ? rects.length - 1
              : 0;
          rects[next]?.focus();
        }}
      />
    {/each}
  {/if}
</svg>

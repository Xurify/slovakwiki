<script lang="ts">
  import { untrack, type Component } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { Tween } from "svelte/motion";
  import { DOOR_OPEN_MS, DOOR_SHUT_MS } from "$lib/stick-figure/act-motions";

  import {
    BACKDROP_HEIGHT,
    BACKDROP_WIDTH,
    backdropScale,
  } from "$lib/stick-figure/backdrop-geometry";
  import { PLACES, backdropAlign, thingsIn } from "$lib/stick-figure/places";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import {
    litKey,
    thingBoxes,
    withDrawn,
    type ThingBox,
  } from "$lib/stick-figure/thing-words";
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
  import { DAYTIME, clockHour, type SceneMood } from "$lib/stick-figure/scene-mood";
  import type { TramState } from "$lib/stick-figure/street";

  let {
    board,
    class: className = "",
    door = false,
    drawnAt = $bindable({}),
    found = [],
    height = 0,
    hint,
    lit = [],
    minutes = 0,
    mood = DAYTIME,
    skipping = false,
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
    /** The door stands open: someone is coming in. */
    door?: boolean;
    /** Where the set draws its things now, in backdrop units by piece or object id (withDrawn): measured here. */
    drawnAt?: Record<string, ThingBox | null>;
    /** Things found in a game, ringed in green for the rest of it. */
    found?: readonly string[];
    /** The drawn size in px, once measured, so the slice can sit anywhere along it. */
    height?: number;
    /** Things to light up, named in the line playing: an id, or one copy's litKey. */
    lit?: readonly string[];
    /** How far the story has skipped ahead: the clock's hands run on that far. */
    minutes?: number;
    /** The lights are down for a skip ahead: the hands run round to `minutes` rather than jump. */
    skipping?: boolean;
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
    Component<{ board?: string; hour: number; open?: number; tram: TramState }>
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
  /** The clock's hands sweep on over a skip ahead rather than jump. */
  const hour = new Tween(
    untrack(() => clockHour(mood) + minutes / 60),
    { duration: 1200, easing: cubicInOut },
  );
  $effect(() => {
    const to = clockHour(mood) + minutes / 60;
    // Untracked: reading the tween here would rerun this every frame, and each set restarts the easing from rest, so the hands crawl.
    const from = untrack(() => hour.target);
    if (to === from) return;
    // Only a skip runs the hands round; a new scene, a seek or the first world just sets them.
    const run = untrack(() => skipping) && to > from;
    void hour.set(to, { duration: run ? 1200 : 0 });
  });
  /**
   * The door swings rather than snaps, about as long as a door takes, and
   * only part way: wide enough to come in by, and its edge still in reach
   * of whoever turns back to push it to. In 450 ms it flew open and shut.
   */
  const AJAR = 0.5;
  const swing = new Tween(
    untrack(() => (door ? AJAR : 0)),
    { easing: cubicInOut },
  );
  $effect(() => {
    void swing.set(door ? AJAR : 0, { duration: door ? DOOR_OPEN_MS : DOOR_SHUT_MS });
  });
  const Drawing = $derived(DRAWINGS[setting]);
  const things = $derived(
    withDrawn(thingsIn(PLACES[setting].things, setting, mood), drawnAt),
  );

  let svg = $state<SVGSVGElement>();
  const measured = $derived(PLACES[setting].things.flatMap((thing) => thing.of ?? []));
  // The set and the cast are drawn over this svg in the same camera, so a box
  // measured in px maps to backdrop units by this svg's own px and viewBox.
  $effect(() => {
    const ids = measured;
    const own = svg;
    if (!ids.length || !own?.parentElement || !width || !height) return;
    const [left, top, across] = view.box.split(" ").map(Number);
    const root = own.parentElement;
    let frame = requestAnimationFrame(function measure() {
      const stage = own.getBoundingClientRect();
      const unit = across / stage.width;
      let changed = false;
      const next: Record<string, ThingBox | null> = {};
      for (const id of ids) {
        const drawn = root
          .querySelector(`[data-set-id="${id}"]`)
          ?.getBoundingClientRect();
        next[id] =
          drawn && drawn.width > 0
            ? {
                x: left + (drawn.left - stage.left) * unit,
                y: top + (drawn.top - stage.top) * unit,
                width: drawn.width * unit,
                height: drawn.height * unit,
              }
            : null;
        const was = drawnAt[id];
        const now = next[id];
        changed ||=
          !was || !now
            ? was !== now
            : Math.abs(was.x - now.x) +
                Math.abs(was.y - now.y) +
                Math.abs(was.width - now.width) +
                Math.abs(was.height - now.height) >
              1;
      }
      if (changed) drawnAt = next;
      frame = requestAnimationFrame(measure);
    });
    return () => cancelAnimationFrame(frame);
  });
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
  bind:this={svg}
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

    <Drawing {board} hour={hour.current} open={swing.current} {tram} />

    <MoodLayer {mood} {setting} />
    <StageLight />
  </g>

  {#each boxes.filter(({ thing }) => !thing.of) as ring (`${ring.thing.id}-${ring.copy}`)}
    {@render lightUp(ring)}
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

{#if boxes.some(({ thing }) => thing.of)}
  <!-- The set draws its things over the backdrop, and the ring of a pot in the cupboard was hidden behind the counter. -->
  <svg
    class="pointer-events-none absolute inset-0 z-4 size-full"
    viewBox={view.box}
    preserveAspectRatio={view.ratio}
    fill="none"
    aria-hidden="true"
  >
    {#each boxes.filter(({ thing }) => thing.of) as ring (`${ring.thing.id}-${ring.copy}`)}
      {@render lightUp(ring, true)}
    {/each}
  </svg>
{/if}

{#snippet lightUp({ box, copy, thing }: (typeof boxes)[number], over = false)}
  {@const done = found.includes(thing.id)}
  <rect
    x={box.x - 5}
    y={box.y - 5}
    width={box.width + 10}
    height={box.height + 10}
    rx="8"
    class={cx(
      // Drawn over a thing, a white wash greyed it out.
      over ? "fill-none" : "fill-white/20",
      "transition-opacity duration-150 ease-out",
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
{/snippet}

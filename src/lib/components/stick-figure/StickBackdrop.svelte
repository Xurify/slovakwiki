<script lang="ts">
  import { untrack, type Component } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

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
    door = 0,
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
    /** How far the door has swung in, from 0 shut: someone is coming in. */
    door?: number;
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
    Component<{
      board?: string;
      hour: number;
      open?: number;
      tram: TramState;
      mood?: SceneMood;
    }>
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
      return {
        box: `0 0 ${BACKDROP_WIDTH} ${BACKDROP_HEIGHT}`,
        ratio: "xMidYMid slice" as const,
      };
    }
    const scale = backdropScale(width, height);
    const visibleWidth = width / scale;
    const excess = BACKDROP_WIDTH - visibleWidth;
    const x = Math.max(0, Math.min(excess, excess * align));
    return {
      box: `${x} 0 ${visibleWidth} ${BACKDROP_HEIGHT}`,
      ratio: "xMidYMid meet" as const,
    };
  });

  const Drawing = $derived(DRAWINGS[setting]);
  const things = $derived(thingsIn(PLACES[setting].things, setting, mood));

  // The clocks start at the scene's told hour; skipping ahead spins them forward.
  const hour = new Tween(clockHour(mood), {
    duration: 1200,
    easing: cubicInOut,
  });
  $effect(() => {
    const target = clockHour(mood) + minutes / 60;
    if (skipping) {
      hour.target = target;
    } else {
      untrack(() => hour.set(target, { duration: 0 }));
    }
  });

  let svg = $state<SVGSVGElement>();

  /**
   * Where each thing is drawn now: its bounding box in backdrop units, or
   * null once hidden. An object without a `start` placement (brought in
   * later by an act) is not on stage until placed; a backdrop thing hidden
   * by the act (the cup on the cafe counter once someone takes it) is null.
   */
  function measure(): void {
    if (!svg) return;
    const measured: Record<string, ThingBox | null> = {};
    for (const thing of things) {
      for (const [copy, element] of thingElements(thing.id).entries()) {
        const box = element.getBBox();
        measured[litKey(thing.id, copy)] = {
          height: box.height,
          width: box.width,
          x: box.x,
          y: box.y,
        };
      }
    }
    drawnAt = withDrawn(things, measured);
  }

  function thingElements(id: string): SVGGraphicsElement[] {
    if (!svg) return [];
    return [...svg.querySelectorAll<SVGGraphicsElement>(`[data-thing="${id}"]`)];
  }

  /**
   * The order the Tab key visits things in: left to right across the scene,
   * then top to bottom, as they are seen on the screen.
   */
  const hitOrder = $derived(
    boxes
      .filter(({ thing }) => !thing.of)
      .slice()
      .sort((a, b) => a.box.x - b.box.x || a.box.y - b.box.y),
  );

  $effect(() => {
    // Read the props that change what is drawn where, so this runs again when any does.
    void setting;
    void door;
    void tram;
    let frame = 0;
    untrack(() => {
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
</script>

<svg
  bind:this={svg}
  class={cx("pointer-events-none absolute inset-0 size-full", className)}
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

    <Drawing {board} hour={hour.current} open={door} {tram} {mood} />

    <MoodLayer {mood} {setting} />
    <StageLight />
  </g>

  {#each boxes.filter(({ thing }) => !thing.of) as ring (`${ring.thing.id}-${ring.copy}`)}
    {@render lightUp(ring)}
  {/each}

  {#if onpick}
    <!-- One tab stop for the whole scene; the arrow keys move between its things. -->
    {#each hitOrder as { box, copy, thing }, index (`${thing.id}-${copy}`)}
      {@const key = litKey(thing.id, copy)}
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
        aria-pressed={picked === key || (picked === thing.id && copy === 0)}
        onclick={() => onpick(key)}
        onfocus={() => {
          focused = key;
          tabStop = index;
        }}
        onblur={() => {
          focused = undefined;
        }}
        onkeydown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onpick(key);
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
  {@const key = litKey(thing.id, copy)}
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
        lit.includes(key) ||
        picked === key ||
        (picked === thing.id && copy === 0) ||
        focused === key ||
        (focused === thing.id && copy === 0)
        ? "opacity-100"
        : "opacity-0",
    )}
    stroke-width="2.5"
  />
{/snippet}

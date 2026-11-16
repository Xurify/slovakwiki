<script lang="ts">
  import { untrack, type Component } from "svelte";
  import { cubicInOut } from "svelte/easing";

  import { PlayTween } from "$lib/stick-figure/play-motion.svelte";

  import {
    BACKDROP_HEIGHT,
    BACKDROP_WIDTH,
    backdropScale,
    boxInView,
  } from "$lib/stick-figure/backdrop-geometry";
  import { PLACES, backdropAlign, thingsIn, withProps } from "$lib/stick-figure/places";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import {
    litKey,
    thingBoxes,
    withDrawn,
    type ThingBox,
  } from "$lib/stick-figure/thing-words";
  import { arrowOrder, clipBox, tapOrder, verticalNeighbour } from "$lib/stick-figure/thing-order";
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
    objects = {},
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
    /** The set's objects by id, each its kind: a thing with `ofKind` is also drawn wherever these are. */
    objects?: Readonly<Record<string, string>>;
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
  type Drawing = Component<{
    board?: string;
    hour: number;
    open?: number;
    tram: TramState;
    mood?: SceneMood;
  }>;
  /** For a drawing that uses none of the props: Svelte types a component without props as refusing any. */
  const still = (drawing: unknown) => drawing as Drawing;
  const DRAWINGS: Record<StageSetting, Drawing> = {
    cafe: Cafe,
    classroom: Classroom,
    default: still(Park),
    home: Home,
    kitchen: Kitchen,
    market: still(Market),
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
      // Unmeasured, as in the server's HTML: slice toward the place's alignment,
      // so the first measured frame barely moves.
      const toward = align < 1 / 3 ? "xMin" : align > 2 / 3 ? "xMax" : "xMid";
      return {
        box: `0 0 ${BACKDROP_WIDTH} ${BACKDROP_HEIGHT}`,
        ratio: `${toward}YMid slice`,
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
  const placeThings = $derived(withProps(PLACES[setting].things, objects));
  const things = $derived(withDrawn(thingsIn(placeThings, setting, mood, tram), drawnAt));

  // The clocks start at the scene's told hour; skipping ahead spins them forward.
  const hour = new PlayTween(
    untrack(() => clockHour(mood)),
    {
      duration: 1200,
      easing: cubicInOut,
    },
  );
  $effect(() => {
    const target = clockHour(mood) + minutes / 60;
    if (skipping) {
      hour.target = target;
    } else {
      untrack(() => hour.set(target, { duration: 0 }));
    }
  });

  let svg = $state<SVGSVGElement>();

  const measured = $derived(placeThings.flatMap((thing) => thing.of ?? []));
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
        const was = untrack(() => drawnAt[id]);
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
      // Carried things move every frame, so this keeps measuring.
      frame = requestAnimationFrame(measure);
    });
    return () => cancelAnimationFrame(frame);
  });
  /** Which thing the Tab key lands on: the last one focused, so leaving and coming back keeps the place. */
  let tabStop = $state(0);
  /** Right goes to the next thing across, Left to the one before; Home and End to the ends. */
  const ARROW_STEPS: Record<string, number> = {
    ArrowRight: 1,
    ArrowLeft: -1,
    Home: Number.NEGATIVE_INFINITY,
    End: Number.POSITIVE_INFINITY,
  };
  const ARROW_ROWS: Record<string, 1 | -1> = { ArrowDown: 1, ArrowUp: -1 };
  /** How far a ring stands out from its thing's box. */
  const RING_PAD = 5;
  /** The smallest a target is, ring and all, in screen px: a held lead was 16×19 to hit. */
  const MIN_TARGET = 24;

  /** The drawing's part the stage shows, in backdrop units. */
  const shown = $derived.by(() => {
    const [x, y, across, down] = view.box.split(" ").map(Number);
    return { x, y, width: across, height: down };
  });

  /**
   * Only what the stage shows: a phone slices off the ends, and a hidden box
   * must not take focus. A box that runs past the stage (the park's river) is
   * cut at its edge, ring and all.
   */
  const boxes = $derived(
    things.flatMap((thing) =>
      thingBoxes(thing).flatMap((whole, copy) => {
        const box = clipBox(atLeast(whole), shown, RING_PAD);
        return boxInView(whole, setting, width, height) && box.width > 0
          ? [{ box, copy, thing }]
          : [];
      }),
    ),
  );

  /** A box grown about its middle until its ring is MIN_TARGET px each way. */
  function atLeast(box: ThingBox): ThingBox {
    if (!width) return box;
    const least = (MIN_TARGET * shown.width) / width - RING_PAD * 2;
    const grow = (size: number) => Math.max(0, least - size) / 2;
    const across = grow(box.width);
    const down = grow(box.height);
    if (!across && !down) return box;
    return {
      ...box,
      x: box.x - across,
      y: box.y - down,
      width: box.width + across * 2,
      height: box.height + down * 2,
    };
  }

  /** The order the arrow keys visit things in: Left and Right across the screen, Up and Down to the nearest above or below. */
  const hitOrder = $derived(arrowOrder(boxes));
  /** Bottom first: a tap where two overlap goes to the one in front. */
  const paintOrder = $derived(tapOrder(hitOrder.map((hit, index) => ({ ...hit, index }))));
</script>

<svg
  bind:this={svg}
  class={cx("pointer-events-none absolute inset-0 size-full", className)}
  viewBox={view.box}
  preserveAspectRatio={view.ratio}
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  role={onpick ? "group" : undefined}
  aria-label={onpick ? `Scene: ${PLACES[setting].label}` : undefined}
  aria-hidden={onpick ? undefined : "true"}
>
  <!-- Paint only: the things below carry the names. -->
  <g aria-hidden="true">
    {#if PLACES[setting].outdoors}
      <SkyLayer {mood} {setting} />
    {/if}

    <Drawing {board} hour={hour.current} open={door} {tram} {mood} />

    <MoodLayer {mood} {setting} />
    {#if PLACES[setting].glow !== false}
      <StageLight />
    {/if}
  </g>

  {#each boxes.filter(({ thing }) => !thing.of) as ring (`${ring.thing.id}-${ring.copy}`)}
    {@render lightUp(ring)}
  {/each}

  {#if onpick}
    <!-- One tab stop for the whole scene; the arrow keys move between its things. -->
    {#each paintOrder as { box, copy, index, thing } (`${thing.id}-${copy}`)}
      {@const key = litKey(thing.id, copy)}
      <rect
        x={box.x - RING_PAD}
        y={box.y - RING_PAD}
        width={box.width + RING_PAD * 2}
        height={box.height + RING_PAD * 2}
        rx="8"
        fill="transparent"
        class="pointer-events-auto cursor-pointer outline-none"
        role="button"
        data-hit={index}
        tabindex={index === Math.min(tabStop, hitOrder.length - 1) ? 0 : -1}
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
          const row = ARROW_ROWS[event.key];
          const step = ARROW_STEPS[event.key];
          if (step === undefined && row === undefined) return;
          event.preventDefault();
          const count = hitOrder.length;
          const next = row
            ? verticalNeighbour(hitOrder, index, row)
            : Number.isFinite(step)
            ? (index + step + count) % count
            : step > 0
              ? count - 1
              : 0;
          event.currentTarget.ownerSVGElement
            ?.querySelector<SVGRectElement>(`rect[data-hit="${next}"]`)
            ?.focus();
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
    x={box.x - RING_PAD}
    y={box.y - RING_PAD}
    width={box.width + RING_PAD * 2}
    height={box.height + RING_PAD * 2}
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

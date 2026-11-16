<script lang="ts">
  import { contents, restingOn, type World } from "$lib/stick-figure/acts";
  import { n } from "$lib/stick-figure/draw";
  import { GROUND_Y } from "$lib/stick-figure/rig";
  import {
    OBJECT_SIZE,
    SINK,
    hangs,
    objectBase,
    pieceSize,
    pieceTop,
    type SetGeometry,
    type SetPiece,
  } from "$lib/stick-figure/set-pieces";
  import StickSetObject from "./StickSetObject.svelte";

  /**
   * The set the cast works at, drawn at the cast's scale in rig units: the
   * counter and stove on the cast's floor, and every object not in someone's
   * hand where it stands now. `behind` is drawn before the cast and `front`
   * after it: the table, and what stands on it. `view` is the stage in
   * those units.
   */
  let {
    geometry,
    gliding = {},
    layer,
    running = [],
    view,
    world,
  }: {
    geometry: SetGeometry;
    /** Objects pushed along their surface, with the ms they glide over to where they now stand. */
    gliding?: Readonly<Record<string, number>>;
    layer: "behind" | "front";
    /** Pieces whose tap is running. */
    running?: readonly string[];
    view: { x: number; y: number; width: number; height: number };
    world: World;
  } = $props();

  const FLAT = new Set(["phone", "keys", "umbrella"]);
  const uid = $props.id();

  const pieces = $derived(
    geometry.pieces.filter(
      (piece) =>
        (layer === "front") === Boolean(piece.front) &&
        piece.kind !== "ledge" &&
        (piece.kind !== "floor" || piece.mat) &&
        piece.kind !== "desk" &&
        !piece.bare,
    ),
  );

  /** Inside things draw over what holds them: the lid on the pot, the spoon in the crock. */
  const placed = $derived(
    Object.entries(world.objects)
      .flatMap(([id, state]) => {
        const piece = restingOn(world, id);
        const front = geometry.pieces.find((candidate) => candidate.id === piece)?.front;
        if (!piece || (layer === "front") !== Boolean(front)) return [];
        const holder = "in" in state.where ? world.objects[state.where.in] : undefined;
        // Carrots in the pot are bits in the soup, drawn with it.
        if (state.kind === "carrot" && holder?.kind === "pot") return [];
        // Inside an opaque bag or suitcase, items are hidden until taken out.
        if (holder?.kind === "bag" || holder?.kind === "suitcase") return [];
        if (state.kind === "stash" || holder?.kind === "stash") return [];
        const at = objectBase(world, id, geometry);
        return at ? [{ id, state, at, depth: depthOf(id), sink: sinkOf(id) }] : [];
      })
      .sort((a, b) => a.depth - b.depth),
  );

  function depthOf(id: string): number {
    let depth = 0;
    let where = world.objects[id]?.where;
    while (where && "in" in where && depth < 8) {
      depth += 1;
      where = world.objects[where.in]?.where;
    }
    return depth;
  }

  /** The sink an object stands down in, in cast units: what is under the worktop there is hidden. */
  function sinkOf(id: string): { left: number; right: number; top: number } | undefined {
    const where = world.objects[id]?.where;
    if (!where || !("on" in where)) return undefined;
    const piece = geometry.pieces.find((candidate) => candidate.id === where.on);
    if (!piece || piece.sink !== where.dx) return undefined;
    const x = pieceX(piece) + piece.sink;
    // A unit past the sink's sides, so the outline of a pot that fills it goes under the worktop too.
    const half = SINK.half + 1;
    return { left: x - half, right: x + half, top: pieceTop(piece) };
  }

  /**
   * Taps running into what stands in their sink: the stream ends on the
   * water inside its opening, drawn over its near rim, and the level comes
   * up while it runs.
   */
  const filling = $derived(
    placed.flatMap(({ id, state, at, sink }) => {
      const where = state.where;
      if (!sink || !("on" in where) || !running.includes(where.on)) return [];
      return [
        {
          id,
          piece: where.on,
          x: at.x,
          rim: at.y - OBJECT_SIZE[state.kind].top,
          spout: sink.top - SINK.spout,
          empty: !state.fill,
        },
      ];
    }),
  );

  function lidOn(id: string): boolean {
    return contents(world, id).some((inside) => world.objects[inside]?.kind === "lid");
  }

  /** A lid jumps on a pot at the boil on a lit burner. */
  function rattles(id: string): boolean {
    const where = world.objects[id]?.where;
    const pot = where && "in" in where ? world.objects[where.in] : undefined;
    const piece = restingOn(world, id);
    return Boolean(pot && (pot.heat ?? 0) >= 1 && piece && world.lit?.includes(piece));
  }

  /** Whether something stands on a shelf inside this piece, so its cupboard is open to show it. */
  function stocked(piece: SetPiece): boolean {
    const shelves = geometry.pieces.filter(
      (other) => other.kind === "ledge" && other.at?.piece === piece.id,
    );
    return Object.values(world.objects).some(
      ({ where }) => "on" in where && shelves.some((shelf) => shelf.id === where.on),
    );
  }

  /** Whether anything stands on a floor spot, which a mat is drawn under. */
  function used(piece: SetPiece): boolean {
    return Object.values(world.objects).some(
      ({ where }) => "on" in where && where.on === piece.id,
    );
  }

  function pieceX(piece: SetPiece): number {
    return geometry.pieceX(piece.id) ?? 0;
  }
</script>

<!-- An oštiepok standing on its end, its foot at 0: smoked, spindle-shaped, stamped round the middle. -->
{#snippet ostiepok()}
  <path
    d="M0 -11C2.6 -10.4 3.4 -7.6 3.4 -5.4C3.4 -2.4 2 -0.6 0 0C-2 -0.6 -3.4 -2.4 -3.4 -5.4C-3.4 -7.6 -2.6 -10.4 0 -11Z"
    class="fill-scene-onion stroke-scene-coffee/40"
    stroke-width="0.4"
  />
  <path d="M1.2 -10.2C3.2 -8 3.2 -2.6 1 -0.6" class="stroke-scene-coffee/30" stroke-width="1" fill="none" />
  <path
    d="M-2.6 -7.2l0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2M-2.8 -4.4l0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2"
    class="stroke-scene-coffee/50"
    stroke-width="0.45"
    fill="none"
  />
  <path d="M-1.2 -10.4l1.2 -1.6 1.2 1.6" class="stroke-scene-coffee/70" stroke-width="0.5" fill="none" />
{/snippet}

<svg
  class="pointer-events-none absolute inset-0 size-full overflow-visible"
  viewBox="{n(view.x)} {n(view.y)} {n(view.width)} {n(view.height)}"
  preserveAspectRatio="none"
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#each pieces as piece (piece.id)}
    {@const x = pieceX(piece)}
    {@const { width } = pieceSize(piece)}
    {@const top = pieceTop(piece)}
    {@const lit = world.lit?.includes(piece.id)}
    <g transform="translate({n(x)} 0)" data-set-id={piece.id}>
      {#if piece.kind !== "rail" && piece.kind !== "stool" && (piece.kind !== "floor" || used(piece))}
        <ellipse
          cx="0"
          cy={GROUND_Y + 0.5}
          rx={width / 2 + 3}
          ry="2.2"
          class="fill-portrait-ink/15"
        />
      {/if}
      {#if piece.kind === "counter"}
        {@const sink = piece.sink}
        <rect
          x={-width / 2 + 1}
          y={top + 2}
          width={width - 2}
          height={GROUND_Y - top - 3}
          class="fill-scene-wood"
        />
        {#if sink !== undefined && !stocked(piece)}
          <!-- The cupboard under the sink, its two doors shut. -->
          <path
            d="M{-width / 2 + 5} {top + 8}h{width / 2 - 8}v{GROUND_Y - top - 16}h{8 - width / 2}Z"
            class="stroke-scene-line/25"
            stroke-width="0.8"
            fill="none"
          />
          <path
            d="M{(-width / 2 + 2) / 2} {top + 8}V{GROUND_Y - 8}"
            class="stroke-scene-line/25"
            stroke-width="0.8"
          />
          <path
            d="M{(-width / 2 + 2) / 2 - 3} {top + 20}v6M{(-width / 2 + 2) / 2 + 3} {top + 20}v6"
            class="stroke-scene-line/50"
            stroke-width="1.4"
          />
        {/if}
        {#if sink !== undefined}
          {#if stocked(piece)}
          <!-- The cupboard under the sink stands open, both doors swung out: the big pot lives on its shelf. -->
          <rect
            x={-width / 2 + 5}
            y={top + 8}
            width={width / 2 - 8}
            height={GROUND_Y - top - 16}
            rx="1"
            class="fill-scene-coffee/45"
          />
          <rect
            x={-width / 2 + 5}
            y={top + 8}
            width={width / 2 - 8}
            height="3"
            class="fill-scene-line/20"
          />
          <path
            d="M{-width / 2 + 5} {GROUND_Y - 12}h{width / 2 - 8}"
            class="stroke-scene-wood"
            stroke-width="1.6"
          />
          <path
            d="M{-width / 2 + 5} {top + 8}l-5 -1.6V{GROUND_Y - 6.4}l5 -1.6Z"
            class="fill-scene-wood"
          />
          <path
            d="M{-width / 2 + 5} {top + 8}l-5 -1.6V{GROUND_Y - 6.4}l5 -1.6Z"
            class="fill-white/15"
          />
          <path
            d="M-3 {top + 8}l5 -1.6V{GROUND_Y - 6.4}l-5 -1.6Z"
            class="fill-scene-wood"
          />
          <path
            d="M-3 {top + 8}l5 -1.6V{GROUND_Y - 6.4}l-5 -1.6Z"
            class="fill-scene-line/15"
          />
          <path
            d="M{-width / 2 + 1.4} {top + 22}v6M0.4 {top + 22}v6"
            class="stroke-scene-line/50"
            stroke-width="1.2"
          />
          {/if}
          <path
            d="M2 {top + 6}V{GROUND_Y - 4}M{width / 4 + 1} {top + 6}V{GROUND_Y - 4}"
            class="stroke-scene-line/25"
            stroke-width="0.8"
          />
          <path
            d="M2 {top + 15}H{width / 2 - 1}"
            class="stroke-scene-line/25"
            stroke-width="0.8"
          />
          <path
            d="M{width / 8} {top + 10}h4M{width / 8} {top + 24}v6M{(width * 3) / 8 -
              2} {top + 24}v6"
            class="stroke-scene-line/50"
            stroke-width="1.4"
          />
        {:else}
          <!-- Two closed doors. -->
          <path
            d="M0 {top + 6}V{GROUND_Y - 4}"
            class="stroke-scene-line/25"
            stroke-width="0.8"
          />
          <path
            d="M-3 {top + 10}v6M3 {top + 10}v6"
            class="stroke-scene-line/50"
            stroke-width="1.4"
          />
        {/if}
        <rect
          x={-width / 2 + 1}
          y={GROUND_Y - 4}
          width={width - 2}
          height="4"
          class="fill-scene-line/30"
        />
        <rect
          x={-width / 2 - 1}
          y={top - 1}
          width={width + 2}
          height="3.4"
          rx="1"
          class="fill-scene-edge"
        />
        {#if sink !== undefined}
          <g data-set-id="{piece.id}-sink">
          <!-- The sink, sunk in the worktop, and its tap curving over it from the back. -->
          <!-- A steel sink: its rim on the worktop, the basin's dark inside, and its front dropping below the edge. -->
          <rect
            x={sink - SINK.half - 1.4}
            y={top - 1.2}
            width={SINK.half * 2 + 2.8}
            height="2.6"
            rx="0.8"
            class="fill-scene-steel-light"
          />
          <path
            d="M{sink - SINK.half} {top - 0.4}h{SINK.half * 2}l-1.5 1.4h{3 -
              SINK.half * 2}Z"
            class="fill-scene-steel-dark"
          />
          <path
            d="M{sink - SINK.half} {top + 2.2}h{SINK.half * 2}v4q0 1.2-1.2 1.2h{2.4 -
              SINK.half * 2}q-1.2 0-1.2-1.2Z"
            class="fill-scene-steel"
          />
          <path
            d="M{sink - SINK.half + 2} {top + 3.6}h{SINK.half * 2 - 4}"
            class="stroke-white/50"
            stroke-width="0.6"
          />
          <path
            d="M{sink + 6} {top - 1}V{top - SINK.spout + 3}Q{sink + 6} {top -
              SINK.spout} {sink + 3} {top - SINK.spout}H{sink}"
            class="stroke-scene-steel-dark"
            stroke-width="1.6"
          />
          <path
            d="M{sink + 6} {top - 7}h2.5"
            class="stroke-scene-line/70"
            stroke-width="1.2"
          />
          {#if running.includes(piece.id) && !filling.some((pot) => pot.piece === piece.id)}
            <!-- Outlined, so water shows against the white tiles. -->
            <path
              d="M{sink} {top - SINK.spout + 1}V{top - 1}"
              class="stroke-portrait-ink/35"
              stroke-width="2.8"
            />
            <path
              d="M{sink} {top - SINK.spout + 1}V{top - 1}"
              class="animate-pour stroke-scene-water"
              stroke-width="1.8"
              stroke-dasharray="3 1"
            />
          {/if}
          </g>
        {/if}
        {#if sink !== undefined}
          <!-- An oil bottle between the sink and the board, and a bowl of apples at the counter's free end. -->
          <path
            d="M2.6 {top - 1}v-9q0-2 1-3v-3h1.6v3q1 1 1 3v9Z"
            class="fill-scene-pear/80"
          />
          <rect x="3.6" y={top - 15.6} width="1.6" height="1.4" class="fill-scene-red" />
          <path d="M-46 {top - 1}h12l1.4 -4h-14.8Z" class="fill-scene-blue/60" />
          <circle cx="-42" cy={top - 6.4} r="2.4" class="fill-scene-apple" />
          <circle cx="-37.6" cy={top - 6.6} r="2.4" class="fill-scene-pear" />
          <circle cx="-39.8" cy={top - 8.8} r="2.2" class="fill-scene-apple" />
        {:else}
          <!-- A stoneware crock of flour with its lid. -->
          <path d="M10.4 {top - 1}v-9q0-1.4 1.2-1.4h4.6q1.2 0 1.2 1.4v9Z" class="fill-scene-sand" />
          <rect x="10" y={top - 12.6} width="7.8" height="2" rx="1" class="fill-scene-coffee/70" />
          <path d="M10.4 {top - 6}h7" class="stroke-scene-blue/50" stroke-width="1" />
        {/if}
      {:else if piece.kind === "stove"}
        <!-- The cooker hood over it, its duct up to the underside of the wall cupboards. -->
        <rect x="-6" y={top - 93} width="12" height="31" class="fill-scene-steel-light" />
        <path
          d="M-13 {top - 64}H13L22 {top - 52}H-22Z"
          class="fill-scene-steel"
        />
        <rect x="-22" y={top - 52} width="44" height="2.4" class="fill-scene-steel-dark" />
        <path d="M-4 {top - 58}h8" class="stroke-white/60" stroke-width="1" />
        <!-- The backguard behind the hob, and the pan supports over the burners. -->
        <rect
          x={-width / 2}
          y={top - 7}
          {width}
          height="7"
          rx="1"
          class="fill-portrait-bib"
        />
        <rect x={-width / 2} y={top - 7} {width} height="7" rx="1" class="fill-scene-line/10" />
        <rect
          x={-width / 2}
          y={top + 1}
          {width}
          height={GROUND_Y - top - 1}
          rx="1"
          class="fill-portrait-bib"
        />
        <rect
          x={-width / 2 + 4}
          y={top + 11}
          width={width - 8}
          height="22"
          rx="1.5"
          class="fill-scene-line/20"
        />
        <path
          d="M{-width / 2 + 7} {top + 9}h{width - 14}"
          class="stroke-scene-steel-dark"
          stroke-width="2"
        />
        {#each [-12, -4, 4, 12] as knob, index (knob)}
          <circle cx={knob} cy={top + 4.6} r="1.3" class="fill-scene-line/60" />
          <!-- The burner the pot goes on is the cook's side's. -->
          {#if index === 3}
            <path
              d="M{knob} {top + 4.6}l{lit ? 1 : 0} -1.3"
              class="stroke-white"
              stroke-width="0.6"
            />
          {/if}
        {/each}
        <rect
          x={-width / 2 - 1}
          y={top - 1}
          width={width + 2}
          height="3"
          rx="1"
          class="fill-scene-line/80"
        />
        <path
          d="M{-width / 2 + 1} {top - 1}v-2.2h7v2.2M{width / 2 - 1} {top - 1}v-2.2h-7v2.2"
          class="stroke-portrait-ink/70"
          stroke-width="1.2"
          fill="none"
        />
        <!-- The oven's glass and the drawer under it. -->
        <path
          d="M{-width / 2 + 7} {top + 14}l6 -2v8Z"
          class="fill-white/30"
        />
        <path
          d="M{-width / 2 + 3} {GROUND_Y - 7}h{width - 6}"
          class="stroke-scene-line/30"
          stroke-width="0.8"
        />
        <path d="M-4 {GROUND_Y - 4.5}h8" class="stroke-scene-line/50" stroke-width="1.2" />
        {#if lit}
          <!-- The gas, a ring of blue under the pot. -->
          <g class="animate-flicker [transform-box:fill-box] origin-bottom">
            {#each [-8, -4, 0, 4, 8] as x (x)}
              <path
                d="M{x - 1.2} {top - 1}L{x} {top - 3.6}L{x + 1.2} {top - 1}Z"
                class="fill-scene-blue"
                stroke="none"
              />
            {/each}
          </g>
        {/if}
      {:else if piece.kind === "rail" && piece.coats}
        <!-- A board of hooks by the door: the lead's in the middle, a scarf and a jacket on the two past it. -->
        <rect x="-6" y={top - 7} width="30" height="7" rx="1.2" class="fill-scene-wood" />
        <rect x="-6" y={top - 1.4} width="30" height="1.4" class="fill-scene-coffee/30" />
        <circle cx="-3.4" cy={top - 4} r="0.7" class="fill-scene-coffee/70" />
        <circle cx="21.4" cy={top - 4} r="0.7" class="fill-scene-coffee/70" />
        {#each [0, 8, 17] as x (x)}
          <circle cx={x} cy={top - 1.2} r="1.3" class="fill-scene-steel-dark" />
        {/each}
        <path d="M6.4 {top - 0.6}h3.2l0.4 21-1.6 1.4-1.6-1.4Z" class="fill-scene-red-mid" />
        <path d="M6.6 {top + 17}h3M6.6 {top + 19}h3" class="stroke-white/60" stroke-width="0.7" />
        <path
          d="M14.6 {top - 0.4}Q17 {top - 1.4} 19.4 {top - 0.4}L23.6 {top + 4}L24.2 {top +
            24}H9.8L10.4 {top + 4}Z"
          class="fill-scene-green-mid"
        />
        <path
          d="M17 {top}V{top + 24}M14 {top + 2}L17 {top + 8}L20 {top + 2}"
          class="stroke-scene-line/40"
          stroke-width="0.7"
        />
        <path d="M11 {top + 15}h4M19 {top + 15}h4" class="stroke-scene-line/30" stroke-width="0.7" />
      {:else if piece.kind === "rail" && width <= 6}
        <path d="M-1.6 {top - 2.4}h3.2" class="stroke-scene-line/80" stroke-width="2" />
        <path
          d="M0 {top - 2}v2.2q0 1.4 1.4 1.4"
          class="stroke-scene-line"
          stroke-width="1.2"
        />
      {:else if piece.kind === "rail"}
        <path
          d="M{-width / 2} {top}h{width}"
          class="stroke-scene-line/80"
          stroke-width="1.6"
        />
        <path
          d="M{-width / 2} {top - 1}v2M{width / 2} {top - 1}v2"
          class="stroke-scene-line"
          stroke-width="2.4"
        />
        {#if piece.utensils}
          <!-- A whisk and a turner that always hang there, left of the spoon's and ladle's hooks. -->
          <path d="M-11 {top}v9" class="stroke-scene-steel-dark" stroke-width="1.2" />
          <path
            d="M-11 {top + 8}q-3 4 0 9q3-5 0-9M-11 {top + 8}v9"
            class="stroke-scene-steel"
            stroke-width="0.7"
            fill="none"
          />
          <path d="M-4 {top}v11" class="stroke-scene-coffee" stroke-width="1.4" />
          <rect x="-6" y={top + 11} width="4" height="6" rx="0.8" class="fill-portrait-vest" />
        {/if}
      {:else if piece.kind === "floor" && used(piece)}
        <!-- A rubber mat under the dog's bowl. -->
        <rect
          x={-width / 2}
          y={GROUND_Y - 1.4}
          {width}
          height="2.8"
          rx="1.4"
          class="fill-scene-green-mid"
        />
        <path
          d="M{-width / 2 + 2} {GROUND_Y}h{width - 4}"
          class="stroke-white/40"
          stroke-width="0.6"
          stroke-dasharray="1.6 1.6"
        />
      {:else if piece.kind === "bag"}
        <!-- A canvas shopping bag set down on the floor, its handles up. -->
        <path
          d="M-5 {top - 12}Q-5 {top - 19} 0 {top - 19}Q5 {top - 19} 5 {top - 12}"
          class="stroke-scene-line/60"
          stroke-width="1.3"
        />
        <path
          d="M-9 {top - 13}h18l-1.1 11.8a1.6 1.6 0 0 1-1.6 1.2h-12.6a1.6 1.6 0 0 1-1.6-1.2Z"
          class="fill-scene-clay"
        />
        <path d="M-8.6 {top - 9}h17.2" class="stroke-white/40" stroke-width="1.1" />
        <path d="M-9 {top - 13}h18l-0.2 1.4h-17.6Z" class="fill-scene-line/15" />
      {:else if piece.kind === "stand"}
        {@const hem = GROUND_Y - 8}
        {@const half = width / 2}
        <!-- The farm stall's selling counter, in the red gingham of the stall's own, over whoever sells behind it. -->
        <path
          d="M{-half + 5} {hem}V{GROUND_Y}M{half - 5} {hem}V{GROUND_Y}"
          class="stroke-scene-coffee/70"
          stroke-width="2.4"
        />
        <rect x={-half} y={top} {width} height={hem - top} class="fill-scene-warm" />
        {#each Array.from({ length: Math.floor(width / 6) }, (_, index) => -half + index * 6) as x (x)}
          <rect {x} y={top} width="3" height={hem - top} class="fill-scene-red/20" />
        {/each}
        {#each Array.from({ length: Math.floor((hem - top) / 6) }, (_, index) => top + 3 + index * 6) as y (y)}
          <rect x={-half} {y} {width} height="3" class="fill-scene-red/20" />
        {/each}
        <path d="M{-half} {hem}H{half}" class="stroke-scene-line/25" stroke-width="0.8" />
        <rect x={-half - 1} y={top - 1} width={width + 2} height="3" rx="1" class="fill-scene-wood" />
        <rect x={-half - 1} y={top + 1} width={width + 2} height="1" class="fill-scene-coffee/30" />
        <!-- Tento syr by the buyer: a big smoked oštiepok stood on end. -->
        <g transform="translate({-half + 15} {top - 1}) scale(2.2)" data-set-id="{piece.id}-near-cheese">
          {@render ostiepok()}
        </g>
        <!-- Tamten at the far end: small ones on a board, cheaper; Lucia sells one off the front (the cheese object). -->
        <g transform="translate({half - 12} {top - 1})" data-set-id="{piece.id}-far-cheese">
          <rect x="-10" y="-2.4" width="20" height="2.4" rx="0.8" class="fill-scene-wood" />
          <rect x="-10" y="-2.4" width="20" height="2.4" rx="0.8" class="fill-scene-coffee/25" />
          {#each [-5, 5] as dx (dx)}
            <g transform="translate({dx} -2.4) scale(1.3)">{@render ostiepok()}</g>
          {/each}
        </g>
        <!-- Their prices on cards pinned to the cloth under them, big enough to read on a phone. -->
        {#each [{ dx: -half + 15, price: "5 €" }, { dx: half - 12, price: "3 €" }] as { dx, price } (price)}
          <g transform="translate({dx} {top + 4})">
            <rect x="-10.5" y="0" width="21" height="13" rx="1.5" class="fill-white stroke-scene-line/30" stroke-width="0.6" />
            <circle cx="0" cy="1.6" r="0.9" class="fill-scene-red" />
            <text
              x="0"
              y="10.6"
              text-anchor="middle"
              font-size="9.5"
              font-weight="700"
              class="fill-scene-line"
              stroke="none">{price}</text
            >
          </g>
        {/each}
        <!-- A shop scale, big enough to weigh a cheese on. -->
        <g transform="translate(18 {top}) scale(1.35)" data-set-id="{piece.id}-scale">
          <path d="M-5.5 0h11" class="stroke-scene-line/25" stroke-width="0.8" />
          <rect x="-4.5" y="-9" width="9" height="8" rx="1" class="fill-scene-steel-light" />
          <circle cx="0" cy="-5" r="2.6" class="fill-white" />
          <path d="M0 -5l1.2 -1.6" class="stroke-scene-red" stroke-width="0.6" />
          <path d="M0 -9v-1.6" class="stroke-scene-steel-dark" stroke-width="1.2" />
          <rect x="-5.5" y="-12" width="11" height="1.6" rx="0.8" class="fill-scene-steel" />
        </g>
      {:else if piece.kind === "bar"}
        {@const half = width / 2}
        {@const flap = -half + 9}
        <!-- Down past the floor line, over the feet of whoever works behind it. -->
        <ellipse cx="0" cy={GROUND_Y + 4.5} rx={half + 3} ry="1.8" class="fill-portrait-ink/15" />
        <rect x={-half + 1} y={top + 2} width={width - 2} height={GROUND_Y - top + 2} class="fill-scene-wood" />
        {#each Array.from({ length: Math.floor(width / 6) - 1 }, (_, index) => -half + 6 + index * 6) as x (x)}
          <path d="M{x} {top + 6}V{GROUND_Y - 2}" class="stroke-scene-coffee/20" stroke-width="0.6" />
        {/each}
        <rect x={-half + 1} y={GROUND_Y - 1} width={width - 2} height="5" class="fill-scene-coffee/60" />
        <rect x={-half + 1} y={top + 2} width={width - 2} height="2" class="fill-scene-coffee/30" />
        {#each [-1, 1] as side (side)}
          <rect x={side < 0 ? -half - 1 : half - 3} y={top + 2} width="4" height={GROUND_Y - top + 2} class="fill-scene-coffee" />
        {/each}
        <rect x={-half - 2} y={top - 1} width={width + 4} height="3.4" rx="1" class="fill-scene-coffee" />
        <!-- The lift-up flap the waiter comes out through: a seam in the top on two hinges. -->
        <path d="M{flap} {top - 1}v3.4" class="stroke-portrait-ink/50" stroke-width="0.6" />
        {#each [-1.6, 1.6] as dx (dx)}
          <rect x={flap + dx - 1} y={top - 1.8} width="2" height="1" rx="0.3" class="fill-scene-steel" />
        {/each}
        <path d="M{-half + 3} {GROUND_Y - 8}H{half - 3}" class="stroke-scene-steel" stroke-width="1.4" />
        {#each [-half + 8, 0, half - 8] as x (x)}
          <path d="M{x} {GROUND_Y - 8}v-3" class="stroke-scene-steel-dark" stroke-width="1" />
        {/each}
        <!-- Saucers where the coffees wait (CAFE_SET's ledge), under the machine's group heads, with the waiter beside it rather than behind it. -->
        {#each [-19, -7] as x (x)}
          <ellipse cx={x} cy={top - 1.3} rx="4.4" ry="0.9" class="fill-white" />
        {/each}
        <g transform="translate(-13 {top - 1})" data-set-id="{piece.id}-machine">
          <rect x="-11" y="-22" width="22" height="22" rx="1" class="fill-scene-steel-dark" />
          <rect x="-11" y="-22" width="22" height="12" rx="1.5" class="fill-scene-steel" />
          <rect x="-11.5" y="-23.4" width="23" height="1.8" rx="0.9" class="fill-scene-steel-light" />
          {#each [-6.5, 0, 6.5] as x (x)}
            <path d="M{x - 2.6} -23.4h5.2l-0.5 -0.6h-4.2Z" class="fill-white" />
            <path d="M{x - 1.8} -24l0.4 -2.4h2.8l0.4 2.4Z" class="fill-white" />
          {/each}
          <circle cx="0" cy="-16" r="2.4" class="fill-white" />
          <path d="M0 -16l1.3 -1.3" class="stroke-scene-red" stroke-width="0.5" />
          {#each [-6, 6] as x (x)}
            <rect x={x - 2.4} y="-10" width="4.8" height="1.8" rx="0.5" class="fill-scene-steel-light" />
            <path d="M{x} -8.6h{x < 0 ? -5 : 5}" class="stroke-portrait-vest" stroke-width="1.2" />
            <path d="M{x - 0.8} -8.2v1.2M{x + 0.8} -8.2v1.2" class="stroke-scene-steel-dark" stroke-width="0.5" />
          {/each}
          <path d="M9.8 -11v7l-1.4 2" class="stroke-scene-steel-light" fill="none" stroke-width="0.8" />
          <rect x="-10" y="-1.6" width="20" height="1.6" rx="0.4" class="fill-scene-steel" />
        </g>
        <!-- With no coffees of the story's on the bar, two wait there anyway. -->
        {#if !Object.values(world.objects).some((object) => object.kind === "cup")}
          {#each [-19, -7] as x (x)}
            <path d="M{x - 3} {top - 1.6}v-4.6q0 -1 1 -1h4q1 0 1 1v4.6Z" class="fill-white" />
            <path d="M{x + 3} {top - 5.4}q2 0 2 1.4t-2 1.4" class="stroke-white" fill="none" stroke-width="0.8" />
            <path d="M{x - 2.4} {top - 6.6}h4.8" class="stroke-scene-coffee" stroke-width="0.7" />
          {/each}
        {/if}
        <g transform="translate(3 {top - 1})">
          <path d="M-1.8 0l0.3 -5.4h3l0.3 5.4Z" class="fill-scene-steel-light" />
          <path d="M1.5 -5.4l1.2 -0.8" class="stroke-scene-steel-light" stroke-width="0.6" />
          <path d="M-1.6 -4.4q-1.6 0 -1.6 1.6t1.6 1.4" class="stroke-scene-steel" fill="none" stroke-width="0.5" />
        </g>
        <g transform="translate(8.5 {top - 1})">
          <rect x="-3" y="-11" width="6" height="11" rx="0.8" class="fill-portrait-vest" />
          <rect x="-1.6" y="-5" width="3.2" height="2" class="fill-scene-steel" />
          <path d="M-3.6 -11l1 -8h5.2l1 8Z" class="fill-white/60" />
          <path d="M-2.8 -11.6l0.8 -5.6h4l0.8 5.6Z" class="fill-scene-coffee" />
          <rect x="-3" y="-20.4" width="6" height="1.6" rx="0.6" class="fill-portrait-vest" />
        </g>
        <g transform="translate(14.5 {top - 1})">
          <rect x="-3.4" y="-2.4" width="6.8" height="2.4" rx="0.4" class="fill-portrait-vest" />
          <path d="M-0.6 -2.4l-0.6 -4h2.4l-0.6 4Z" class="fill-scene-steel-dark" />
          <rect x="-4" y="-13" width="8" height="6.4" rx="0.8" class="fill-portrait-vest" transform="rotate(-8 0 -7)" />
          <rect x="-3.2" y="-12.2" width="6.4" height="4.8" class="fill-scene-sky" transform="rotate(-8 0 -7)" />
          <path d="M-2.4 -11h3M-2.4 -9.4h4.4" class="stroke-scene-coffee/50" stroke-width="0.5" transform="rotate(-8 0 -7)" />
        </g>
        <g transform="translate(20.5 {top - 1})">
          <path d="M-2 0l0.6 -2h2.8l0.6 2Z" class="fill-scene-steel-dark" />
          <rect x="-1.8" y="-7.4" width="3.6" height="5.6" rx="0.6" class="fill-portrait-vest" transform="rotate(-12 0 -2)" />
          <rect x="-1.2" y="-6.8" width="2.4" height="1.6" class="fill-scene-sky" transform="rotate(-12 0 -2)" />
        </g>
        <g transform="translate({half - 10} {top - 1})">
          <rect x="-7.8" y="-1.8" width="15.6" height="1.8" rx="0.4" class="fill-scene-coffee" />
          <rect x="-7" y="-15.4" width="14" height="13.6" class="fill-scene-sky/60" />
          <path d="M-7 -8.6h14" class="stroke-scene-steel" stroke-width="0.8" />
          {#each [-5.8, -1.8, 2.2] as x (x)}
            <rect {x} y="-13.8" width="3.6" height="4.4" class="fill-scene-honey" />
            <rect {x} y="-12.2" width="3.6" height="0.7" class="fill-white" />
            <rect {x} y="-13.8" width="3.6" height="1" class="fill-scene-coffee" />
            <circle cx={x + 1.8} cy="-14.3" r="0.6" class="fill-scene-red" />
          {/each}
          <rect x="-6.2" y="-5.6" width="7" height="3" rx="1.4" class="fill-scene-onion" />
          <path d="M-5.4 -5.4h5.4" class="stroke-white" stroke-width="0.5" stroke-dasharray="0.6 1" />
          <ellipse cx="4" cy="-2.9" rx="2.4" ry="1" class="fill-scene-onion" />
          <ellipse cx="4" cy="-3.4" rx="1.4" ry="0.5" class="fill-scene-plum" />
          <rect x="-7.6" y="-16.4" width="15.2" height="1.2" rx="0.4" class="fill-scene-steel" />
          <path d="M-7 -15.4v13.6M7 -15.4v13.6" class="stroke-scene-steel" stroke-width="0.8" />
          <path d="M-5.6 -3l4 -10" class="stroke-white/70" stroke-width="0.6" />
        </g>
      {:else if piece.kind === "stool"}
        <!-- Its feet below the floor line, as it stands out in front of the bar's foot. -->
        <ellipse cx="0" cy={GROUND_Y + 7.4} rx={width / 2} ry="0.8" class="fill-portrait-ink/10" />
        <path
          d="M-3 {top + 2}L{-width / 2 + 1} {GROUND_Y + 7}M3 {top + 2}L{width / 2 - 1} {GROUND_Y + 7}M-1 {top + 2}L-2 {GROUND_Y + 7}M1 {top + 2}L2 {GROUND_Y + 7}"
          class="stroke-scene-steel-dark"
          stroke-width="1.2"
        />
        <ellipse cx="0" cy={GROUND_Y - 5} rx={width / 2 - 2.2} ry="1.4" class="stroke-scene-steel" fill="none" stroke-width="1" />
        <rect x={-width / 2} y={top} {width} height="3" rx="1.4" class="fill-scene-coffee" />
        <ellipse cx="0" cy={top} rx={width / 2} ry="1.6" class="fill-scene-green" />
      {:else if piece.kind === "bistro"}
        {#each [-1, 1] as side (side)}
          {@const back = side * (width / 2 - 2)}
          {@const front = side * (width / 2 - 20)}
          <g data-set-id="{piece.id}-chair-{side < 0 ? 'l' : 'r'}">
          <path
            d="M{back} {GROUND_Y - 22}Q{back + side * 2} {GROUND_Y - 36} {back + side * 3} {GROUND_Y - 48}q{-side * 1.4} -2 {-side * 3} 0"
            class="stroke-scene-coffee"
            stroke-width="2.2"
          />
          <path
            d="M{back - side} {GROUND_Y - 20}L{back + side * 1.5} {GROUND_Y}M{front} {GROUND_Y - 20}L{front - side * 2} {GROUND_Y}M{back - side * 2} {GROUND_Y - 8}H{front}"
            class="stroke-scene-coffee"
            stroke-width="1.8"
          />
          <ellipse cx={(back + front) / 2} cy={GROUND_Y - 21.4} rx={Math.abs(back - front) / 2 + 1.4} ry="1.8" class="fill-scene-coffee" />
          <ellipse cx={(back + front) / 2} cy={GROUND_Y - 22.6} rx={Math.abs(back - front) / 2 + 1.4} ry="1.8" class="fill-scene-wood" />
          </g>
        {/each}
        <g data-set-id="{piece.id}-top">
        <path d="M-1 {top + 2}h2V{GROUND_Y - 2}h-2Z" class="fill-scene-line/80" />
        <path d="M-9 {GROUND_Y}q9 -5 18 0Z" class="fill-scene-line/80" />
        <ellipse cx="0" cy={top + 1.4} rx="17" ry="2.4" class="fill-scene-edge" />
        <ellipse cx="0" cy={top} rx="17" ry="2.4" class="fill-portrait-bib" />
        {#each [-9, 5] as x (x)}
          <path d="M{x - 3.5} {top - 0.4}h7" class="stroke-scene-line/40" stroke-width="0.9" />
          <path d="M{x - 2.4} {top - 0.8}v-3.4h4.8v3.4Z" class="fill-white" />
          <path d="M{x + 2.4} {top - 3.6}q2 0 2 1.3t-2 1.3" class="stroke-white" fill="none" stroke-width="0.7" />
          <path d="M{x - 2.4} {top - 4.2}h4.8" class="stroke-scene-coffee" stroke-width="0.6" />
        {/each}
        <rect x="-1.4" y={top - 5} width="2.8" height="4.6" rx="1" class="fill-scene-sky" />
        <path d="M0 {top - 5}v-4" class="stroke-scene-leaf" stroke-width="0.6" />
        <circle cx="0" cy={top - 9.4} r="1.5" class="fill-scene-red-mid" />
        </g>
      {:else if piece.kind === "reception"}
        <!-- Down past the floor line, over the feet of whoever stands behind it. -->
        <ellipse cx="0" cy={GROUND_Y + 4.5} rx={width / 2 + 3} ry="1.8" class="fill-portrait-ink/15" />
        <rect x={-width / 2} y={top + 3} {width} height={GROUND_Y - top + 1} class="fill-scene-wood" />
        {#each [-0.375, -0.125, 0.125, 0.375] as at (at)}
          <rect
            x={at * width - width / 8 + 2}
            y={top + 8}
            width={width / 4 - 4}
            height={GROUND_Y - top - 16}
            rx="1"
            class="fill-scene-line/8"
          />
        {/each}
        <rect x={-width / 2} y={GROUND_Y} {width} height="4" class="fill-scene-coffee/50" />
        <rect x={-width / 2} y={top + 3} {width} height="1.5" class="fill-scene-line/20" />
        <rect x={-width / 2 - 2} y={top - 1} width={width + 4} height="4" rx="1" class="fill-portrait-bib" />
        <rect x="-11" y={top + 12} width="22" height="6" rx="1" class="fill-scene-honey" />
        <text x="0" y={top + 16.4} text-anchor="middle" font-size="3.8" font-weight="700" class="fill-scene-coffee font-sans">
          Recepcia
        </text>
        <g transform="translate({-width / 2 + 8} {top - 1})" data-set-id="{piece.id}-bell">
          <rect x="-4" y="-1" width="8" height="1" rx="0.5" class="fill-scene-steel-dark" />
          <path d="M-3.4 -1a3.4 3.4 0 0 1 6.8 0Z" class="fill-scene-honey" />
          <rect x="-0.4" y="-5.6" width="0.8" height="1.4" class="fill-scene-steel-dark" />
        </g>
        <g transform="translate(-6 {top - 1})">
          <path d="M-6 0l1 -2h10l1 2Z" class="fill-white" />
          <path d="M-5 -2.4l1 -1h8l1 1" class="fill-portrait-bib" />
          <path d="M-3 -3.6l7 -1.2" class="stroke-portrait-ink" stroke-width="0.6" />
        </g>
        <g transform="translate({width / 2 - 16} {top - 1})" data-set-id="{piece.id}-computer">
          <rect x="-4" y="-1" width="8" height="1" rx="0.5" class="fill-portrait-vest" />
          <rect x="-0.8" y="-5" width="1.6" height="4.4" class="fill-portrait-vest" />
          <rect x="-9" y="-17" width="18" height="12.5" rx="1" class="fill-portrait-vest" />
          <!-- Its back to the visitor: the screen faces whoever works behind the desk. -->
          <rect x="-5" y="-14.6" width="10" height="7" rx="1.4" class="fill-scene-line/60" />
          <path d="M-3 -12.6h6M-3 -10.8h6M-3 -9h6" class="stroke-portrait-vest" stroke-width="0.5" />
        </g>
        <g transform="translate({width / 2 - 4} {top - 1})">
          <path d="M-1.4 -5.6l0.6 -3M0 -5.6l0.2 -3.4M1.4 -5.6l1 -2.6" class="stroke-scene-blue" stroke-width="0.6" />
          <rect x="-2.4" y="-5.6" width="4.8" height="5.6" rx="0.6" class="fill-scene-green-mid" />
        </g>
      {:else if piece.kind === "table"}
        <path
          d="M{-width / 2 + 6} {top + 3}V{GROUND_Y}M{width / 2 - 6} {top + 3}V{GROUND_Y}"
          class="stroke-scene-line/60"
          stroke-width="3"
        />
        <rect
          x={-width / 2}
          y={top}
          {width}
          height="5"
          rx="1.5"
          class="fill-scene-wood"
        />
        <path
          d="M{-width / 2 + 2} {top + 5}h{width - 4}"
          class="stroke-scene-line/30"
          stroke-width="1"
        />
        {#if piece.cloth}
          <!-- A white cloth with a red check, hanging a hand's width over the edges. -->
          <path
            d="M{-width / 2 - 2} {top - 0.6}H{width / 2 + 2}L{width / 2 + 3} {top +
              11}H{-width / 2 - 3}Z"
            class="fill-portrait-bib"
          />
          {#each Array.from({ length: Math.floor((width + 4) / 5) }, (_, index) => -width / 2 - 1 + index * 5) as x (x)}
            <rect {x} y={top - 0.6} width="2.4" height="11.6" class="fill-scene-red/20" />
          {/each}
          {#each [top + 2, top + 7] as y (y)}
            <rect
              x={-width / 2 - 2.6}
              {y}
              width={width + 5.2}
              height="2.4"
              class="fill-scene-red/20"
            />
          {/each}
          <path
            d="M{-width / 2 - 3} {top + 11}H{width / 2 + 3}"
            class="stroke-scene-red/50"
            stroke-width="1"
          />
        {/if}
      {/if}
    </g>
  {/each}

  {#each placed as { id, state, at, sink } (id)}
    {#if sink}
      <clipPath id="{uid}-sink-{id}">
        <path
          d="M{n(view.x)} {n(view.y)}h{n(view.width)}v{n(view.height)}h{n(
            -view.width,
          )}ZM{n(sink.left)} {n(sink.top)}H{n(sink.right)}V{n(GROUND_Y)}H{n(sink.left)}Z"
          clip-rule="evenodd"
        />
      </clipPath>
    {/if}
    <g clip-path={sink ? `url(#${uid}-sink-${id})` : undefined}>
      <!-- A CSS translate, so what is pushed across a desk glides there: user units are px here. -->
      <g
        style:transform="translate({n(at.x)}px, {n(at.y)}px){state.turned
          ? ' scale(-1, 1)'
          : ''}"
        style:transition={gliding[id]
          ? `transform ${gliding[id]}ms cubic-bezier(0.2, 0.6, 0.3, 1)`
          : undefined}
        data-set-id={id}
      >
        <StickSetObject
          kind={state.kind}
          bitten={state.bitten}
          fill={state.fill}
          heat={state.heat}
          cut={state.cut}
          wilt={state.wilt}
          flat={FLAT.has(state.kind)}
          hang={hangs(world, id, geometry)}
          open={state.kind === "pot" ? !lidOn(id) : undefined}
          bits={state.kind === "pot" &&
            contents(world, id).some(
              (inside) => world.objects[inside]?.kind === "carrot",
            )}
          rattle={state.kind === "lid" && rattles(id)}
        />
      </g>
    </g>
  {/each}

  {#each filling as pot (pot.id)}
    {#if pot.empty}
      <ellipse
        cx={n(pot.x)}
        cy={n(pot.rim + 0.2)}
        rx="10.4"
        ry="1.5"
        class="animate-fill-up fill-scene-water [transform-box:fill-box] origin-center"
        stroke="none"
      />
    {/if}
    <path
      d="M{n(pot.x)} {n(pot.spout + 1)}V{n(pot.rim + 0.4)}"
      class="stroke-portrait-ink/35"
      stroke-width="2.8"
    />
    <path
      d="M{n(pot.x)} {n(pot.spout + 1)}V{n(pot.rim + 0.4)}"
      class="animate-pour stroke-scene-water"
      stroke-width="1.8"
      stroke-dasharray="3 1"
    />
    <path
      d="M{n(pot.x - 3.2)} {n(pot.rim + 0.3)}q1.6 -1.3 3.2 0q1.6 -1.3 3.2 0"
      class="stroke-white/80"
      stroke-width="0.6"
    />
  {/each}
</svg>

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
        piece.kind !== "floor" &&
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

  function pieceX(piece: SetPiece): number {
    return geometry.pieceX(piece.id) ?? 0;
  }
</script>

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
      {#if piece.kind !== "rail"}
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
        {#if sink !== undefined}
          <!-- The cupboard under the sink stands open: the big pot lives on its shelf. -->
          <rect
            x={-width / 2 + 5}
            y={top + 8}
            width={width / 2 - 8}
            height={GROUND_Y - top - 16}
            rx="1"
            class="fill-scene-line/45"
          />
          <path
            d="M{-width / 2 + 5} {GROUND_Y - 12}h{width / 2 - 8}"
            class="stroke-scene-wood"
            stroke-width="1.6"
          />
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
          <!-- The sink, sunk in the worktop, and its tap curving over it from the back. -->
          <path
            d="M{sink - SINK.half} {top - 0.6}h{SINK.half * 2}l-1.5 3h{3 -
              SINK.half * 2}Z"
            class="fill-scene-line/45"
          />
          <path
            d="M{sink + 6} {top - 1}V{top - SINK.spout + 3}Q{sink + 6} {top -
              SINK.spout} {sink + 3} {top - SINK.spout}H{sink}"
            class="stroke-scene-line/70"
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
        {/if}
      {:else if piece.kind === "stove"}
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
          class="stroke-scene-line/60"
          stroke-width="1.4"
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
      {:else if piece.kind === "stand"}
        {@const hem = GROUND_Y - 8}
        <!-- A market table: legs under the hem of a green gingham cloth, so it stands apart from the stall's red one. -->
        <path
          d="M{-width / 2 + 4} {hem}V{GROUND_Y}M{width / 2 - 4} {hem}V{GROUND_Y}"
          class="stroke-scene-coffee/70"
          stroke-width="2.4"
        />
        <rect x={-width / 2} y={top} {width} height={hem - top} class="fill-scene-warm" />
        {#each Array.from({ length: Math.floor(width / 6) }, (_, index) => -width / 2 + index * 6) as x (x)}
          <rect {x} y={top} width="3" height={hem - top} class="fill-scene-green/15" />
        {/each}
        {#each Array.from({ length: Math.floor((hem - top) / 6) }, (_, index) => top + 3 + index * 6) as y (y)}
          <rect x={-width / 2} {y} {width} height="3" class="fill-scene-green/15" />
        {/each}
        <path
          d="M{-width / 2} {hem}H{width / 2}"
          class="stroke-scene-line/25"
          stroke-width="0.8"
        />
        <rect x={-width / 2 - 1} y={top - 1} width={width + 2} height="3" rx="1" class="fill-scene-wood" />
        <rect x={-width / 2 - 1} y={top + 1} width={width + 2} height="1" class="fill-scene-coffee/30" />
        <!-- Her oštiepky stood on end on a board, as they hang over the stall, and a bundle of korbáčiky. -->
        <rect x="-8" y={top - 2.4} width="22" height="2.4" rx="0.8" class="fill-scene-wood" />
        <rect x="-8" y={top - 2.4} width="22" height="2.4" rx="0.8" class="fill-scene-coffee/25" />
        <path d="M-8 {top}h22" class="stroke-scene-line/25" stroke-width="0.8" />
        {#each [-3, 3, 9] as x (x)}
          <g transform="translate({x} {top - 2.4})">
            <path
              d="M0 -11C2.6 -10.4 3.4 -7.6 3.4 -5.4C3.4 -2.4 2 -0.6 0 0C-2 -0.6 -3.4 -2.4 -3.4 -5.4C-3.4 -7.6 -2.6 -10.4 0 -11Z"
              class="fill-scene-onion"
            />
            <path d="M1.2 -10.2C3.2 -8 3.2 -2.6 1 -0.6" class="stroke-scene-coffee/30" stroke-width="1" fill="none" />
            <path
              d="M-2.6 -7.2l0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2M-2.8 -4.4l0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2 0.9 1.2 0.9 -1.2"
              class="stroke-scene-coffee/50"
              stroke-width="0.45"
              fill="none"
            />
            <path d="M-1.2 -10.4l1.2 -1.6 1.2 1.6" class="stroke-scene-coffee/70" stroke-width="0.5" fill="none" />
          </g>
        {/each}
        {#each [-1.6, 0, 1.6] as dy (dy)}
          <path
            d="M-36 {top - 2 + dy}q1 -1.2 2 0t2 0 2 0 2 0 2 0 2 0"
            class="stroke-scene-honey"
            stroke-width="1.3"
            fill="none"
          />
        {/each}
        <!-- A shop scale, big enough to weigh a cheese on. -->
        <g transform="translate(-10 {top}) scale(1.35) translate(0 {-top})">
          <path d="M19 {top}h11" class="stroke-scene-line/25" stroke-width="0.8" />
          <rect x="20" y={top - 9} width="9" height="8" rx="1" class="fill-scene-steel-light" />
          <circle cx="24.5" cy={top - 5} r="2.6" class="fill-white" />
          <path d="M24.5 {top - 5}l1.2 -1.6" class="stroke-scene-red" stroke-width="0.6" />
          <path d="M24.5 {top - 9}v-1.6" class="stroke-scene-steel-dark" stroke-width="1.2" />
          <rect x="19" y={top - 12} width="11" height="1.6" rx="0.8" class="fill-scene-steel" />
        </g>
      {:else if piece.kind === "bar"}
        <rect
          x={-width / 2 + 1}
          y={top + 2}
          width={width - 2}
          height={GROUND_Y - top - 2}
          class="fill-scene-wood"
        />
        {#each Array.from({ length: Math.floor(width / 6) - 1 }, (_, index) => -width / 2 + 6 + index * 6) as x (x)}
          <path d="M{x} {top + 6}V{GROUND_Y - 5}" class="stroke-scene-coffee/20" stroke-width="0.6" />
        {/each}
        <rect x={-width / 2 + 1} y={GROUND_Y - 4} width={width - 2} height="4" class="fill-scene-coffee/60" />
        <rect x={-width / 2 + 1} y={top + 2} width={width - 2} height="2" class="fill-scene-coffee/30" />
        <rect x={-width / 2 - 2} y={top - 1} width={width + 4} height="3.4" rx="1" class="fill-scene-coffee" />
        <g transform="translate({width / 2 - 20} {top - 1})">
          <rect x="-17" y="-1.6" width="34" height="1.6" rx="0.4" class="fill-scene-steel-dark" />
          <rect x="-16.4" y="-16" width="32.8" height="14.4" class="fill-scene-sky/70" />
          <path d="M-16 -8.8h32" class="stroke-scene-steel" stroke-width="0.8" />
          {#each [-12, -5, 2] as x (x)}
            <rect {x} y="-14.6" width="5.6" height="5.4" class="fill-scene-honey" />
            <rect {x} y="-12.6" width="5.6" height="0.9" class="fill-white" />
            <rect {x} y="-14.6" width="5.6" height="1.2" class="fill-scene-coffee" />
            <circle cx={x + 2.8} cy="-15.2" r="0.8" class="fill-scene-red" />
          {/each}
          <rect x="-14.6" y="-5.2" width="13" height="3.6" rx="1.6" class="fill-scene-onion" />
          <path d="M-12 -4.8l-1 2.8M-8.6 -4.8l-1 2.8M-5.2 -4.8l-1 2.8" class="stroke-scene-coffee/40" stroke-width="0.5" />
          <path d="M-13.6 -5.1h11" class="stroke-white" stroke-width="0.6" stroke-dasharray="0.6 1" />
          {#each [4, 11] as x (x)}
            <ellipse cx={x} cy="-2.6" rx="3" ry="1.2" class="fill-scene-onion" />
            <ellipse cx={x} cy="-3.2" rx="1.8" ry="0.6" class="fill-scene-plum" />
          {/each}
          <rect x="-17" y="-17" width="34" height="1.4" rx="0.4" class="fill-scene-steel" />
          <path d="M-16.4 -16v14.4M16.4 -16v14.4" class="stroke-scene-steel" stroke-width="0.8" />
          <path d="M-14 -2.6l6 -12M-9 -2.6l3.4 -7" class="stroke-white/70" stroke-width="0.7" />
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
        <g transform="translate({-width / 2 + 8} {top - 1})">
          <rect x="-4" y="-1" width="8" height="1" rx="0.5" class="fill-scene-steel-dark" />
          <path d="M-3.4 -1a3.4 3.4 0 0 1 6.8 0Z" class="fill-scene-honey" />
          <rect x="-0.4" y="-5.6" width="0.8" height="1.4" class="fill-scene-steel-dark" />
        </g>
        <g transform="translate(-6 {top - 1})">
          <path d="M-6 0l1 -2h10l1 2Z" class="fill-white" />
          <path d="M-5 -2.4l1 -1h8l1 1" class="fill-portrait-bib" />
          <path d="M-3 -3.6l7 -1.2" class="stroke-portrait-ink" stroke-width="0.6" />
        </g>
        <g transform="translate({width / 2 - 16} {top - 1})">
          <rect x="-4" y="-1" width="8" height="1" rx="0.5" class="fill-portrait-vest" />
          <rect x="-0.8" y="-5" width="1.6" height="4.4" class="fill-portrait-vest" />
          <rect x="-9" y="-17" width="18" height="12.5" rx="1" class="fill-portrait-vest" />
          <rect x="-9" y="-17" width="2" height="12.5" rx="0.6" class="fill-scene-sky" />
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

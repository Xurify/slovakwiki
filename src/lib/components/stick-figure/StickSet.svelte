<script lang="ts">
  import type { SetObject, World } from "$lib/stick-figure/acts";
  import { n } from "$lib/stick-figure/draw";
  import { GROUND_Y } from "$lib/stick-figure/rig";
  import {
    PIECE_SIZE,
    objectBase,
    pieceTop,
    type SetGeometry,
    type SetPiece,
  } from "$lib/stick-figure/set-pieces";
  import StickSetObject from "./StickSetObject.svelte";

  /**
   * The set the cast works at, drawn at the cast's scale in rig units: the
   * counter and stove on the cast's floor, and every object not in someone's
   * hand where it stands now. `view` is the stage in those units.
   */
  let {
    geometry,
    objects,
    view,
    world,
  }: {
    geometry: SetGeometry;
    objects: readonly SetObject[];
    view: { x: number; y: number; width: number; height: number };
    world: World;
  } = $props();

  function pieceX(piece: SetPiece): number {
    return geometry.pieceX(piece.id) ?? 0;
  }

  /** Inside things draw over what holds them: the lid on the pot, the spoon in the crock. */
  const placed = $derived(
    objects
      .map((object) => ({
        object,
        at: objectBase(world, object.id, objects, geometry),
        state: world.objects[object.id],
        inside: world.objects[object.id] && "in" in world.objects[object.id].where,
      }))
      .filter(({ at, state }) => at && state)
      .sort((a, b) => Number(a.inside) - Number(b.inside)),
  );
  /** The pot breathes steam while it is hot, and pours it out with the lid off. */
  function lidOn(id: string): boolean {
    return Object.entries(world.objects).some(
      ([other, { where }]) =>
        other !== id && "in" in where && where.in === id && objectKind(other) === "lid",
    );
  }
  function objectKind(id: string) {
    return objects.find((object) => object.id === id)?.kind;
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
  {#each geometry.pieces as piece (piece.id)}
    {@const x = pieceX(piece)}
    {@const { width } = PIECE_SIZE[piece.kind]}
    {@const top = pieceTop(piece.kind)}
    <g transform="translate({n(x)} 0)">
      <ellipse
        cx="0"
        cy={GROUND_Y + 0.5}
        rx={width / 2 + 3}
        ry="2.2"
        class="fill-portrait-ink/15"
      />
      {#if piece.kind === "counter"}
        <rect
          x={-width / 2 + 1}
          y={top + 2}
          width={width - 2}
          height={GROUND_Y - top - 3}
          class="fill-scene-wood"
        />
        <path
          d="M0 {top + 6}V{GROUND_Y - 4}"
          class="stroke-scene-line/25"
          stroke-width="0.8"
        />
        <path
          d="M-4 {top + 10}v6M4 {top + 10}v6"
          class="stroke-scene-line/50"
          stroke-width="1.4"
        />
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
        <!-- The sink, sunk in the worktop, and its tap curving over it from the back. -->
        <path d="M-21 {top - 0.6}h24l-1.5 3h-21Z" class="fill-scene-line/45" />
        <path
          d="M-1 {top - 1}V{top - 12}Q-1 {top - 15} -4 {top - 15}H-9"
          class="stroke-scene-line/70"
          stroke-width="1.6"
        />
        <path d="M-1 {top - 7}h2.5" class="stroke-scene-line/70" stroke-width="1.2" />
      {:else}
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
        {#each [-12, -4, 4, 12] as knob (knob)}
          <circle cx={knob} cy={top + 4.6} r="1.3" class="fill-scene-line/60" />
        {/each}
        <rect
          x={-width / 2 - 1}
          y={top - 1}
          width={width + 2}
          height="3"
          rx="1"
          class="fill-scene-line/80"
        />
        <!-- The hob glows under a hot pot. -->
        <path d="M-6 {top - 1.2}h20" class="stroke-scene-red/80" stroke-width="1.2" />
      {/if}
    </g>
  {/each}

  {#each placed as { object, at, state } (object.id)}
    {#if at && state}
      <g transform="translate({n(at.x)} {n(at.y)})">
        <StickSetObject
          kind={object.kind}
          full={state.full}
          heat={state.heat}
          open={object.kind === "pot" ? !lidOn(object.id) : undefined}
        />
      </g>
    {/if}
  {/each}
</svg>

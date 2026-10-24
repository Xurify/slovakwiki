<script lang="ts">
  import FloorShade from "./FloorShade.svelte";

  /** The back wall and the floor of a room, in their paints, shaded where they meet. */
  let { floor, wall }: { floor: string; wall: string } = $props();
</script>

<rect x="-10" y="-10" width="980" height="236" class={wall} />
<rect x="-10" y="226" width="980" height="84" class={floor} />
<FloorShade />

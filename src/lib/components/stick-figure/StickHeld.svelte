<script lang="ts">
  import { n } from "$lib/stick-figure/draw";
  import type { Held } from "$lib/stick-figure/props";
  import type { StickRig } from "$lib/stick-figure/rig";
  import StickProp from "./StickProp.svelte";
  import StickUmbrella from "./StickUmbrella.svelte";

  /** What a figure has in its lead hand: a prop held up, or an umbrella open over them or folded. */
  let { held, rig }: { held: Held; rig: StickRig } = $props();
</script>

{#if held.id === "umbrella"}
  <StickUmbrella {rig} open={held.open ?? false} />
{:else}
  <g transform="translate({n(rig.leadArm.end.x)} {n(rig.leadArm.end.y)})">
    <StickProp prop={held.id} />
  </g>
{/if}

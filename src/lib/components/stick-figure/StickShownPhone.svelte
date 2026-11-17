<script lang="ts">
  import StickPicture from "./StickPicture.svelte";
  import type { StickPictureId } from "$lib/stick-figure/pictures";

  /**
   * The phone in someone's hand, held up large with the photo on its screen, drawn as the same
   * phone as the small one in the hand: its dark body, the lens in the bezel and
   * light off the glass. A plain dark frame read as a tablet or a sign, and a bubble as a thought.
   * Centred on 0,0. No pointer down to the hand: it met the head first and read as a thought again.
   */
  let { picture, zoom }: { picture: StickPictureId; zoom: number } = $props();

  const id = $props.id();
  /** Half the screen, which is the 26×17 picture scaled. */
  const w = $derived(13 * zoom);
  const h = $derived(8.5 * zoom);
  const BEZEL = 1.5;
</script>

<rect
  x={-w - BEZEL}
  y={-h - BEZEL}
  width={2 * w + 2 * BEZEL}
  height={2 * h + 2 * BEZEL}
  rx="4"
  class="fill-portrait-vest"
/>

<clipPath id="{id}-screen">
  <rect x={-w} y={-h} width={2 * w} height={2 * h} rx="2.6" />
</clipPath>
<g clip-path="url(#{id}-screen)">
  <g transform="scale({zoom})">
    <StickPicture {picture} />
  </g>
  <path d="M{-w} {-h}h{w * 0.7}L{-w} {h * 0.35}Z" class="fill-portrait-bib" opacity="0.1" />
</g>

<circle cx={-w - BEZEL / 2} cy="0" r="0.45" class="fill-portrait-ink" />

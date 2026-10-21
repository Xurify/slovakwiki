<script lang="ts">
  /** A soft cloud whose flat base is centred on x, y. */
  let { size = 1, x, y }: { size?: number; x: number; y: number } = $props();
</script>

<g transform="translate({x} {y}) scale({size})" class="fill-white/75">
  <circle cx="-22" cy="-8" r="12" />
  <circle cx="0" cy="-14" r="17" />
  <circle cx="22" cy="-7" r="11" />
  <rect x="-38" y="-10" width="76" height="10" rx="5" />
</g>

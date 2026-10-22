<script lang="ts">
  /** Where the floor meets the wall. */
  let { y = 226 }: { y?: number } = $props();

  const id = $props.id();
</script>

<defs>
  <linearGradient
    id="{id}-shade"
    class="text-scene-line"
    x1="0"
    y1={y}
    x2="0"
    y2={y + 36}
    gradientUnits="userSpaceOnUse"
  >
    <stop offset="0" stop-color="currentColor" stop-opacity="0.2" />
    <stop offset="1" stop-color="currentColor" stop-opacity="0" />
  </linearGradient>
</defs>

<rect x="-10" {y} width="980" height="36" fill="url(#{id}-shade)" />

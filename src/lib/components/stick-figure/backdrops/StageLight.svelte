<script lang="ts">
  const id = $props.id();
</script>

<!-- A soft pool of light behind the cast and darker corners pull the eye to the middle. -->
<defs>
  <radialGradient
    id="{id}-light"
    cx="0"
    cy="0"
    r="1"
    gradientUnits="userSpaceOnUse"
    gradientTransform="translate(480 130) scale(400 180)"
  >
    <stop offset="0" stop-color="white" stop-opacity="0.28" />
    <stop offset="1" stop-color="white" stop-opacity="0" />
  </radialGradient>
  <radialGradient
    id="{id}-corners"
    class="text-scene-line"
    cx="0"
    cy="0"
    r="1"
    gradientUnits="userSpaceOnUse"
    gradientTransform="translate(480 150) scale(640 330)"
  >
    <stop offset="0.6" stop-color="currentColor" stop-opacity="0" />
    <stop offset="1" stop-color="currentColor" stop-opacity="0.16" />
  </radialGradient>
</defs>

<rect x="-10" y="-10" width="980" height="320" fill="url(#{id}-light)" stroke="none" />
<rect x="-10" y="-10" width="980" height="320" fill="url(#{id}-corners)" stroke="none" />

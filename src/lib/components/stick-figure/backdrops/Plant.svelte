<script lang="ts">
  /** A potted plant whose pot stands on the floor at x, y. */
  let { x, y }: { x: number; y: number } = $props();
</script>

<g transform="translate({x} {y})">
  <ellipse cx="0" cy="0" rx="19" ry="3.5" class="fill-scene-line/15" />
  <ellipse
    cx="-13"
    cy="-64"
    rx="8"
    ry="26"
    transform="rotate(-28 -13 -64)"
    class="fill-scene-leaf"
  />
  <ellipse
    cx="13"
    cy="-66"
    rx="8"
    ry="26"
    transform="rotate(26 13 -66)"
    class="fill-scene-leaf"
  />
  <ellipse
    cx="-2"
    cy="-76"
    rx="8"
    ry="31"
    transform="rotate(-5 -2 -76)"
    class="fill-scene-sage"
  />
  <path d="M-14 -34H14L10 0H-10Z" class="fill-scene-clay" />
  <path d="M-16 -36H16V-29H-16Z" class="fill-scene-clay" />
  <path d="M-14 -29H14L13.6 -26H-13.6Z" class="fill-scene-line/15" />
</g>

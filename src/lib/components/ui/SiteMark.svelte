<script lang="ts">
  let {
    class: className = "",
    decorative = false,
  }: {
    class?: string;
    decorative?: boolean;
  } = $props();
</script>

<svg
  class={className}
  viewBox="3 3 58 58"
  aria-hidden={decorative ? "true" : undefined}
  role={decorative ? undefined : "img"}
  aria-label={decorative ? undefined : "Slovak Wiki"}
>
  {#if !decorative}
    <title>Slovak Wiki</title>
  {/if}

  <rect x="3" y="3" width="58" height="58" rx="13" fill="#0f4a66" />

  <path
    fill="#f4f8fa"
    fill-rule="evenodd"
    d="
      M22.5 22.2
      L32 13.2
      L41.5 22.2
      L37.1 22.2
      L32 17.4
      L26.9 22.2
      Z

      M32 27.5
      C24.6 27.5 19.2 32.6 19.2 39.6
      C19.2 46.6 24.6 51.8 32 51.8
      C39.4 51.8 44.8 46.6 44.8 39.6
      C44.8 32.6 39.4 27.5 32 27.5
      Z

      M32 33.4
      C36.1 33.4 38.9 36 38.9 39.6
      C38.9 43.2 36.1 45.9 32 45.9
      C27.9 45.9 25.1 43.2 25.1 39.6
      C25.1 36 27.9 33.4 32 33.4
      Z
    "
  />
</svg>

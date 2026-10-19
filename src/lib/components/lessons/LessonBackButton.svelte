<script lang="ts">
  import { iconButtonClass, iconButtonToneClass } from "$lib/components/ui/system-ui";

  let { onclick }: { onclick: () => void } = $props();
</script>

<button
  class="{iconButtonClass} {iconButtonToneClass} size-11"
  type="button"
  aria-label="Previous step"
  {onclick}
>
  <svg
    class="size-5 fill-none stroke-current"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
</button>

<script lang="ts">
  let { class: className = "" }: { class?: string } = $props();
</script>

<svg
  class="inline-block size-3.5 shrink-0 translate-y-px stroke-current transition-transform group-hover:translate-x-0.5 {className}"
  viewBox="0 0 16 16"
  fill="none"
  aria-hidden="true"
>
  <path
    d="M2.75 8h10.5M9.25 3.75 13.5 8 9.25 12.25"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>

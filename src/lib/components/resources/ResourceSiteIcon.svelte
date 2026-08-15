<script lang="ts">
  import { resourceIconUrl } from "$lib/catalog/resources/catalog";

  let {
    resourceId,
    size = "sm",
    class: className = "",
  }: {
    resourceId: string;
    size?: "sm" | "md" | "lg";
    class?: string;
  } = $props();

  const boxClass = $derived(
    size === "lg"
      ? "size-11 rounded-lg"
      : size === "md"
        ? "size-8 rounded-md"
        : "size-5 rounded-sm",
  );
  const dimension = $derived(size === "lg" ? 44 : size === "md" ? 32 : 20);

  function hideBrokenIcon(event: Event) {
    const img = event.currentTarget;
    if (img instanceof HTMLImageElement) {
      img.closest("[data-resource-icon]")?.remove();
    }
  }
</script>

<span
  data-resource-icon
  class="inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-inset ring-slate-200 {boxClass} {className}"
>
  <img
    class="size-full object-contain"
    src={resourceIconUrl(resourceId)}
    alt=""
    width={dimension}
    height={dimension}
    loading="lazy"
    decoding="async"
    onerror={hideBrokenIcon}
  />
</span>

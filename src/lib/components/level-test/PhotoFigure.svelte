<script lang="ts">
  import type { PhotoPrompt } from "$lib/level-test/types";

  let { photo }: { photo: PhotoPrompt } = $props();
</script>

<figure class="m-0 grid gap-1.5">
  <img
    class="aspect-[4/3] w-full rounded-(--control-radius) bg-subtle object-cover"
    src={photo.src}
    alt=""
    loading="eager"
    decoding="async"
  />

  <figcaption class="text-[0.7rem] text-slate-500">
    Photo:
    {#if photo.creditUrl}
      <a
        class="text-slate-500 underline underline-offset-2"
        href={photo.creditUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {photo.credit}
      </a>
    {:else}
      {photo.credit}
    {/if}
  </figcaption>
</figure>

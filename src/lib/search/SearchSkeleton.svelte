<script lang="ts">
  import { panelClass } from "$lib/components/ui/system-ui";
  import { cx } from "$lib/ui/classes";

  let {
    class: className = "",
    variant,
  }: {
    class?: string;
    /** `results` mirrors chips, best-match card and word rows; `idle` mirrors the Try list. */
    variant: "results" | "idle";
  } = $props();

  const bar = "block rounded-[3px] bg-subtle";
  const label = cx(bar, "h-2.5 w-24");
  const row = "flex items-baseline justify-between gap-3 py-3";
</script>

<div class={className} aria-hidden="true">
  {#if variant === "results"}
    <div class="mt-5 flex flex-col gap-8">
      <div class="flex flex-wrap gap-2">
        <span class={cx(bar, "h-8 w-16 rounded-full")}></span>
        <span class={cx(bar, "h-8 w-20 rounded-full")}></span>
        <span class={cx(bar, "h-8 w-36 rounded-full")}></span>
        <span class={cx(bar, "h-8 w-28 rounded-full")}></span>
      </div>

      <div>
        <span class={cx(label, "mb-3")}></span>

        <div class="{panelClass} p-5 max-[600px]:p-4">
          <div class="flex items-center gap-3">
            <span class={cx(bar, "h-8 w-32")}></span>
            <span class={cx(bar, "h-5 w-16 rounded-full")}></span>
          </div>

          <span class={cx(bar, "mt-3 h-3.5 w-3/5")}></span>

          <div
            class="mt-4 divide-y divide-slate-200 rounded-(--control-radius) ring-1 ring-slate-200 ring-inset"
          >
            {#each { length: 4 } as _, index (index)}
              <div class="flex gap-6 px-3 py-3">
                <span class={cx(bar, "h-3 w-20")}></span>
                <span class={cx(bar, "h-3 flex-1")}></span>
              </div>
            {/each}
          </div>

          <div class="mt-4 flex gap-4 border-t border-slate-200 pt-3">
            <span class={cx(bar, "h-3 w-20")}></span>
            <span class={cx(bar, "h-3 w-24")}></span>
            <span class={cx(bar, "h-3 w-16")}></span>
          </div>
        </div>
      </div>

      <div>
        <span class={label}></span>

        <div class="mt-1 divide-y divide-slate-200">
          {#each { length: 2 } as _, index (index)}
            <div class={row}>
              <span class={cx(bar, "h-4 w-1/2")}></span>
              <span class={cx(bar, "h-3 w-14")}></span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="mt-8">
      <span class={label}></span>

      <div class="mt-1 divide-y divide-slate-200">
        {#each { length: 5 } as _, index (index)}
          <div class={row}>
            <span class={cx(bar, "h-4", index % 2 === 0 ? "w-1/4" : "w-2/5")}></span>
            <span class={cx(bar, "h-3 w-16")}></span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

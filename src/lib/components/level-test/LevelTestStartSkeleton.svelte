<script lang="ts">
  import { panelClass } from "$lib/components/ui/system-ui";
</script>

<!-- Stand-in for LevelTestStart while the island loads: eyebrow, two mode rows, toggle, button. -->
<div class="{panelClass} grid gap-5 px-5 py-5" aria-hidden="true">
  <div class="grid gap-2">
    <div class="h-2.5 w-24 rounded-full bg-subtle"></div>
    <div class="h-3.5 w-56 rounded-full bg-subtle"></div>
  </div>

  <div class="grid gap-2">
    <div
      class="h-[4.25rem] rounded-(--control-radius) border border-slate-200 bg-subtle/60"
    ></div>
    <div
      class="h-[4.25rem] rounded-(--control-radius) border border-slate-200 bg-subtle/60"
    ></div>
  </div>

  <div class="h-4 w-44 rounded-full bg-subtle"></div>
  <div class="h-11 rounded-(--control-radius) bg-subtle"></div>
</div>

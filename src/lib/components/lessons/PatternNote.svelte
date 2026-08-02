<script lang="ts">
  import type { LessonPattern } from "$lib/content/learning-types";

  let { pattern }: { pattern: LessonPattern } = $props();
</script>

<aside class="border-l-4 border-blue-600 bg-blue-50 px-5 py-[18px]">
  <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-800">
    One pattern
  </p>
  <h2 class="m-0 font-serif text-xl font-semibold text-slate-900">{pattern.title}</h2>
  <span class="mt-2 block max-w-[65ch] font-serif leading-6 text-slate-700"
    >{pattern.body}</span
  >
</aside>

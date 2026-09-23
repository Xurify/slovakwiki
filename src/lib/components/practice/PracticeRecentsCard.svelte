<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
</script>

<section
  class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
  aria-labelledby="recents-heading"
  data-practice-recents
  data-practice-hydrate
  hidden
>
  <div class="border-b border-slate-200/70 px-5 pt-4 pb-3">
    <h2
      id="recents-heading"
      class="m-0 font-serif text-lg leading-snug tracking-tight text-slate-900"
    >
      Practice again
    </h2>

    <p class="m-0 mt-0.5 text-xs leading-relaxed text-pretty text-slate-500">
      Lines you drilled recently. Each one reopens inside its set.
    </p>
  </div>

  <ul
    class="m-0 list-none divide-y divide-slate-200/70 p-0"
    data-practice-recents-list
  ></ul>

  <template data-practice-recent-template>
    <li>
      <a
        class="group flex items-center justify-between gap-3 px-5 py-3 no-underline transition-colors duration-150 hover:bg-slate-50"
        data-recent-href
        href="/practice"
      >
        <span class="min-w-0">
          <span
            class="block font-serif text-[0.98rem] leading-snug font-semibold tracking-tight text-balance text-slate-900 group-hover:text-blue-800"
            lang="sk"
            data-recent-sk
          ></span>

          <span
            class="mt-0.5 block text-xs leading-snug text-pretty text-slate-600"
            data-recent-en
          ></span>
        </span>

        <span class="shrink-0 text-blue-800">
          <ArrowRight />
        </span>
      </a>
    </li>
  </template>
</section>

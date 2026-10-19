<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
</script>

<section
  class="overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
  aria-labelledby="review-heading"
  data-practice-review
  data-practice-hydrate
  hidden
>
  <div class="px-5 pt-4 pb-5">
    <h2
      id="review-heading"
      class="m-0 font-serif text-lg leading-snug tracking-tight text-slate-900"
    >
      Review today
    </h2>

    <p
      class="m-0 mt-0.5 text-xs leading-relaxed text-pretty text-slate-500"
      data-practice-review-summary
    ></p>

    <Button href="/practice/review" variant="accent" class="mt-4 w-full px-4">
      Start review
      <ArrowRight />
    </Button>
  </div>
</section>

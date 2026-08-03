<script lang="ts">
  /**
   * Dot-matrix rail scan — traveling column highlight.
   * Inspired by Dot Matrix Rail Scan / Row Sweep
   * (https://dotmatrix.zzzzshawn.cloud).
   */
  let {
    label = "Loading…",
    size = "sm",
    class: className = "",
  }: {
    label?: string;
    size?: "sm" | "md";
    class?: string;
  } = $props();

  const cols = 5;
  const rows = 3;

  const cells = Array.from({ length: cols * rows }, (_, index) => ({
    id: index,
    col: index % cols,
  }));
</script>

<div
  class="flex items-center gap-2.5 leading-none text-slate-500 {className}"
  role="status"
  aria-live="polite"
  aria-label={label}
>
  <div
    class="dot-loader grid shrink-0 text-current"
    class:dot-loader--sm={size === "sm"}
    class:dot-loader--md={size === "md"}
    aria-hidden="true"
  >
    {#each cells as cell (cell.id)}
      <span class="dot-loader__cell" style:--col={cell.col}></span>
    {/each}
  </div>

  {#if label}
    <span
      class="leading-none text-slate-500"
      class:text-sm={size === "sm"}
      class:text-base={size === "md"}
    >
      {label}
    </span>
  {/if}
</div>

<style>
  .dot-loader {
    grid-template-columns: repeat(5, var(--dot));
    grid-template-rows: repeat(3, var(--dot));
    gap: var(--gap);
  }

  .dot-loader--sm {
    --dot: 0.22rem;
    --gap: 0.14rem;
  }

  .dot-loader--md {
    --dot: 0.3rem;
    --gap: 0.18rem;
  }

  .dot-loader__cell {
    display: block;
    width: var(--dot);
    height: var(--dot);
    border-radius: 1px;
    background: currentColor;
    opacity: 0.14;
    animation: dot-loader-scan 1s ease-in-out infinite;
    animation-delay: calc(var(--col) * 120ms);
  }

  @keyframes dot-loader-scan {
    0%,
    100% {
      opacity: 0.14;
      transform: scale(0.85);
    }

    40% {
      opacity: 1;
      transform: scale(1);
    }

    70% {
      opacity: 0.28;
      transform: scale(0.9);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dot-loader__cell {
      animation: none;
      opacity: 0.28;
      transform: none;
    }

    .dot-loader__cell:nth-child(3n + 2) {
      opacity: 0.85;
    }
  }
</style>

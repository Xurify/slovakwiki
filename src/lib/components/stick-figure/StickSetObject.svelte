<script lang="ts">
  import type { ObjectKind } from "$lib/stick-figure/acts";

  /**
   * One object of a set, drawn up from its base at 0,0 in rig units, in the
   * props' ink-outlined style: the same drawing on the stove and in a hand.
   */
  let {
    full = false,
    heat = 0,
    kind,
    open,
  }: {
    /** A spoonful in the spoon. */
    full?: boolean;
    /** Steam off it: 0 none, 1 just off the boil. */
    heat?: number;
    kind: ObjectKind;
    /** A pot with its lid off, the soup showing and the steam pouring out. */
    open?: boolean;
  } = $props();

  const wisps = $derived(heat > 0 ? (open ? [-6, 0, 6] : [-9, 9]) : []);
</script>

<g class="stroke-portrait-ink" stroke-width="0.8">
  {#if kind === "pot"}
    <path d="M-15.5 -11.5h3.5M12 -11.5h3.5" stroke-width="2.2" />
    <path d="M-12 -15h24v11a4 4 0 0 1-4 4h-16a4 4 0 0 1-4-4Z" class="fill-scene-line" />
    <path d="M-12 -12h24" class="stroke-white/25" stroke-width="1" />
    {#if open}
      <ellipse cx="0" cy="-14.6" rx="11" ry="1.6" class="fill-scene-carrot" />
    {/if}
    {#each wisps as x, index (x)}
      <!-- Each wisp rises and fades on its own beat; held still, it simply hangs there. -->
      <path
        d="M{x} -18q2-3 0-6q-2-3 0-6"
        class="animate-steam stroke-white/90 [transform-box:fill-box] origin-bottom"
        stroke-width={open ? 1.6 : 1.1}
        style:animation-delay="{index * 0.7}s"
        style:animation-duration="{open ? 1.8 : 2.6}s"
      />
    {/each}
  {:else if kind === "lid"}
    <path d="M-13 0Q-12 -5 0 -5Q12 -5 13 0Z" class="fill-scene-line" />
    <circle cx="0" cy="-5.6" r="1.6" class="fill-portrait-vest" />
  {:else if kind === "crock"}
    <path
      d="M-4.5 -11h9l-0.6 10a1 1 0 0 1-1 1h-5.8a1 1 0 0 1-1-1Z"
      class="fill-scene-clay"
    />
    <path d="M-4.2 -8.5h8.4" class="stroke-white/40" stroke-width="0.8" />
  {:else if kind === "spoon"}
    <path d="M0 0V-10.5" stroke-width="2.6" />
    <path d="M0 0V-10.5" class="stroke-scene-wood" stroke-width="1.3" />
    <ellipse cx="0" cy="-13" rx="2.3" ry="3" class="fill-scene-wood" />
    {#if full}
      <ellipse
        cx="0"
        cy="-13.2"
        rx="1.4"
        ry="1.9"
        class="fill-scene-carrot"
        stroke="none"
      />
    {/if}
    {#if full && heat > 0}
      <path
        d="M0 -17q1.4-2 0-4q-1.4-2 0-4"
        class="animate-steam stroke-white/90 [transform-box:fill-box] origin-bottom"
        stroke-width="0.9"
        style:animation-duration="1.6s"
      />
    {/if}
  {/if}
</g>

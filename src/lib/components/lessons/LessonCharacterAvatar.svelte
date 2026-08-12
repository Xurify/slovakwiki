<script lang="ts">
  import { storyCastForSpeaker } from "$lib/lessons/story-cast";

  let {
    class: className = "",
    size = "md",
    speaker,
  }: {
    class?: string;
    size?: "sm" | "md" | "lg";
    speaker: string;
  } = $props();

  const cast = $derived(storyCastForSpeaker(speaker));
  const dim = $derived(size === "lg" ? "size-14" : size === "sm" ? "size-9" : "size-11");
</script>

<span
  class="inline-grid shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-slate-200/80 ring-inset {dim} {className}"
  aria-hidden="true"
>
  <svg class="size-full" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="24" class={cast.fillClass} />

    {#if cast.id === "maria"}
      <!-- Older admin: glasses + soft bun -->
      <ellipse cx="24" cy="18" rx="11" ry="10" class={cast.inkClass} opacity="0.18" />
      <circle cx="24" cy="20" r="8.5" class="fill-rose-100" />
      <path d="M12 22c2-7 7-11 12-11s10 4 12 11" class={cast.inkClass} opacity="0.55" />
      <path
        d="M14 16c3-5 7-7 10-7 2 0 4 .6 5.5 1.8-1.2 2-3.5 3.4-5.5 3.4-3 0-6.5-1.5-10 1.8Z"
        class={cast.inkClass}
      />
      <circle cx="20.2" cy="20.5" r="1.15" class={cast.inkClass} />
      <circle cx="27.8" cy="20.5" r="1.15" class={cast.inkClass} />
      <path
        d="M21 24.2c1.2 1.2 4.8 1.2 6 0"
        class="stroke-slate-600"
        stroke-width="1.2"
        stroke-linecap="round"
      />
      <rect
        x="15.5"
        y="18.2"
        width="17"
        height="6.2"
        rx="3.1"
        class="stroke-slate-700"
        stroke-width="1.35"
        fill="none"
      />
      <path d="M8 42c3-8 9-12 16-12s13 4 16 12" class={cast.accentClass} />
      <path d="M16 34h16v2.5H16Z" class="fill-white" opacity="0.55" />
    {:else if cast.id === "anna" || cast.id === "lucia"}
      <!-- Friendly peer -->
      <circle cx="24" cy="20" r="8.5" class="fill-blue-100" />
      <path
        d="M11 20c2.5-8 8-12 13-12s10.5 4 13 12c-2-1-5-1.5-8-1.2-2 .2-4.5 1-6.5 1-3 0-7-1-11.5.2Z"
        class={cast.inkClass}
      />
      <circle cx="20.5" cy="20.2" r="1.2" class={cast.inkClass} />
      <circle cx="27.5" cy="20.2" r="1.2" class={cast.inkClass} />
      <path
        d="M21.2 24c1.1 1.4 4.5 1.4 5.6 0"
        class="stroke-slate-700"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <path d="M8 42c3.5-9 9.5-13 16-13s12.5 4 16 13" class={cast.accentClass} />
      <circle cx="24" cy="33.5" r="1.6" class="fill-white" opacity="0.7" />
    {:else if cast.id === "alex" || cast.id === "marek"}
      <!-- Learner -->
      <circle cx="24" cy="20" r="8.5" class="fill-emerald-100" />
      <path
        d="M13 18c1.5-7 6.5-10 11-10s9.5 3 11 10c-3-2-7-2.5-11-2.5S16 16 13 18Z"
        class={cast.inkClass}
      />
      <circle cx="20.4" cy="20.4" r="1.2" class={cast.inkClass} />
      <circle cx="27.6" cy="20.4" r="1.2" class={cast.inkClass} />
      <path
        d="M21 24.5c1.2 1.1 4.8 1.1 6 0"
        class="stroke-slate-700"
        stroke-width="1.25"
        stroke-linecap="round"
      />
      <path d="M8 42c3-8.5 9-12.5 16-12.5S37 33.5 40 42" class={cast.accentClass} />
    {:else if cast.id === "waiter"}
      <circle cx="24" cy="20" r="8.5" class="fill-emerald-100" />
      <path
        d="M13 17.5c2-7 7-10.5 11-10.5s9 3.5 11 10.5"
        class={cast.inkClass}
        opacity="0.85"
      />
      <circle cx="20.5" cy="20.2" r="1.15" class={cast.inkClass} />
      <circle cx="27.5" cy="20.2" r="1.15" class={cast.inkClass} />
      <path
        d="M21.2 24.2c1.1 1.2 4.5 1.2 5.6 0"
        class="stroke-slate-700"
        stroke-width="1.2"
        stroke-linecap="round"
      />
      <path d="M8 42c3-8 9-12 16-12s13 4 16 12" class="fill-slate-800" />
      <path d="M18 31h12v3H18Z" class="fill-white" />
      <circle cx="24" cy="32.5" r="1.2" class={cast.accentClass} />
    {:else if cast.id === "receptionist"}
      <circle cx="24" cy="20" r="8.5" class="fill-blue-100" />
      <path d="M12 19c2.5-7.5 8-11 12-11s9.5 3.5 12 11" class={cast.inkClass} />
      <circle cx="20.3" cy="20.3" r="1.15" class={cast.inkClass} />
      <circle cx="27.7" cy="20.3" r="1.15" class={cast.inkClass} />
      <path
        d="M21 24.3c1.2 1.15 4.8 1.15 6 0"
        class="stroke-slate-700"
        stroke-width="1.2"
        stroke-linecap="round"
      />
      <path d="M8 42c3-8.5 9-12.5 16-12.5s13 4 16 12.5" class={cast.accentClass} />
      <rect
        x="17"
        y="31"
        width="14"
        height="2.2"
        rx="1"
        class="fill-white"
        opacity="0.75"
      />
    {:else}
      <!-- Narrator / guide mark -->
      <circle cx="24" cy="24" r="10" class={cast.inkClass} opacity="0.12" />
      <path
        d="M16 20h16v10.5c0 1.2-.7 2.2-1.8 2.6L24 36l-6.2-2.9c-1.1-.4-1.8-1.4-1.8-2.6V20Z"
        class={cast.inkClass}
        opacity="0.85"
      />
      <path
        d="M19 17.5c0-2.8 2.2-5 5-5s5 2.2 5 5"
        class="stroke-slate-600"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
      />
    {/if}
  </svg>
</span>

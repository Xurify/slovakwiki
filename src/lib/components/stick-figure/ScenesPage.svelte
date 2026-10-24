<script lang="ts">
  import { onMount, tick } from "svelte";

  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { focusUnlessTyping } from "$lib/listening/focus";
  import type { SceneGroup } from "$lib/stick-figure/scene-line";
  import { cx } from "$lib/ui/classes";
  import ScenePlayer from "./ScenePlayer.svelte";

  /** /dev/scenes: the player first, every scene listed under it by where it comes from. */
  let {
    groups,
    thingWords = {},
  }: {
    groups: SceneGroup[];
    /** Dictionary link and clip for a scene thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  /** The scene a link opens: `?scene=podcast-demonstratives-market`. */
  const SCENE_PARAM = "scene";

  let sceneId = $state("");
  let section = $state<HTMLElement>();
  let player = $state<ReturnType<typeof ScenePlayer>>();

  const scenes = $derived(groups.flatMap((group) => group.scenes));
  const scene = $derived(scenes.find((option) => option.id === sceneId) ?? scenes[0]);
  /** The scene after this one in its group: the podcast's next segment. */
  const nextScene = $derived.by(() => {
    const group = groups.find((option) => option.scenes.includes(scene));
    const index = group?.scenes.indexOf(scene) ?? -1;
    return index === -1 ? undefined : group?.scenes[index + 1];
  });

  onMount(() => {
    const linked = new URLSearchParams(window.location.search).get(SCENE_PARAM);
    if (linked && scenes.some((option) => option.id === linked)) sceneId = linked;
  });

  function select(id: string): void {
    if (id === scene.id) {
      player?.restart();
      return;
    }

    sceneId = id;
    const url = new URL(window.location.href);
    url.searchParams.set(SCENE_PARAM, id);
    window.history.replaceState(window.history.state, "", url);
  }

  function open(id: string): void {
    select(id);
    void scrollToPlayer();
  }

  /** On to the next scene in its group, playing once the stage has its cast. */
  async function goNext(): Promise<void> {
    if (!nextScene) return;
    select(nextScene.id);
    void scrollToPlayer();
    await tick();
    player?.start();
  }

  /** Back up to the player from the list under it, unless its top is in view already. */
  async function scrollToPlayer(): Promise<void> {
    await tick();
    if (!section) return;

    focusUnlessTyping(section);
    const top = Number.parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
    if (section.getBoundingClientRect().top >= top) return;
    section.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
</script>

<main class="py-12 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1040px]">
    <header class="max-w-[680px]">
      <h1 class="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Scenes
      </h1>
      <Lead class="mt-3">
        Prototype. Watch a dialogue with each word lit as it is said, take Alex's part, or
        find things in the scene by their Slovak names.
      </Lead>
    </header>

    <section
      bind:this={section}
      class="mt-8 scroll-mt-24 focus-visible:outline-none max-[800px]:scroll-mt-[136px]"
      aria-labelledby="scene-title"
      tabindex="-1"
    >
      <ScenePlayer
        bind:this={player}
        next={nextScene}
        onnext={goNext}
        {scene}
        {thingWords}
      />
    </section>

    <nav class="mt-12 grid gap-6" aria-label="All scenes">
      {#each groups as group (`${group.label}-${group.slovak}`)}
        <div>
          <h2 class="m-0 text-sm font-semibold text-slate-700">
            {group.label}
            {#if group.slovak}
              <span class="ml-1 font-serif text-slate-900" lang="sk">{group.slovak}</span>
            {/if}
          </h2>

          <ul
            class="{dataPanelClass} m-0 mt-2.5 grid list-none gap-1 p-1.5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {#each group.scenes as option (option.id)}
              {@const current = option.id === scene.id}
              <li class="min-w-0">
                <button
                  class={cx(
                    "block h-full w-full cursor-pointer rounded-(--control-radius) border-0 px-3 py-2.5 text-left",
                    "transition-colors duration-150 ease-out hover:bg-blue-50/50",
                    current ? "bg-blue-50/70" : "bg-transparent",
                  )}
                  type="button"
                  aria-current={current ? "true" : undefined}
                  onclick={() => open(option.id)}
                >
                  <span
                    class={cx(
                      "block font-serif text-base leading-snug",
                      current ? "font-semibold text-slate-900" : "text-slate-800",
                    )}
                    lang="sk"
                  >
                    {option.name}
                  </span>
                  {#if option.english}
                    <span class="block text-sm leading-snug text-slate-500">
                      {option.english}
                    </span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </nav>
  </PageShell>
</main>

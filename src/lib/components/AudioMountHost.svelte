<script lang="ts">
  import { mount, onDestroy, onMount, unmount } from "svelte";

  import AudioButton from "$lib/components/AudioButton.svelte";
  import type { AudioMountTarget } from "$lib/components/audio-mount";

  let { targets }: { targets: AudioMountTarget[] } = $props();

  const instances: Array<ReturnType<typeof mount>> = [];

  onMount(() => {
    for (const target of targets) {
      const element = document.querySelector(
        `[data-audio-mount="${CSS.escape(target.key)}"]`,
      );
      if (!(element instanceof HTMLElement)) continue;

      element.replaceChildren();
      instances.push(mount(AudioButton, { target: element, props: target.props }));
    }
  });

  onDestroy(() => {
    for (const instance of instances) {
      unmount(instance);
    }
  });
</script>

<!-- Host only; buttons mount into `[data-audio-mount]` placeholders. -->
<span class="sr-only" aria-hidden="true"></span>

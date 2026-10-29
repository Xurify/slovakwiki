<script lang="ts">
  import { onMount } from "svelte";
  import SceneSettings, {
    type SceneSetting,
  } from "$lib/components/stick-figure/SceneSettings.svelte";
  import {
    THEME_CHANGE_EVENT,
    applyTheme,
    getInitialThemePreference,
    resolveTheme,
  } from "$lib/chrome/theme";
  import {
    AUDIO_VOLUME_CHANGE_EVENT,
    getAudioVolume,
    setAudioVolume,
  } from "$lib/audio/volume";
  import {
    STORY_PREFS_CHANGE_EVENT,
    getStoryAutoAdvance,
    getStoryShowEnglish,
    setStoryAutoAdvance,
    setStoryShowEnglish,
    toggleStoryBool,
    type StoryBoolPreference,
  } from "$lib/lesson-story/prefs";

  let { class: className = "" }: { class?: string } = $props();

  let autoAdvance = $state<StoryBoolPreference>(getStoryAutoAdvance());
  let showEnglish = $state<StoryBoolPreference>(getStoryShowEnglish());
  let volume = $state(getAudioVolume());
  let darkOn = $state(false);

  const settings = $derived<SceneSetting[]>([
    {
      group: "Sound",
      kind: "volume",
      label: "Volume",
      oninput: (value) => (volume = setAudioVolume(value)),
      value: volume,
    },
    {
      description: "Play the next line when audio ends. Needs sound on.",
      group: "Story",
      icon: "next",
      label: "Auto-advance",
      on: autoAdvance === "on",
      ontoggle: () => {
        autoAdvance = toggleStoryBool(autoAdvance);
        setStoryAutoAdvance(autoAdvance);
      },
    },
    {
      group: "Story",
      icon: "globe",
      label: "Show English",
      on: showEnglish === "on",
      ontoggle: () => {
        showEnglish = toggleStoryBool(showEnglish);
        setStoryShowEnglish(showEnglish);
      },
    },
    {
      group: "Display",
      icon: "moon",
      label: "Dark mode",
      on: darkOn,
      ontoggle: () => {
        darkOn = applyTheme(darkOn ? "light" : "dark") === "dark";
      },
    },
  ]);

  onMount(() => {
    function onPrefsChange(): void {
      autoAdvance = getStoryAutoAdvance();
      showEnglish = getStoryShowEnglish();
    }

    function onVolumeChange(): void {
      volume = getAudioVolume();
    }

    function onThemeChange(): void {
      darkOn = resolveTheme(getInitialThemePreference()) === "dark";
    }

    onPrefsChange();
    onVolumeChange();
    onThemeChange();

    window.addEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
    window.addEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);
    window.addEventListener(THEME_CHANGE_EVENT, onThemeChange);
    return () => {
      window.removeEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
      window.removeEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);
      window.removeEventListener(THEME_CHANGE_EVENT, onThemeChange);
    };
  });
</script>

<SceneSettings
  class={className}
  label="Lesson settings"
  {settings}
/>

<script lang="ts">
  import { mount, onDestroy, onMount, unmount } from "svelte";

  import { readPracticeState } from "$lib/components/practice/practice-state";
  import PracticeFeatured from "$lib/components/practice/PracticeFeatured.svelte";
  import PracticeRecents from "$lib/components/practice/PracticeRecents.svelte";
  import PracticeStartCta from "$lib/components/practice/PracticeStartCta.svelte";

  const instances: Array<ReturnType<typeof mount>> = [];

  onMount(() => {
    const initialState = readPracticeState(localStorage);
    const completed = new Set(initialState.completedLessonIds);

    for (const el of document.querySelectorAll<HTMLElement>("[data-sheet-done]")) {
      const lessonId = el.dataset.sheetDone;
      if (lessonId && completed.has(lessonId)) {
        el.textContent = " · Done";
      }
    }

    const ctaHost = document.querySelector<HTMLElement>("[data-practice-cta]");
    if (ctaHost) {
      ctaHost.replaceChildren();
      instances.push(
        mount(PracticeStartCta, { target: ctaHost, props: { initialState } }),
      );
    }

    const featuredHost = document.querySelector<HTMLElement>("[data-practice-featured]");
    if (featuredHost) {
      featuredHost.replaceChildren();
      instances.push(
        mount(PracticeFeatured, { target: featuredHost, props: { initialState } }),
      );
    }

    const recentsHost = document.querySelector<HTMLElement>("[data-practice-recents]");
    if (recentsHost) {
      recentsHost.replaceChildren();
      instances.push(
        mount(PracticeRecents, { target: recentsHost, props: { initialState } }),
      );
    }
  });

  onDestroy(() => {
    for (const instance of instances) {
      unmount(instance);
    }
  });
</script>

<span class="sr-only" aria-hidden="true"></span>

<script lang="ts">
  /**
   * A damaged word: the given start, then one box per missing letter, as on
   * the DET. Every box is its own input, so a learner can click any letter
   * and fix it; typing moves on, Backspace on an empty box moves back.
   */
  let {
    prefix,
    length,
    value = $bindable(""),
    label,
    disabled = false,
    onfilled,
    onbackout,
    input = $bindable(),
    lastInput = $bindable(),
  }: {
    prefix: string;
    length: number;
    value?: string;
    label: string;
    disabled?: boolean;
    /** Typed into the last box: move on to the next gap. */
    onfilled?: () => void;
    /** Backspace or Left in the first box: move back to the previous gap. */
    onbackout?: () => void;
    input?: HTMLInputElement;
    lastInput?: HTMLInputElement;
  } = $props();

  let letters = $state<string[]>(
    Array.from({ length }, (_, index) => [...value][index] ?? ""),
  );
  let boxes = $state<HTMLInputElement[]>([]);

  $effect(() => {
    input = boxes[0];
    lastInput = boxes[length - 1];
  });

  function commit(): void {
    value = letters.join("");
  }

  /**
   * Synchronous on purpose: accent tools such as PowerToys Quick Accent send
   * "a", Backspace, "á" in one burst, and the "á" must land in the box the
   * Backspace moved back to.
   */
  function focusBox(index: number): void {
    const box = boxes[index];
    box?.focus();
    box?.select();
  }

  /** Writes letters from `index` on and moves past them. */
  function place(chars: string[], index: number): void {
    let at = index;
    for (const char of chars) {
      if (at >= length) break;
      letters[at] = char;
      at += 1;
    }
    commit();

    if (at >= length) onfilled?.();
    else focusBox(at);
  }

  /**
   * A typed letter always replaces the box's letter, even when a click left
   * the caret after it instead of selecting it.
   */
  function handleBeforeInput(event: InputEvent, index: number): void {
    if (event.inputType !== "insertText" || !event.data) return;
    const chars = [...event.data.replace(/\s+/gu, "")];
    event.preventDefault();
    if (chars.length > 0) place(chars, index);
  }

  /** Fallback for paste, IME and on-screen keyboards that skip beforeinput. */
  function handleInput(event: Event, index: number): void {
    const field = event.currentTarget as HTMLInputElement;
    if ((event as InputEvent).isComposing) return;
    const typed = [...field.value.replace(/\s+/gu, "")];
    field.value = letters[index] ?? "";

    if (typed.length === 0) {
      letters[index] = "";
      commit();
      return;
    }

    const old = letters[index];
    // The old letter stays next to the new one when nothing was selected.
    const fresh = typed.length > 1 && old && typed[0] === old ? typed.slice(1) : typed;
    place(fresh, index);
    field.value = letters[index] ?? "";
  }

  function handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === "Backspace" && !letters[index]) {
      event.preventDefault();
      if (index === 0) {
        onbackout?.();
        return;
      }
      letters[index - 1] = "";
      commit();
      focusBox(index - 1);
    } else if (
      event.key === "ArrowLeft" &&
      (event.currentTarget as HTMLInputElement).selectionStart === 0
    ) {
      event.preventDefault();
      if (index === 0) onbackout?.();
      else focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (index === length - 1) onfilled?.();
      else focusBox(index + 1);
    }
  }
</script>

<span class="inline-flex items-baseline whitespace-nowrap">
  <span>{prefix}</span>

  <span
    class="ml-px inline-flex gap-[3px] align-baseline"
    role="group"
    aria-label={label}
  >
    {#each letters as letter, index (index)}
      <input
        class="h-[1.45em] w-[1.05em] rounded-t-[3px] border-0 border-b-2 border-blue-600/70 bg-blue-50 p-0 text-center font-serif text-[1em] leading-none text-slate-900 caret-transparent outline-none transition-[background-color,border-color] duration-150 ease-out focus:border-blue-700 focus:bg-blue-100"
        bind:this={boxes[index]}
        value={letter}
        maxlength={2}
        aria-label={`Letter ${index + 1} of ${length}`}
        autocomplete="off"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        lang="sk"
        {disabled}
        onfocus={(event) => (event.currentTarget as HTMLInputElement).select()}
        onbeforeinput={(event) => handleBeforeInput(event, index)}
        oninput={(event) => handleInput(event, index)}
        oncompositionend={(event) => handleInput(event, index)}
        onkeydown={(event) => handleKeydown(event, index)}
      />
    {/each}
  </span>
</span>

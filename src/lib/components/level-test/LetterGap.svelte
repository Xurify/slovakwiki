<script lang="ts">
  /**
   * A damaged word: the given start, then one box per missing letter, as on
   * the DET. A transparent input sits over the boxes and the boxes show what
   * was typed, so every browser lines the letters up the same way.
   */
  let {
    prefix,
    length,
    value = $bindable(""),
    label,
    disabled = false,
    onfilled,
    input = $bindable(),
  }: {
    prefix: string;
    length: number;
    value?: string;
    label: string;
    disabled?: boolean;
    onfilled?: () => void;
    input?: HTMLInputElement;
  } = $props();

  let focused = $state(false);

  const letters = $derived([...value]);
  const caret = $derived(Math.min(letters.length, length - 1));

  function handleInput(event: Event): void {
    const field = event.currentTarget as HTMLInputElement;
    const cleaned = [...field.value.replace(/\s+/gu, "")].slice(0, length).join("");
    if (cleaned !== field.value) field.value = cleaned;
    value = cleaned;
    if ([...cleaned].length === length) onfilled?.();
  }
</script>

<span class="inline-flex items-baseline whitespace-nowrap">
  <span>{prefix}</span>

  <span class="relative ml-px inline-flex gap-[3px] align-baseline">
    {#each Array.from({ length }, (_, index) => index) as index (index)}
      <span
        class="inline-grid h-[1.45em] w-[0.95em] place-items-center rounded-t-[3px] border-b-2 leading-none transition-[background-color,border-color] duration-150 ease-out {focused &&
        index === caret
          ? 'border-blue-700 bg-blue-100'
          : 'border-blue-600/70 bg-blue-50'}"
        aria-hidden="true"
      >
        {letters[index] ?? ""}
      </span>
    {/each}

    <input
      class="absolute inset-0 h-full w-full cursor-text border-0 bg-transparent p-0 text-base opacity-0"
      bind:this={input}
      {value}
      maxlength={length}
      aria-label={label}
      autocomplete="off"
      autocapitalize="none"
      spellcheck="false"
      lang="sk"
      {disabled}
      oninput={handleInput}
      onfocus={() => (focused = true)}
      onblur={() => (focused = false)}
    />
  </span>
</span>

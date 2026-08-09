<script lang="ts">
  import { isBankTileUsed } from "$lib/client/build-tiles";
  import {
    canInsertBankIndex,
    computeTrayInsertIndex,
    insertBankIndexAt,
    reorderBuiltIndexes,
  } from "$lib/learning/exercises/build-dnd";

  const DRAG_THRESHOLD_PX = 8;

  type ActiveDrag =
    | { kind: "bank"; bankIndex: number; label: string; pointerId: number }
    | {
        kind: "tray";
        bankIndex: number;
        label: string;
        fromBuiltIndex: number;
        pointerId: number;
      };

  let {
    tiles,
    answerLength,
    builtBankIndexes = $bindable<number[]>([]),
    submitted,
  }: {
    tiles: string[];
    answerLength: number;
    builtBankIndexes?: number[];
    submitted: boolean;
  } = $props();

  let trayEl = $state<HTMLElement | null>(null);
  let pendingPointer = $state<{
    kind: "bank" | "tray";
    index: number;
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);
  let activeDrag = $state<ActiveDrag | null>(null);
  let insertAt = $state<number | null>(null);
  let floatX = $state(0);
  let floatY = $state(0);

  const chipClass =
    "press-key min-h-11 cursor-pointer rounded-(--control-radius) px-3.5 py-2 font-serif text-base font-semibold text-blue-800 touch-none select-none";

  const chipMetricsClass = "px-3.5 py-2 font-serif text-base font-semibold";

  const bankGhostShellClass =
    "inline-flex shrink-0 min-h-11 items-center rounded-(--control-radius) border border-dashed border-slate-200 bg-slate-50/70 pointer-events-none select-none";

  const bankGhostSizingClass = `${chipMetricsClass} invisible`;

  const isDragging = $derived(activeDrag !== null);
  const floatLabel = $derived(activeDrag?.label ?? "");

  function chipMidpoints(): number[] {
    if (!trayEl) return [];
    return Array.from(trayEl.querySelectorAll<HTMLElement>("[data-tray-chip]")).map(
      (chip) => {
        const rect = chip.getBoundingClientRect();
        return rect.left + rect.width / 2;
      },
    );
  }

  function updateInsertAt(clientX: number): void {
    insertAt = computeTrayInsertIndex(clientX, chipMidpoints());
  }

  function addTile(bankIndex: number): void {
    if (submitted) return;
    if (!canInsertBankIndex(builtBankIndexes, bankIndex, answerLength)) return;
    builtBankIndexes = [...builtBankIndexes, bankIndex];
  }

  function removeTile(builtIndex: number): void {
    if (submitted) return;
    builtBankIndexes = builtBankIndexes.filter((_, index) => index !== builtIndex);
  }

  function cancelDrag(): void {
    activeDrag = null;
    insertAt = null;
    pendingPointer = null;
  }

  function finishDrag(clientX: number, clientY: number): void {
    const drag = activeDrag;
    activeDrag = null;
    insertAt = null;
    pendingPointer = null;

    if (!drag || submitted) return;

    const target = document.elementFromPoint(clientX, clientY);
    const overTray = Boolean(target && trayEl?.contains(target));

    if (!overTray) {
      if (drag.kind === "tray") {
        builtBankIndexes = builtBankIndexes.filter(
          (_, index) => index !== drag.fromBuiltIndex,
        );
      }
      return;
    }

    const position = computeTrayInsertIndex(clientX, chipMidpoints());

    if (drag.kind === "bank") {
      if (!canInsertBankIndex(builtBankIndexes, drag.bankIndex, answerLength)) return;
      builtBankIndexes = insertBankIndexAt(builtBankIndexes, drag.bankIndex, position);
      return;
    }

    builtBankIndexes = reorderBuiltIndexes(
      builtBankIndexes,
      drag.fromBuiltIndex,
      position,
    );
  }

  function startDragFromPending(event: PointerEvent): void {
    if (!pendingPointer || pendingPointer.pointerId !== event.pointerId) return;

    if (pendingPointer.kind === "bank") {
      activeDrag = {
        kind: "bank",
        bankIndex: pendingPointer.index,
        label: tiles[pendingPointer.index] ?? "",
        pointerId: event.pointerId,
      };
      floatX = event.clientX;
      floatY = event.clientY;
      updateInsertAt(event.clientX);
      return;
    }

    const fromBuiltIndex = pendingPointer.index;
    const bankIndex = builtBankIndexes[fromBuiltIndex];
    if (bankIndex === undefined) return;

    activeDrag = {
      kind: "tray",
      bankIndex,
      label: tiles[bankIndex] ?? "",
      fromBuiltIndex,
      pointerId: event.pointerId,
    };
    floatX = event.clientX;
    floatY = event.clientY;
    updateInsertAt(event.clientX);
  }

  function onWindowPointerMove(event: PointerEvent): void {
    if (pendingPointer && event.pointerId === pendingPointer.pointerId && !activeDrag) {
      const dx = event.clientX - pendingPointer.startX;
      const dy = event.clientY - pendingPointer.startY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
      startDragFromPending(event);
    }

    if (!activeDrag || event.pointerId !== activeDrag.pointerId) return;

    floatX = event.clientX;
    floatY = event.clientY;
    updateInsertAt(event.clientX);
  }

  function onWindowPointerUp(event: PointerEvent): void {
    if (activeDrag && event.pointerId === activeDrag.pointerId) {
      finishDrag(event.clientX, event.clientY);
      return;
    }

    if (!pendingPointer || event.pointerId !== pendingPointer.pointerId) return;

    if (pendingPointer.kind === "bank") {
      addTile(pendingPointer.index);
    } else {
      removeTile(pendingPointer.index);
    }

    pendingPointer = null;
  }

  function onBankPointerDown(event: PointerEvent, bankIndex: number): void {
    if (submitted || isBankTileUsed(builtBankIndexes, bankIndex)) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    pendingPointer = {
      kind: "bank",
      index: bankIndex,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  function onTrayPointerDown(event: PointerEvent, builtIndex: number): void {
    if (submitted) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    pendingPointer = {
      kind: "tray",
      index: builtIndex,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };
  }

  $effect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    window.addEventListener("pointercancel", cancelDrag);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
      window.removeEventListener("pointercancel", cancelDrag);
    };
  });
</script>

<div class="mt-6 grid gap-5" aria-label="Build the sentence">
  <div
    bind:this={trayEl}
    class="relative min-h-[4.75rem] border-b-2 border-slate-200 pb-3"
    aria-live="polite"
  >
    {#if builtBankIndexes.length === 0 && !isDragging}
      <p
        class="pointer-events-none absolute inset-x-0 top-0 m-0 px-1 py-3 font-serif text-sm font-semibold text-slate-500"
      >
        Tap words below to build the sentence.
      </p>
    {/if}

    <div class="flex min-h-11 flex-wrap items-center gap-2">
      {#each builtBankIndexes as bankIndex, builtIndex (builtIndex)}
        {#if isDragging && insertAt === builtIndex}
          <div
            class="h-11 w-14 shrink-0 rounded-(--control-radius) border-2 border-dashed border-blue-500 bg-blue-50/80"
            aria-hidden="true"
          ></div>
        {/if}

        {#if activeDrag?.kind === "tray" && activeDrag.fromBuiltIndex === builtIndex}
          <div class={bankGhostShellClass} data-tray-chip aria-hidden="true">
            <span class={bankGhostSizingClass} lang="sk">{tiles[bankIndex]}</span>
          </div>
        {:else}
          <button
            class="{chipClass} shrink-0"
            type="button"
            data-tray-chip
            disabled={submitted}
            onpointerdown={(event) => onTrayPointerDown(event, builtIndex)}
          >
            <span lang="sk">{tiles[bankIndex]}</span>
          </button>
        {/if}
      {/each}

      {#if isDragging && insertAt === builtBankIndexes.length}
        <div
          class="h-11 w-14 shrink-0 rounded-(--control-radius) border-2 border-dashed border-blue-500 bg-blue-50/80"
          aria-hidden="true"
        ></div>
      {/if}
    </div>
  </div>

  <div
    class="flex flex-wrap gap-2"
    role="list"
    aria-label="Word bank"
    class:opacity-90={isDragging}
  >
    {#each tiles as tile, index (`${tile}-${index}`)}
      {#if isBankTileUsed(builtBankIndexes, index)}
        <div class={bankGhostShellClass} aria-hidden="true">
          <span class={bankGhostSizingClass} lang="sk">{tile}</span>
        </div>
      {:else}
        <button
          class="{chipClass} shrink-0 hover:border-blue-600"
          type="button"
          disabled={submitted}
          onpointerdown={(event) => onBankPointerDown(event, index)}
        >
          <span lang="sk">{tile}</span>
        </button>
      {/if}
    {/each}
  </div>
</div>

{#if activeDrag}
  <div
    class="pointer-events-none fixed z-50 rounded-(--control-radius) border-2 border-blue-600 bg-surface px-3.5 py-2 font-serif text-base font-semibold text-blue-800 shadow-(--shadow-border)"
    style:left="{floatX}px"
    style:top="{floatY}px"
    style:transform="translate(-50%, -50%) scale(1.04)"
    aria-hidden="true"
  >
    <span lang="sk">{floatLabel}</span>
  </div>
{/if}

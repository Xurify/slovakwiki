<script lang="ts">
  let {
    hour,
    minute,
    size = 112,
    class: className = "",
    label,
  }: {
    class?: string;
    hour: number;
    label?: string;
    minute: number;
    size?: number;
  } = $props();

  const faceHour = $derived(((Math.trunc(hour) % 12) + 12) % 12 || 12);
  const faceMinute = $derived(Math.max(0, Math.min(59, Math.trunc(minute))));
  const ariaLabel = $derived(
    label ?? `${String(faceHour)}:${String(faceMinute).padStart(2, "0")}`,
  );

  const minuteAngle = $derived(faceMinute * 6);
  const hourAngle = $derived(faceHour * 30 + faceMinute * 0.5);

  /** 60 rim marks — hour ticks longer (Apple Watch / classic dial pattern). */
  const ticks = Array.from({ length: 60 }, (_, index) => ({
    angle: index * 6,
    hour: index % 5 === 0,
  }));

  /** Even circle; air gap between ticks and type. */
  const numerals = Array.from({ length: 12 }, (_, index) => {
    const value = index === 0 ? 12 : index;
    const rad = (index * 30 * Math.PI) / 180;
    const r = 31.5;
    return {
      value,
      x: 50 + r * Math.sin(rad),
      y: 50 - r * Math.cos(rad),
    };
  });
</script>

<svg
  class="block shrink-0 text-slate-900 {className}"
  width={size}
  height={size}
  viewBox="0 0 100 100"
  role="img"
  aria-label={ariaLabel}
>
  <!-- Soft paper face + thin editorial bezel -->
  <circle
    cx="50"
    cy="50"
    r="47"
    fill="var(--surface, #fafcfd)"
    stroke="currentColor"
    stroke-width="1.6"
  />

  {#each ticks as tick (tick.angle)}
    <line
      x1="50"
      y1={tick.hour ? 5.2 : 5.5}
      x2="50"
      y2={tick.hour ? 11.2 : 8.4}
      stroke="currentColor"
      stroke-width={tick.hour ? 1.55 : 0.7}
      stroke-linecap="butt"
      opacity={tick.hour ? 0.88 : 0.38}
      transform="rotate({tick.angle} 50 50)"
    />
  {/each}

  {#each numerals as mark (mark.value)}
    <text
      x={mark.x}
      y={mark.y}
      text-anchor="middle"
      dominant-baseline="central"
      fill="currentColor"
      font-size={mark.value >= 10 ? 8 : 8.75}
      font-weight="600"
      font-family="ui-sans-serif, system-ui, sans-serif"
      style="user-select: none;"
    >
      {mark.value}
    </text>
  {/each}

  <!-- Hour: short + thick ink. Minute: longer + accent. -->
  <line
    x1="50"
    y1="50"
    x2="50"
    y2="34"
    stroke="currentColor"
    stroke-width="3.6"
    stroke-linecap="round"
    transform="rotate({hourAngle} 50 50)"
  />
  <line
    x1="50"
    y1="50"
    x2="50"
    y2="24"
    stroke="var(--accent, #1f6b8f)"
    stroke-width="2.15"
    stroke-linecap="round"
    transform="rotate({minuteAngle} 50 50)"
  />

  <circle cx="50" cy="50" r="3.4" fill="var(--surface, #fafcfd)" />
  <circle cx="50" cy="50" r="2.4" fill="var(--accent, #1f6b8f)" />
</svg>

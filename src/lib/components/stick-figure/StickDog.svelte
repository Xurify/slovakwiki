<script lang="ts">
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { n } from "$lib/stick-figure/draw";
  import { LOOKS } from "$lib/stick-figure/looks";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import { GROUND_Y } from "$lib/stick-figure/rig";

  /**
   * A dog in figure space, facing +x, standing on the same ground as the
   * cast and about knee-high to them. It reads the pose the stick rig reads:
   * `stride` and `lift` walk its legs, `mouth` opens the jaw on a bark,
   * `nod` and `tilt` move the head, and the arms' raise wags the tail, so a
   * gesture the words pick (a beat on "Haf!") comes out as a wag.
   */
  let {
    characterId,
    pose = REST_POSE,
  }: {
    characterId: LessonCharacterId;
    pose?: StickPose;
  } = $props();

  const dog = $derived(LOOKS[characterId].dog);

  const HIP_Y = 113;

  const bodyTransform = $derived(
    `translate(0 ${n(pose.bob * 0.6)}) rotate(${n(pose.lean * 0.4)} 0 ${HIP_Y})`,
  );
  const headTransform = $derived(
    `translate(0 ${n(pose.nod * 0.5)}) rotate(${n(pose.tilt * 0.8)} 15 97)`,
  );
  // Rest is a tail held up at 40°; a raised arm lifts it and wags it higher.
  const tailAngle = $derived(
    Math.max(
      15,
      Math.min(95, 40 + (pose.leadRaise - 14) * 0.35 + (pose.rearRaise - 14) * 0.15),
    ),
  );
  const tailTip = $derived({
    x: -14 - 10 * Math.cos((tailAngle * Math.PI) / 180),
    y: 103 - 10 * Math.sin((tailAngle * Math.PI) / 180),
  });
  const jaw = $derived(Math.min(1, pose.mouth) * 26);

  /** A leg from its hip to a paw on the ground; the pair on a side swings together. */
  function legPath(hipX: number, swing: number, lifted: number): string {
    const footX = hipX + swing * 5;
    const footY = GROUND_Y - Math.max(0, lifted);
    const kneeX = (hipX + footX) / 2 + 1;
    const kneeY = (HIP_Y + footY) / 2;
    return `M${n(hipX)} ${HIP_Y}Q${n(kneeX)} ${n(kneeY)} ${n(footX)} ${n(footY)}h2.6`;
  }
</script>

{#if dog}
  <ellipse cx="0" cy={GROUND_Y + 0.5} rx="18" ry="2.2" class="fill-portrait-ink/15" />

  <g transform={bodyTransform}>
    <!-- The far legs first, so the body covers their tops. -->
    <path
      d={legPath(-9, -pose.stride, -pose.lift)}
      class="stroke-portrait-ink"
      stroke-width="3"
    />
    <path
      d={legPath(9, pose.stride, -pose.lift)}
      class="stroke-portrait-ink"
      stroke-width="3"
    />

    <path
      d="M-14 103Q{n((-14 + tailTip.x) / 2 - 2)} {n((103 + tailTip.y) / 2 + 2)} {n(
        tailTip.x,
      )} {n(tailTip.y)}"
      class="stroke-portrait-ink"
      stroke-width="4.4"
    />
    <path
      d="M-14 103Q{n((-14 + tailTip.x) / 2 - 2)} {n((103 + tailTip.y) / 2 + 2)} {n(
        tailTip.x,
      )} {n(tailTip.y)}"
      class={dog.tail}
      stroke-width="2.4"
    />

    <path
      d="M-15.5 106Q-16 114.5 -8 115L9 115Q15.5 114.5 14.5 105Q13 99.5 3 100L-8.5 100Q-15 100.4 -15.5 106Z"
      class="{dog.coat} stroke-portrait-ink"
      stroke-width="1.5"
    />
    <path
      d="M-10.5 101.5Q-4 99.8 0.5 101.2Q-1 106.5 -7.5 106.6Q-11.4 105.4 -10.5 101.5Z"
      class={dog.patch}
    />

    <path
      d={legPath(-12, pose.stride, pose.lift)}
      class="stroke-portrait-ink"
      stroke-width="3.2"
    />
    <path
      d={legPath(12, -pose.stride, pose.lift)}
      class="stroke-portrait-ink"
      stroke-width="3.2"
    />

    <path
      d="M7.5 104Q8.6 96.4 13.6 92.4L19.8 98.6Q15 101.6 13.6 108Z"
      class="{dog.coat} stroke-portrait-ink"
      stroke-width="1.5"
    />
    <path d="M9.2 100.6Q12.6 103.4 16.4 100.8" class={dog.collar} stroke-width="2.2" />
    <circle
      data-leash-end="collar"
      cx="12.7"
      cy="102.2"
      r="0.5"
      fill="none"
      stroke="none"
    />

    <g transform={headTransform}>
      <!-- Lower jaw, hinged under the ear so a bark drops it. -->
      <path
        d="M18.8 98.6L26.2 98.8Q27 101.2 24.4 101.6L19.4 101.4Z"
        transform="rotate({n(jaw)} 18.8 98.6)"
        class="{dog.coat} stroke-portrait-ink"
        stroke-width="1.3"
      />
      <circle
        cx="15"
        cy="94.6"
        r="6.8"
        class="{dog.coat} stroke-portrait-ink"
        stroke-width="1.5"
      />
      <path
        d="M18.6 91.4Q24.6 91.4 27.2 93.6Q28.2 97.4 26.4 98.8L18.8 98.8Z"
        class="{dog.coat} stroke-portrait-ink"
        stroke-width="1.5"
      />
      <ellipse cx="27" cy="93.9" rx="1.6" ry="1.3" class="fill-portrait-ink" />
      <circle
        cx={n(17.6 + pose.look * 0.8)}
        cy="92.6"
        r="1.15"
        class="fill-portrait-ink"
      />
      <path
        d="M10.4 89.4Q8.2 92.6 8.8 99.4Q10.2 101.2 12.4 99.6Q13.6 94.4 13.4 89.6Z"
        class="{dog.patch} stroke-portrait-ink"
        stroke-width="1.3"
      />
    </g>
  </g>
{/if}

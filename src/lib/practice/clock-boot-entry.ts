import { runFoucBoot } from "$lib/fouc/boot";
import {
  buildDaysDatesTimeSession,
  isDaysDatesTimeKind,
  materializeDaysDatesTimeItem,
} from "$lib/learning/time/session";

import { applyClockQ1View } from "./apply-clock-q1";
import { buildClockQ1View } from "./clock-q1-view";
import { stashClockSession } from "./clock-session-stash";
import { PRACTICE_SET_FOUC } from "./fouc";

/**
 * Blocking pre-paint: roll a clock session, paint Q1, stash items for the island.
 */
runFoucBoot(PRACTICE_SET_FOUC.readyAttr, () => {
  const atItemId = new URLSearchParams(location.search).get("at");
  const items =
    atItemId && isDaysDatesTimeKind(atItemId)
      ? [materializeDaysDatesTimeItem(atItemId)]
      : buildDaysDatesTimeSession();

  stashClockSession(items);
  const first = items[0];
  if (first) applyClockQ1View(buildClockQ1View(first));
});

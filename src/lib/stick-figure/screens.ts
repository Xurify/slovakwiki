import { isActed, type World } from "./acts";
import type { SceneDirection } from "./scene-direction";
import type { SceneLine } from "./scene-line";

/** Props whose screen is too small to read on the stage. */
const SCREENS = new Set(["phone", "camera"]);

/**
 * Lines where someone shows a phone or camera without what is on it drawn
 * large (`show` with a `picture`), so the viewer cannot match the photo to the
 * words. Not acted from cues, the stage can bring a screen out but never
 * show what is on it, so a screen held by anyone but the speaker reads as
 * shown: Anna's camera stayed up through four questions about the people in
 * her photos, and nobody saw a photo.
 */
export function unseenScreens(
  lines: readonly Pick<SceneLine, "act" | "characterId">[],
  direction: Pick<SceneDirection, "lines">,
  start?: World,
): Array<{ index: number; message: string }> {
  if (!isActed(lines)) {
    return direction.lines.flatMap(({ held }, index) =>
      Object.entries(held)
        .filter(
          ([holder, prop]) => holder !== lines[index].characterId && SCREENS.has(prop),
        )
        .map(([holder, prop]) => ({
          index,
          message: `${holder} holds up a ${prop} while someone else talks, with nothing on its screen to see. Act it out with a show cue and a picture, or keep the ${prop} out of the line (props: [null]).`,
        })),
    );
  }
  return lines.flatMap(({ act }, index) =>
    (act ?? [])
      .filter(
        (cue) =>
          cue.do === "show" &&
          !cue.picture &&
          SCREENS.has(start?.objects[cue.what ?? ""]?.kind ?? cue.what ?? ""),
      )
      .map(() => ({
        index,
        message:
          "A phone or camera is shown with nothing on its screen: give the show cue a picture, drawn large over it.",
      })),
  );
}

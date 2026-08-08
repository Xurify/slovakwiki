import { describe, expect, it } from "vitest";

import {
  dictionaryLemmaSynthOptions,
  QUESTION_LEMMA_TTS_MODEL_ID,
} from "./audio-lemma-synthesis";

describe("dictionaryLemmaSynthOptions", () => {
  it("uses Flash v2.5 + SK for short question lemmas", () => {
    expect(dictionaryLemmaSynthOptions("či", ["Questions"])).toMatchObject({
      modelId: QUESTION_LEMMA_TTS_MODEL_ID,
      languageCode: "sk",
      omitVoiceSettings: true,
      synthText: "či",
    });
  });

  it("capitalizes kam to avoid English Come", () => {
    expect(dictionaryLemmaSynthOptions("kam", ["Questions"])?.synthText).toBe("Kam");
  });

  it("skips non-question lemmas", () => {
    expect(dictionaryLemmaSynthOptions("hrebeň", ["Nouns"])).toBeUndefined();
  });
});

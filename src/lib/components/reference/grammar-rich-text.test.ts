import { describe, expect, it } from "vitest";

import { splitGrammarRichText } from "./grammar-rich-text";

describe("splitGrammarRichText", () => {
  it("turns a markdown link into a link part and keeps the marks around it", () => {
    expect(
      splitGrammarRichText("Use **prísť**. The rule is on [Aspect](/grammar/aspect)."),
    ).toEqual([
      { type: "text", value: "Use " },
      { type: "em", value: "prísť" },
      { type: "text", value: ". The rule is on " },
      { type: "link", value: "Aspect", href: "/grammar/aspect" },
      { type: "text", value: "." },
    ]);
  });

  it("handles a link at the start and several in one line", () => {
    expect(
      splitGrammarRichText(
        "[Aspect](/grammar/aspect) and [Future](/grammar/future-tense)",
      ),
    ).toEqual([
      { type: "link", value: "Aspect", href: "/grammar/aspect" },
      { type: "text", value: " and " },
      { type: "link", value: "Future", href: "/grammar/future-tense" },
    ]);
  });

  it("leaves text without links to the plain splitter", () => {
    expect(splitGrammarRichText("plain **bold** and *wrong*")).toEqual([
      { type: "text", value: "plain " },
      { type: "em", value: "bold" },
      { type: "text", value: " and " },
      { type: "i", value: "wrong" },
    ]);
  });
});

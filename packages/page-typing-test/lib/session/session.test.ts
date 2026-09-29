import { describe, it, test } from "node:test";
import { Book } from "@keybr/content";
import { Layout, loadKeyboard } from "@keybr/keyboard";
import { FakeRNGStream } from "@keybr/rand";
import { textDisplaySettings, textInputSettings } from "@keybr/textinput";
import { type IInputEvent } from "@keybr/textinput-events";
import { deepEqual, equal, like } from "rich-assert";
import { BookParagraphsGenerator, CommonWordsGenerator } from "../generators/index.ts";
import { Session } from "./session.ts";
import { DurationType } from "./types.ts";

describe("session", () => {
  const words = ["one", "two", "three", "four", "five"];
  const session = new Session(
    {
      duration: {
        type: DurationType.Length,
        value: 10,
      },
      numLines: 3,
      numCols: 3,
      textInput: textInputSettings,
      textDisplay: textDisplaySettings,
    },
    new CommonWordsGenerator({ wordListSize: 1000 }, words, FakeRNGStream(words.length)),
  );

  const events: IInputEvent[] = [
    { type: "input", timeStamp: 100, inputType: "appendChar", codePoint: /* "o" */ 0x006f, timeToType: 100 },
    { type: "input", timeStamp: 200, inputType: "appendChar", codePoint: /* "n" */ 0x006e, timeToType: 100 },
    { type: "input", timeStamp: 300, inputType: "appendChar", codePoint: /* "e" */ 0x0065, timeToType: 100 },
    { type: "input", timeStamp: 400, inputType: "appendChar", codePoint: /* SPACE */ 0x0020, timeToType: 100 },
  ];

  it("should have initial state", () => {
    const { lines } = session.getLines();
    equal(lines.length, 3);
    like(lines, [
      { text: "one ", mark: { mark: 0 } },
      { text: "two ", mark: { mark: 1 } },
      { text: "three ", mark: { mark: 2 } },
    ]);
  });

  it("should update state on input", () => {
    for (const event of events) {
      session.handleInput(event);
    }

    const { lines } = session.getLines();
    equal(lines.length, 3);
    like(lines, [
      { text: "two ", mark: { mark: 1 } },
      { text: "three ", mark: { mark: 2 } },
      { text: "four ", mark: { mark: 3 } },
    ]);
  });
});

test("fit zhuyin book lines to the width of their hanzi", () => {
  const session = new Session(
    {
      duration: { type: DurationType.Length, value: 10 },
      numLines: 3,
      numCols: 10,
      textInput: textInputSettings,
      textDisplay: textDisplaySettings,
    },
    new BookParagraphsGenerator(
      { paragraphIndex: 0, lettersOnly: false },
      {
        book: Book.ZH_TW_BAIHUA,
        content: [["", ["今ㄐㄧㄣ 天ㄊㄧㄢ ，他ㄊㄚ 說ㄕㄨㄛ 。"]]],
      },
      loadKeyboard(Layout.ZH_TW_DACHEN),
    ),
  );

  // "今天，他" takes 8 columns, its 11 keys would not fit in 10, and a line
  // never starts with the "，" typed after the space of "天".
  deepEqual(
    session.getLines().lines.map(({ chars }) => chars.map(({ glyph }) => glyph).join("")),
    ["今天，他", "說。今", "天，他"],
  );
});

test("split a run of hanzi wider than a line between two of them", () => {
  const session = new Session(
    {
      duration: { type: DurationType.Length, value: 10 },
      numLines: 3,
      numCols: 10,
      textInput: textInputSettings,
      textDisplay: textDisplaySettings,
    },
    new BookParagraphsGenerator(
      { paragraphIndex: 0, lettersOnly: false },
      {
        book: Book.ZH_TW_BAIHUA,
        content: [["", ["我ㄨㄛˇ們ㄇㄣ˙是ㄕˋ『好ㄏㄠˇ朋ㄆㄥˊ友ㄧㄡˇ』。"]]],
      },
      loadKeyboard(Layout.ZH_TW_DACHEN),
    ),
  );

  // No first tone space to break at, so the line breaks before "朋", as
  // "『" cannot end a line, and the keys go on without a space.
  const { lines } = session.getLines();
  deepEqual(
    lines.map(({ chars }) => chars.map(({ glyph }) => glyph).join("")),
    ["我們是『好", "朋友』。", "我們是『好"],
  );
  deepEqual(
    lines.map(({ text }) => text),
    ["我ㄨㄛˇ們ㄇㄣ˙是ㄕˋ『好ㄏㄠˇ", "朋ㄆㄥˊ友ㄧㄡˇ』。 ", "我ㄨㄛˇ們ㄇㄣ˙是ㄕˋ『好ㄏㄠˇ"],
  );
});

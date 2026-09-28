import { test } from "node:test";
import { Layout, loadKeyboard } from "@keybr/keyboard";
import { deepEqual, equal } from "rich-assert";
import { Book } from "./book.ts";
import { displayText, splitGlyphs, splitParagraph } from "./util.ts";

test("split glyphs", () => {
  // The punctuation of the keyboard is typed with its own key, the "……" and
  // the "S" without a key are displayed with a neighbouring Hanzi.
  deepEqual(
    splitGlyphs(
      "「我ㄨㄛˇ親ㄑㄧㄣ 。天ㄊㄧㄢ 了ㄌㄜ˙……S會ㄏㄨㄟˋ；",
      loadKeyboard(Layout.ZH_TW_DACHEN).getCodePoints(),
    ),
    [
      { text: "「", glyph: "「" },
      { text: "ㄨㄛˇ", glyph: "我" },
      { text: "ㄑㄧㄣ ", glyph: "親" },
      { text: "。", glyph: "。" },
      { text: "ㄊㄧㄢ ", glyph: "天" },
      { text: "ㄌㄜ˙", glyph: "了……" },
      { text: "ㄏㄨㄟˋ", glyph: "S會" },
      { text: "；", glyph: "；" },
    ],
  );
});

test("split glyphs without typing the punctuation", () => {
  // A punctuation stays displayed next to the Hanzi it belongs to, and the
  // first tone space before it is still typed.
  deepEqual(splitGlyphs("天ㄊㄧㄢ ，「我ㄨㄛˇ」。", new Set()), [
    { text: "ㄊㄧㄢ ", glyph: "天，" },
    { text: "ㄨㄛˇ", glyph: "「我」。" },
  ]);
});

test("split paragraph", () => {
  // A word never starts with a closing punctuation, so neither does a line.
  deepEqual(
    splitParagraph(Book.ZH_TW_BAIHUA, "今ㄐㄧㄣ 天ㄊㄧㄢ ，他ㄊㄚ 「我ㄨㄛˇ」"),
    ["今ㄐㄧㄣ", "天ㄊㄧㄢ ，他ㄊㄚ", "「我ㄨㄛˇ」"],
  );
  deepEqual(splitParagraph(Book.EN_ALICE_WONDERLAND, "Alice , was"), [
    "Alice",
    ",",
    "was",
  ]);
});

test("display text", () => {
  equal(
    displayText(Book.ZH_TW_BAIHUA, "我ㄨㄛˇ親ㄑㄧㄣ 。天ㄊㄧㄢ"),
    "我親。天",
  );
  equal(displayText(Book.EN_ALICE_WONDERLAND, "Alice was"), "Alice was");
});

import { test } from "node:test";
import { Book } from "@keybr/content";
import { Layout, loadKeyboard } from "@keybr/keyboard";
import { deepEqual, equal } from "rich-assert";
import { BookParagraphsGenerator } from "./book.ts";

test("generate words", () => {
  const generator = new BookParagraphsGenerator(
    {
      paragraphIndex: 0,
      lettersOnly: false,
    },
    {
      book: Book.EN_ALICE_WONDERLAND,
      content: [
        ["Chapter I", ["one two three"]],
        ["Chapter II", ["four five six"]],
      ],
    },
    loadKeyboard(Layout.EN_US),
  );

  const mark0 = generator.mark();

  equal(generator.nextWord(), "one");
  equal(generator.nextWord(), "two");
  equal(generator.nextWord(), "three");

  const mark1 = generator.mark();

  equal(generator.nextWord(), "four");
  equal(generator.nextWord(), "five");
  equal(generator.nextWord(), "six");
  equal(generator.nextWord(), "one");
  equal(generator.nextWord(), "two");

  generator.reset(mark1);

  equal(generator.nextWord(), "four");
  equal(generator.nextWord(), "five");

  generator.reset(mark0);

  equal(generator.nextWord(), "one");
  equal(generator.nextWord(), "two");
});

test("remove the punctuation of a zhuyin book", () => {
  const generator = new BookParagraphsGenerator(
    {
      paragraphIndex: 0,
      lettersOnly: true,
    },
    {
      book: Book.ZH_TW_BAIHUA,
      content: [["", ["「我ㄨㄛˇ親ㄑㄧㄣ 。」天ㄊㄧㄢ"]]],
    },
    loadKeyboard(Layout.ZH_TW_DACHEN),
  );

  // Neither typed nor displayed.
  equal(generator.nextWord(), "我ㄨㄛˇ親ㄑㄧㄣ");
  equal(generator.nextWord(), "天ㄊㄧㄢ");
  deepEqual(generator.format("我ㄨㄛˇ親ㄑㄧㄣ 天ㄊㄧㄢ"), [
    { text: "ㄨㄛˇ", glyph: "我" },
    { text: "ㄑㄧㄣ ", glyph: "親" },
    { text: "ㄊㄧㄢ", glyph: "天" },
  ]);
});

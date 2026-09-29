import { test } from "node:test";
import { Book } from "@keybr/content";
import { Layout, loadKeyboard } from "@keybr/keyboard";
import { FakePhoneticModel } from "@keybr/phonetic-model";
import { Settings } from "@keybr/settings";
import { deepEqual } from "rich-assert";
import { BooksLesson } from "./books.ts";
import { lessonProps } from "./settings.ts";

test("display the hanzi of a zhuyin book in place of their keys", () => {
  const lesson = new BooksLesson(
    new Settings(),
    loadKeyboard(Layout.ZH_TW_DACHEN),
    new FakePhoneticModel(),
    {
      book: Book.ZH_TW_BAIHUA,
      content: [["背影", ["我ㄨㄛˇ親ㄑㄧㄣ 。天ㄊㄧㄢ"]]],
    },
  );

  // The Hanzi are not on the keyboard, but they must survive the filter.
  deepEqual(lesson.paragraphs, ["我ㄨㄛˇ親ㄑㄧㄣ 。天ㄊㄧㄢ"]);
  // The space typed before "。" does not start a word with it.
  deepEqual(lesson.wordList, ["我ㄨㄛˇ親ㄑㄧㄣ 。天ㄊㄧㄢ"]);
  // The words are joined back with the space that types "天".
  deepEqual((lesson.generate() as unknown[]).slice(0, 5), [
    { text: "ㄨㄛˇ", glyph: "我" },
    { text: "ㄑㄧㄣ ", glyph: "親" },
    { text: "。", glyph: "。" },
    { text: "ㄊㄧㄢ ", glyph: "天" },
    { text: "ㄨㄛˇ", glyph: "我" },
  ]);
});

test("remove the punctuation of a zhuyin book", () => {
  const lesson = new BooksLesson(
    new Settings().set(lessonProps.books.lettersOnly, true),
    loadKeyboard(Layout.ZH_TW_DACHEN),
    new FakePhoneticModel(),
    {
      book: Book.ZH_TW_BAIHUA,
      content: [["背影", ["我ㄨㄛˇ親ㄑㄧㄣ 。天ㄊㄧㄢ ！"]]],
    },
  );

  // Neither typed nor displayed, but the space before it still types "親".
  deepEqual(lesson.paragraphs, ["我ㄨㄛˇ親ㄑㄧㄣ 天ㄊㄧㄢ"]);
  deepEqual((lesson.generate() as unknown[]).slice(0, 4), [
    { text: "ㄨㄛˇ", glyph: "我" },
    { text: "ㄑㄧㄣ ", glyph: "親" },
    { text: "ㄊㄧㄢ ", glyph: "天" },
    { text: "ㄨㄛˇ", glyph: "我" },
  ]);
});

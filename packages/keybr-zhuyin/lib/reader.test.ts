import { test } from "node:test";
import { equal } from "rich-assert";
import { loadZhuyinReader } from "./load.ts";
import { ZhuyinReader } from "./reader.ts";

const reader = new ZhuyinReader({
  norm: 1000,
  phrases: [
    "銀\tㄧㄣˊ\t10",
    "行\tㄒㄧㄥˊ\t100",
    "銀行\tㄧㄣˊㄏㄤˊ\t20",
    "天\tㄊㄧㄢ \t50",
  ].join("\n"),
});

test("read a polyphonic character in its phrase", () => {
  // "行" is more often "ㄒㄧㄥˊ", but a phrase outweighs its characters.
  equal(reader.toGlyphs("行"), "行ㄒㄧㄥˊ");
  equal(reader.toGlyphs("銀行"), "銀ㄧㄣˊ行ㄏㄤˊ");
});

test("type the first tone with the space bar", () => {
  // The space of the last first tone is the word separator of a lesson.
  equal(reader.toGlyphs("天天"), "天ㄊㄧㄢ 天ㄊㄧㄢ");
  equal(reader.toGlyphs("天，行"), "天ㄊㄧㄢ ，行ㄒㄧㄥˊ");
});

test("display a character without a reading", () => {
  // A custom text may hold any character, it must not break the lesson.
  equal(reader.toGlyphs("猹行"), "猹行ㄒㄧㄥˊ");
  equal(reader.toGlyphs("ㄅ S"), "ㄅ S");
});

test("read the text of a custom lesson", async () => {
  const reader = await loadZhuyinReader();
  equal(
    reader.toGlyphs("我今天很好。"),
    "我ㄨㄛˇ今ㄐㄧㄣ 天ㄊㄧㄢ 很ㄏㄣˇ好ㄏㄠˇ。",
  );
  // The readings of the polyphonic characters depend on their phrases.
  equal(reader.toGlyphs("銀行"), "銀ㄧㄣˊ行ㄏㄤˊ");
  equal(reader.toGlyphs("行走"), "行ㄒㄧㄥˊ走ㄗㄡˇ");
  equal(reader.toGlyphs("這"), "這ㄓㄜˋ");
});

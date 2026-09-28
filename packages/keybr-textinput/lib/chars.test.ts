import { test } from "node:test";
import { deepEqual, equal, isFalse, isTrue } from "rich-assert";
import {
  Attr,
  charsAreEqual,
  flattenStyledText,
  splitStyledText,
} from "./chars.ts";

test("flatten styled text", () => {
  equal(flattenStyledText("abc"), "abc");
  equal(flattenStyledText([["abc"]]), "abc");
  equal(flattenStyledText([{ text: "xyz", cls: "c1" }]), "xyz");
  equal(flattenStyledText([["abc"], [{ text: "xyz", cls: "c1" }]]), "abcxyz");
});

test("split styled text", () => {
  deepEqual(splitStyledText("abc"), [
    { codePoint: 0x0061, attrs: Attr.Normal, cls: null },
    { codePoint: 0x0062, attrs: Attr.Normal, cls: null },
    { codePoint: 0x0063, attrs: Attr.Normal, cls: null },
  ]);
  deepEqual(splitStyledText([["abc"]]), [
    { codePoint: 0x0061, attrs: Attr.Normal, cls: null },
    { codePoint: 0x0062, attrs: Attr.Normal, cls: null },
    { codePoint: 0x0063, attrs: Attr.Normal, cls: null },
  ]);
  deepEqual(splitStyledText([[{ text: "xyz", cls: "c1" }]]), [
    { codePoint: 0x0078, attrs: Attr.Normal, cls: "c1" },
    { codePoint: 0x0079, attrs: Attr.Normal, cls: "c1" },
    { codePoint: 0x007a, attrs: Attr.Normal, cls: "c1" },
  ]);
  deepEqual(splitStyledText([["abc"], [{ text: "xyz", cls: "c1" }]]), [
    { codePoint: 0x0061, attrs: Attr.Normal, cls: null },
    { codePoint: 0x0062, attrs: Attr.Normal, cls: null },
    { codePoint: 0x0063, attrs: Attr.Normal, cls: null },
    { codePoint: 0x0078, attrs: Attr.Normal, cls: "c1" },
    { codePoint: 0x0079, attrs: Attr.Normal, cls: "c1" },
    { codePoint: 0x007a, attrs: Attr.Normal, cls: "c1" },
  ]);
});

test("split glyph text", () => {
  // The glyph goes to the first char only, so that the chars of two adjacent
  // glyphs stay distinguishable.
  deepEqual(
    splitStyledText([
      { text: "ㄨㄛˇ", glyph: "我" },
      { text: "ㄌㄜ˙", glyph: "了" },
    ]),
    [
      { codePoint: 0x3128, attrs: Attr.Normal, cls: null, glyph: "我" },
      { codePoint: 0x311b, attrs: Attr.Normal, cls: null, glyph: "" },
      { codePoint: 0x02c7, attrs: Attr.Normal, cls: null, glyph: "" },
      { codePoint: 0x310c, attrs: Attr.Normal, cls: null, glyph: "了" },
      { codePoint: 0x311c, attrs: Attr.Normal, cls: null, glyph: "" },
      { codePoint: 0x02d9, attrs: Attr.Normal, cls: null, glyph: "" },
    ],
  );
});

test("equal chars", () => {
  isTrue(
    charsAreEqual(
      { codePoint: 0x0061, attrs: Attr.Normal, cls: "c1" },
      { codePoint: 0x0061, attrs: Attr.Normal, cls: "c1" },
    ),
  );
  isFalse(
    charsAreEqual(
      { codePoint: 0x0061, attrs: Attr.Normal, cls: "c1" },
      { codePoint: 0x0062, attrs: Attr.Normal, cls: "c1" },
    ),
  );
  isFalse(
    charsAreEqual(
      { codePoint: 0x0061, attrs: Attr.Normal, cls: "c1" },
      { codePoint: 0x0061, attrs: Attr.Hit, cls: "c1" },
    ),
  );
  isFalse(
    charsAreEqual(
      { codePoint: 0x0061, attrs: Attr.Normal, cls: "c1" },
      { codePoint: 0x0061, attrs: Attr.Normal, cls: "c2" },
    ),
  );
  // Homophones like "是" and "事" are typed alike, but must render apart.
  isFalse(
    charsAreEqual(
      { codePoint: 0x3115, attrs: Attr.Normal, glyph: "是" },
      { codePoint: 0x3115, attrs: Attr.Normal, glyph: "事" },
    ),
  );
});

import { test } from "node:test";
import { equal, isFalse, isTrue } from "rich-assert";
import { Language } from "./language.ts";

test("string manipulation", () => {
  equal(Language.EN.upperCase(""), "");
  equal(Language.EN.upperCase("aBc"), "ABC");
  equal(Language.EN.lowerCase(""), "");
  equal(Language.EN.lowerCase("aBc"), "abc");
  equal(Language.EN.capitalCase(""), "");
  equal(Language.EN.capitalCase("aBc"), "Abc");
});

test("check words", () => {
  isTrue(Language.EN.test(""));
  isTrue(Language.EN.test("ABCdef"));
  isFalse(Language.EN.test("AaIıİi"));
  isFalse(Language.EN.test("абвгде"));
  isTrue(Language.ZH_TW.test("ㄊㄧㄢ"));
  isFalse(Language.ZH_TW.test("abc"));
});

test("letter name", () => {
  equal(Language.EN.letterName(0x0069), "I");
  // Zhuyin has no letter case, a key shows the symbol as is.
  equal(Language.ZH_TW.letterName(/* "ㄅ" */ 0x3105), "ㄅ");
});

import { test } from "node:test";
import { Book, flattenContent, splitGlyphs } from "@keybr/content";
import { Layout, loadKeyboard } from "@keybr/keyboard";
import { deepEqual, fail } from "rich-assert";
import { loadContent } from "./load.ts";

test("type the zhuyin book on the dachen layout", async () => {
  const keyboard = loadKeyboard(Layout.ZH_TW_DACHEN);
  const content = await loadContent(Book.ZH_TW_BAIHUA);
  const unkeyed = new Set<string>();
  for (const paragraph of flattenContent(content)) {
    const spans = splitGlyphs(paragraph, keyboard.getCodePoints());
    for (const { text, glyph } of spans) {
      // Hanzi sharing their keys means one of them has no reading.
      if ((glyph.match(/\p{Script=Han}/gu)?.length ?? 0) > 1) {
        fail(`Bad glyph "${glyph}" in "${paragraph}"`);
      }
      for (const char of glyph) {
        if (!/\p{Script=Han}/u.test(char) && !text.includes(char)) {
          unkeyed.add(char);
        }
      }
    }
    const keys = spans.map(({ text }) => text).join("");
    for (const char of keys) {
      if (char !== " " && keyboard.getCombo(char.codePointAt(0)!) == null) {
        fail(`Bad key "${char}" in "${paragraph}"`);
      }
    }
    // A tone mark ends a syllable, so it cannot follow a space.
    if (/(^| )[ˊˇˋ˙]/u.test(keys)) {
      fail(`Bad tone in "${paragraph}"`);
    }
  }
  // McBopomofo has no key for these, they are displayed but not typed.
  deepEqual([...unkeyed].sort(), ["S", "…"]);
});

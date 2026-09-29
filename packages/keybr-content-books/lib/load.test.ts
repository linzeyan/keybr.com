import { test } from "node:test";
import { Book, flattenContent, splitGlyphs } from "@keybr/content";
import { Language, Layout, loadKeyboard } from "@keybr/keyboard";
import { fail } from "rich-assert";
import { loadContent } from "./load.ts";

for (const book of Book.forLanguage(Language.ZH_TW)) {
  test(`type the zhuyin book ${book.id} on the dachen layout`, async () => {
    const keyboard = loadKeyboard(Layout.ZH_TW_DACHEN);
    const content = await loadContent(book);
    for (const paragraph of flattenContent(content)) {
      const spans = splitGlyphs(paragraph, keyboard.getCodePoints());
      for (const { text, glyph } of spans) {
        // Every key of a book is displayed as a Hanzi or a punctuation.
        if (glyph == null) {
          fail(`Keys "${text}" without a glyph in "${paragraph}"`);
        }
        // Hanzi sharing their keys means one of them has no reading.
        if ((glyph.match(/\p{Script=Han}/gu)?.length ?? 0) > 1) {
          fail(`Bad glyph "${glyph}" in "${paragraph}"`);
        }
        // McBopomofo has no key for these, they are displayed but not typed.
        // Any other untyped punctuation is a mistake in the text.
        for (const char of glyph) {
          if (
            !/[\p{Script=Han}\p{Script=Latin}\u00a0…～《》・]/u.test(char) &&
            !text.includes(char)
          ) {
            fail(`Untyped "${char}" in "${paragraph}"`);
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
  });
}

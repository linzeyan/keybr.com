import { test } from "node:test";
import { Language } from "@keybr/keyboard";
import { fail, isTrue } from "rich-assert";
import { loadWordList } from "./load.ts";

for (const language of Language.ALL) {
  test(`words:${language}`, async () => {
    const words = await loadWordList(language);
    isTrue(words.length > 1500);
    const unique = new Set();
    for (const word of words) {
      // A Zhuyin word keeps the first tone spaces inside, like "ㄐㄧㄣ ㄊㄧㄢ".
      const letters =
        language.script === "bopomofo" && /^\S+( \S+)*$/u.test(word)
          ? word.replaceAll(" ", "")
          : word;
      if (!language.test(letters)) {
        fail(`Extraneous word "${word}"`);
      }
      if (unique.has(word)) {
        fail(`Duplicate word "${word}"`);
      }
      unique.add(word);
    }
  });
}

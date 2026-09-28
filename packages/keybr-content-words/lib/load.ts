import { type WordList } from "@keybr/content";
import { Language } from "@keybr/keyboard";

export async function loadWordList(language: Language): Promise<WordList> {
  switch (language) {
    case Language.EN:
      return (
        await import(
          /* webpackChunkName: "words-en" */ "./data/words-en.json",
          { with: { type: "json" } }
        )
      ).default;
    case Language.ZH_TW:
      return (
        await import(
          /* webpackChunkName: "words-zh-TW" */ "./data/words-zh-TW.json",
          { with: { type: "json" } }
        )
      ).default;
    default:
      throw new Error();
  }
}

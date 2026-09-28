import { Language } from "@keybr/keyboard";
import EN from "./blacklist-en.json" with { type: "json" };
import { unscrambleWord } from "./scramble.ts";

const blacklistByLanguage = ((items: [Language, string[]][]) =>
  new Map<Language, Set<string>>(
    items.map(([language, list]) => [
      language,
      new Set(list.map(unscrambleWord)),
    ]),
  ))([[Language.EN, EN]]);

export type Blacklist = { readonly allow: (word: string) => boolean };

export function getBlacklist(language: Language): Blacklist {
  const blacklist = blacklistByLanguage.get(language) ?? null;
  if (blacklist != null && blacklist.size > 0) {
    return new (class implements Blacklist {
      allow(word: string): boolean {
        return !blacklist.has(language.lowerCase(word));
      }
    })();
  } else {
    return new (class implements Blacklist {
      allow(word: string): boolean {
        return true;
      }
    })();
  }
}

import { removePunctuation, splitGlyphs, splitParagraph } from "@keybr/content";
import { filterText, type Keyboard } from "@keybr/keyboard";
import { type PhoneticModel } from "@keybr/phonetic-model";
import { type RNGStream } from "@keybr/rand";
import { type KeyStatsMap } from "@keybr/result";
import { type Settings } from "@keybr/settings";
import { type ZhuyinReader } from "@keybr/zhuyin";
import { LessonKeys } from "./key.ts";
import { Lesson } from "./lesson.ts";
import { lessonProps } from "./settings.ts";
import { Target } from "./target.ts";
import { generateFragment } from "./text/fragment.ts";
import { randomWords, uniqueWords, wordSequence } from "./text/words.ts";

export class CustomTextLesson extends Lesson {
  readonly #reader: ZhuyinReader | null;
  readonly wordList: readonly string[];
  wordIndex = 0;

  /** A Zhuyin text with Hanzi needs a reader to type them. */
  constructor(
    settings: Settings,
    keyboard: Keyboard,
    model: PhoneticModel,
    reader: ZhuyinReader | null = null,
  ) {
    super(settings, keyboard, model);
    this.#reader = reader;
    this.wordList = this.#getWordList();
  }

  override get letters() {
    return this.model.letters;
  }

  override update(keyStatsMap: KeyStatsMap) {
    return LessonKeys.includeAll(keyStatsMap, new Target(this.settings));
  }

  override generate(lessonKeys: LessonKeys, rng: RNGStream) {
    const fragment = generateFragment(
      this.settings,
      this.#makeWordGenerator(rng),
    );
    // Like a Zhuyin book, the Hanzi are displayed in place of the typed keys.
    return this.#hanzi ? splitGlyphs(fragment, this.#codePoints()) : fragment;
  }

  get #zhuyin() {
    return this.model.language.script === "bopomofo";
  }

  get #hanzi() {
    return this.#zhuyin && this.settings.get(lessonProps.customText.hanzi);
  }

  #makeWordGenerator(rng: RNGStream) {
    const randomize = this.settings.get(lessonProps.customText.randomize);
    if (randomize && this.wordList.length > 0) {
      return uniqueWords(randomWords(this.wordList, rng));
    } else {
      return wordSequence(this.wordList, this);
    }
  }

  #getWordList() {
    const content = this.settings.get(lessonProps.customText.content);
    const lowercase = this.settings.get(lessonProps.customText.lowercase);
    const codePoints = this.#codePoints();
    if (this.#zhuyin) {
      return this.#getZhuyinWords(content, codePoints);
    }
    let text = filterText(content, codePoints);
    if (lowercase) {
      text = this.model.language.lowerCase(text);
    }
    return text.split(/\s+/);
  }

  /**
   * Reads the Hanzi of a Zhuyin text, and splits it like a Zhuyin book.
   * A whitespace of the text breaks words, and the space joining them types
   * the first tone of the word before.
   */
  #getZhuyinWords(content: string, codePoints: ReadonlySet<number>) {
    const lettersOnly = this.settings.get(lessonProps.customText.lettersOnly);
    return content
      .split(/\s+/)
      .flatMap((chunk) => {
        let text = this.#reader?.toGlyphs(chunk) ?? chunk;
        if (lettersOnly) {
          text = removePunctuation(text);
        }
        if (!this.#hanzi) {
          // Only the keys are displayed, with the first tone spaces.
          text = [...text]
            .filter(
              (char) => char === " " || codePoints.has(char.codePointAt(0)!),
            )
            .join("");
        }
        return splitParagraph(this.model, text);
      })
      .filter((word) => word !== "");
  }

  /** Returns the code points to type, without punctuation if so chosen. */
  #codePoints() {
    const codePoints = new Set(this.codePoints);
    if (this.settings.get(lessonProps.customText.lettersOnly)) {
      for (const codePoint of codePoints) {
        if (!this.model.language.includes(codePoint)) {
          codePoints.delete(codePoint);
        }
      }
    }
    return codePoints;
  }
}

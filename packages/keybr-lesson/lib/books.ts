import {
  type Book,
  type BookContent,
  type Content,
  flattenContent,
  removePunctuation,
  splitGlyphs,
  splitParagraph,
} from "@keybr/content";
import { filterText, type Keyboard } from "@keybr/keyboard";
import { clamp } from "@keybr/lang";
import { type PhoneticModel } from "@keybr/phonetic-model";
import { type KeyStatsMap } from "@keybr/result";
import { type Settings } from "@keybr/settings";
import { LessonKeys } from "./key.ts";
import { Lesson } from "./lesson.ts";
import { lessonProps } from "./settings.ts";
import { Target } from "./target.ts";
import { generateFragment } from "./text/fragment.ts";
import { wordSequence } from "./text/words.ts";

export class BooksLesson extends Lesson {
  readonly book: Book;
  readonly content: Content;
  readonly paragraphs: readonly string[];
  readonly paragraphIndex: number;
  readonly wordList: readonly string[];
  wordIndex = 0;

  constructor(
    settings: Settings,
    keyboard: Keyboard,
    model: PhoneticModel,
    { book, content }: BookContent,
  ) {
    super(settings, keyboard, model);
    const paragraphIndex = this.settings.get(lessonProps.books.paragraphIndex);
    this.book = book;
    this.content = content;
    this.paragraphs = this.#flattenContent(content);
    this.paragraphIndex = clamp(paragraphIndex, 0, this.paragraphs.length);
    this.wordList = [
      ...this.paragraphs.slice(this.paragraphIndex),
      ...this.paragraphs.slice(0, this.paragraphIndex),
    ]
      .map((paragraph) => splitParagraph(book, paragraph))
      .flat();
  }

  override get letters() {
    return this.model.letters;
  }

  override update(keyStatsMap: KeyStatsMap) {
    return LessonKeys.includeAll(keyStatsMap, new Target(this.settings));
  }

  override generate() {
    const fragment = generateFragment(
      this.settings,
      wordSequence(this.wordList, this),
    );
    // A Zhuyin book keeps displaying the chars it does not type.
    return this.#zhuyin ? splitGlyphs(fragment, this.#codePoints()) : fragment;
  }

  /** A Zhuyin book displays its Hanzi in place of the typed keys. */
  get #zhuyin() {
    return this.book.language.script === "bopomofo";
  }

  /** Returns the code points to type, without punctuation if so chosen. */
  #codePoints() {
    const codePoints = new Set(this.keyboard.getCodePoints());
    if (this.settings.get(lessonProps.books.lettersOnly)) {
      for (const codePoint of codePoints) {
        if (!this.model.language.includes(codePoint)) {
          codePoints.delete(codePoint);
        }
      }
    }
    return codePoints;
  }

  #flattenContent(content: Content) {
    if (this.#zhuyin) {
      // The Hanzi are not typed, but they must stay to be displayed.
      const paragraphs = flattenContent(content);
      return this.settings.get(lessonProps.books.lettersOnly)
        ? paragraphs.map(removePunctuation)
        : paragraphs;
    }
    const lowercase = this.settings.get(lessonProps.books.lowercase);
    const codePoints = this.#codePoints();
    return flattenContent(content).map((paragraph) => {
      let text = filterText(paragraph, codePoints);
      if (lowercase) {
        text = this.model.language.lowerCase(text);
      }
      return text;
    });
  }
}

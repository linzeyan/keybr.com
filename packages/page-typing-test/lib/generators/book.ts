import {
  type Book,
  type BookContent,
  type Content,
  flattenContent,
  removePunctuation,
  splitGlyphs,
  splitParagraph,
} from "@keybr/content";
import { type Keyboard, type WeightedCodePointSet } from "@keybr/keyboard";
import { clamp } from "@keybr/lang";
import { type StyledText } from "@keybr/textinput";
import { type TextGenerator } from "./types.ts";

type BookSettings = {
  readonly paragraphIndex: number;
  readonly lettersOnly: boolean;
};

type Mark = {
  readonly paragraphIndex: number;
  readonly wordIndex: number;
};

export class BookParagraphsGenerator implements TextGenerator<Mark> {
  readonly #book: Book;
  readonly #codePoints: WeightedCodePointSet;
  readonly #paragraphs: readonly string[];
  #paragraphIndex: number;
  #words: readonly string[] = [];
  #wordIndex: number = 0;

  constructor(
    settings: BookSettings,
    { book, content }: BookContent,
    keyboard: Keyboard,
  ) {
    this.#book = book;
    this.#codePoints = keyboard.getCodePoints();
    const paragraphs = bookParagraphs(content, settings);
    const paragraphIndex = clamp(settings.paragraphIndex, 0, paragraphs.length);
    this.#paragraphs = paragraphs;
    this.#paragraphIndex = paragraphIndex;
    this.#words = splitParagraph(book, paragraphs[paragraphIndex]);
    this.#wordIndex = 0;
  }

  mark(): Mark {
    return {
      paragraphIndex: this.#paragraphIndex,
      wordIndex: this.#wordIndex,
    };
  }

  reset({ paragraphIndex, wordIndex }: Mark): void {
    this.#paragraphIndex = paragraphIndex;
    this.#words = splitParagraph(
      this.#book,
      this.#paragraphs[this.#paragraphIndex],
    );
    this.#wordIndex = wordIndex;
  }

  nextWord(): string {
    if (this.#wordIndex >= this.#words.length) {
      this.#paragraphIndex += 1;
      if (this.#paragraphIndex >= this.#paragraphs.length) {
        this.#paragraphIndex = 0;
      }
      this.#words = splitParagraph(
        this.#book,
        this.#paragraphs[this.#paragraphIndex],
      );
      this.#wordIndex = 0;
    }
    const word = this.#words[this.#wordIndex];
    this.#wordIndex += 1;
    return word;
  }

  format(words: string): StyledText {
    // A Zhuyin book displays its Hanzi in place of the typed keys.
    return this.#book.language.script === "bopomofo"
      ? splitGlyphs(words, this.#codePoints)
      : words;
  }
}

/** Returns the paragraphs to type, the typing test books are in Zhuyin. */
export function bookParagraphs(
  content: Content,
  { lettersOnly }: { readonly lettersOnly: boolean },
): readonly string[] {
  const paragraphs = flattenContent(content);
  return lettersOnly ? paragraphs.map(removePunctuation) : paragraphs;
}

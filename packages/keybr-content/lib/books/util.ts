import { Language } from "@keybr/keyboard";
import { type CodePointSet } from "@keybr/unicode";
import { type Book } from "./book.ts";
import { type Content } from "./types.ts";

export function flattenContent(content: Content): readonly string[] {
  const result: string[] = [];
  for (const [title, paragraphs] of content) {
    result.push(...paragraphs);
  }
  return result;
}

export function splitParagraph(
  { language }: Book,
  paragraph: string,
): readonly string[] {
  // A Zhuyin book types a first tone with the space bar, which is not a word
  // break before a punctuation, or a lesson or a line would start with it.
  return paragraph.split(
    language.script === "bopomofo"
      ? / (?![\p{Pe}\p{Pf}\p{Po}\p{Pd}])/u
      : /\s+/g,
  );
}

/**
 * Splits a text of a Zhuyin book into the keys to type, each with the glyph
 * displayed in their place. The text pairs every Hanzi with its Zhuyin keys,
 * as in "我ㄨㄛˇ們ㄇㄣ˙", and a punctuation among the given keys is typed as
 * it is. Any other char is only displayed: a closing punctuation like "……"
 * goes with the glyph before it, an opening one like "「" or a letter like
 * the "S" of "S會館" with the glyph after it.
 */
export function splitGlyphs(
  text: string,
  keys: CodePointSet,
): { readonly text: string; readonly glyph: string }[] {
  const spans: { text: string; glyph: string }[] = [];
  let glyph = "";
  for (const char of text) {
    const codePoint = char.codePointAt(0)!;
    if (char === " " || Language.ZH_TW.includes(codePoint)) {
      if (glyph !== "" || spans.length === 0) {
        spans.push({ text: char, glyph });
        glyph = "";
      } else {
        spans[spans.length - 1].text += char;
      }
    } else if (keys.has(codePoint)) {
      spans.push({ text: char, glyph: glyph + char });
      glyph = "";
    } else if (
      glyph === "" &&
      spans.length > 0 &&
      /[\p{Pe}\p{Pf}\p{Po}\p{Pd}]/u.test(char)
    ) {
      spans[spans.length - 1].glyph += char;
    } else {
      glyph += char;
    }
  }
  if (glyph !== "") {
    // A char at the end has no glyph after it.
    if (spans.length > 0) {
      spans[spans.length - 1].glyph += glyph;
    } else {
      spans.push({ text: "", glyph });
    }
  }
  return spans;
}

/** Returns the displayed text of a paragraph of the given book. */
export function displayText({ language }: Book, paragraph: string): string {
  return language.script === "bopomofo"
    ? [...paragraph]
        .filter(
          (char) =>
            char !== " " && !Language.ZH_TW.includes(char.codePointAt(0)!),
        )
        .join("")
    : paragraph;
}

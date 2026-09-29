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
  // A custom text is split like a book of its language.
  { language }: { readonly language: Language },
  paragraph: string,
): readonly string[] {
  // A Zhuyin text types a first tone with the space bar, which is not a word
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
 * the "S" of "S會館" with the glyph after it. The keys of a custom text
 * without a Hanzi before them are displayed as they are.
 */
export function splitGlyphs(
  text: string,
  keys: CodePointSet,
): { readonly text: string; readonly glyph?: string }[] {
  const spans: { text: string; glyph?: string }[] = [];
  let glyph = "";
  for (const char of text) {
    const codePoint = char.codePointAt(0)!;
    if (char === " " || Language.ZH_TW.includes(codePoint)) {
      const last = spans.at(-1);
      if (glyph !== "") {
        spans.push({ text: char, glyph });
        glyph = "";
      } else if (
        last != null &&
        // The syllable of a Hanzi ends with a tone mark or a first tone space.
        (char === " " || last.glyph == null || /[ㄅ-ㄩ]$/u.test(last.text))
      ) {
        last.text += char;
      } else {
        spans.push({ text: char });
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

/**
 * Removes the punctuation of a Zhuyin text, both typed and displayed, and the
 * first tone space before a final one, which the next word types instead.
 */
export function removePunctuation(text: string): string {
  return text.replace(/\p{P}/gu, "").trimEnd();
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

import { Enum, type EnumItem } from "@keybr/lang";
import { type CodePoint, toCodePoints } from "@keybr/unicode";

export class Language implements EnumItem {
  static readonly EN = new Language(
    /* id= */ "en",
    /* script= */ "latin",
    /* direction= */ "ltr",
    /* alphabet= */ "abcdefghijklmnopqrstuvwxyz",
  );
  static readonly ZH_TW = new Language(
    /* id= */ "zh-TW",
    /* script= */ "bopomofo",
    /* direction= */ "ltr",
    // The first tone has no mark, it is typed with the space bar.
    /* alphabet= */ "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦˊˇˋ˙",
  );

  static readonly ALL = new Enum<Language>(Language.EN, Language.ZH_TW);

  /** ISO 639-1 language code, https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes */
  readonly id: string;
  /** The writing system, either Latin or Bopomofo. */
  readonly script: "bopomofo" | "latin";
  /** The direction of the writing system, either "ltr" for left-to-right, or "rtl" for right-to-left. */
  readonly direction: "ltr" | "rtl";
  /** The list of alphabet code points. */
  readonly alphabet: readonly CodePoint[];
  /** The locale. */
  readonly locale: Intl.Locale;
  /** The collator for sorting strings. */
  readonly collator: Intl.Collator;
  /** A locale-sensitive string comparison function. */
  readonly compare: (a: string, b: string) => number;
  /** A locale-sensitive string uppercase function. */
  readonly upperCase: (v: string) => string;
  /** A locale-sensitive string lowercase function. */
  readonly lowerCase: (v: string) => string;
  /** A locale-sensitive string capitalize function. */
  readonly capitalCase: (v: string) => string;

  private constructor(
    id: string,
    script: "bopomofo" | "latin",
    direction: "ltr" | "rtl",
    alphabet: string,
  ) {
    const locale = new Intl.Locale(id).maximize();
    const collator = new Intl.Collator(locale);
    this.id = id;
    this.script = script;
    this.direction = direction;
    this.alphabet = Object.freeze([...toCodePoints(alphabet)]);
    this.locale = locale;
    this.collator = collator;
    this.compare = (a, b) => collator.compare(a, b);
    this.upperCase = (v) => v.toLocaleUpperCase(locale);
    this.lowerCase = (v) => v.toLocaleLowerCase(locale);
    this.capitalCase = (v) =>
      v.substring(0, 1).toLocaleUpperCase(locale) +
      v.substring(1).toLocaleLowerCase(locale);
    Object.freeze(this);
  }

  /**
   * Checks whether the given string is composed only of the language letters,
   * case-insensitive.
   */
  test = (v: string): boolean => {
    for (const codePoint of toCodePoints(this.lowerCase(v))) {
      if (!this.alphabet.includes(codePoint)) {
        return false;
      }
    }
    return true;
  };

  letterName = (codePoint: CodePoint): string => {
    // Locale-specific uppercase variant of a letter.
    // For example in Turkish there are dotted and dotless letter I,
    // each with its own lower and uppercase variant.
    return this.upperCase(String.fromCodePoint(codePoint));
  };

  /**
   * Returns a value indicating whether the given code point
   * can be a letter of this language.
   */
  includes(codePoint: CodePoint): boolean {
    // We consider these Unicode ranges to contain letters only in a given script.
    // The ranges were manually built from Unicode tables and may not be accurate.
    switch (this.script) {
      case "bopomofo":
        // The tone marks live in the Spacing Modifier Letters block.
        return (
          (codePoint >= 0x3100 && codePoint <= 0x312f) ||
          codePoint === /* "ˊ" */ 0x02ca ||
          codePoint === /* "ˇ" */ 0x02c7 ||
          codePoint === /* "ˋ" */ 0x02cb ||
          codePoint === /* "˙" */ 0x02d9
        );
      case "latin":
        // A few Unicode blocks of the Latin script to include only
        // a reasonable list of letter codepoints.
        return (
          (codePoint >= /* "A" */ 0x0041 && codePoint <= /* "Z" */ 0x005a) ||
          (codePoint >= /* "a" */ 0x0061 && codePoint <= /* "z" */ 0x007a) ||
          (codePoint >= /* "À" */ 0x00c0 && codePoint <= /* "Ö" */ 0x00d6) ||
          (codePoint >= /* "Ø" */ 0x00d8 && codePoint <= /* "ö" */ 0x00f6) ||
          (codePoint >= /* "ø" */ 0x00f8 && codePoint <= /* "ÿ" */ 0x00ff) ||
          (codePoint >= /* "Ā" */ 0x0100 && codePoint <= /* "ſ" */ 0x017f) ||
          (codePoint >= /* "ƀ" */ 0x0180 && codePoint <= /* "ɏ" */ 0x024f)
        );
      default:
        return false;
    }
  }

  toString() {
    return this.id;
  }

  toJSON() {
    return this.id;
  }
}

export function getExampleText({ script }: Language): string {
  switch (script) {
    case "bopomofo":
      return "ㄉㄨㄛ ㄔ ㄆㄧㄥˊㄍㄨㄛˇㄍㄣ ㄌㄧㄡˇㄉㄧㄥ";
    case "latin":
      return "Eat more apples and oranges.";
  }
}

export function getExampleLetters({ script }: Language): CodePoint[] {
  switch (script) {
    case "bopomofo":
      return [0x3105, 0x3106, 0x3107, 0x3108, 0x3109, 0x310a];
    case "latin":
      return [0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066];
  }
}

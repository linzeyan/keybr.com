import { type Language, type Ngram1, type Ngram2 } from "@keybr/keyboard";
import { randomSample, type RNG, weightedRandomSample } from "@keybr/rand";
import { type CodePoint, type CodePointSet } from "@keybr/unicode";
import { type Filter } from "./filter.ts";
import { Letter } from "./letter.ts";
import { TransitionTable } from "./transitiontable.ts";

const prefixLength = 3;

/**
 * Returns the length limits of the generated words.
 *
 * Zhuyin words are keystroke chunks which end with a first tone syllable,
 * as the first tone is typed with the space bar. A chunk can be a single
 * letter like "ㄧ", or span several syllables like "ㄏㄣˇㄏㄠˇㄉㄜ˙ㄖㄣˊ".
 */
export function wordLength({ script }: Language): {
  readonly min: number;
  readonly max: number;
} {
  // ponytail: max 20 covers 75% of the chunks, the rest is cut for readability.
  return script === "bopomofo" ? { min: 1, max: 20 } : { min: 3, max: 10 };
}

export abstract class PhoneticModel {
  constructor(
    readonly language: Language,
    readonly letters: readonly Letter[],
  ) {}

  abstract nextWord(filter: Filter, random?: RNG): string;

  abstract ngram1(): Ngram1;

  abstract ngram2(): Ngram2;

  static restrict(
    model: PhoneticModel,
    codePoints: CodePointSet,
  ): PhoneticModel {
    return new (class extends PhoneticModel {
      constructor() {
        super(model.language, Letter.restrict(model.letters, codePoints));
      }

      override nextWord(filter: Filter, random?: RNG): string {
        return model.nextWord(filter, random);
      }

      override ngram1(): Ngram1 {
        return model.ngram1();
      }

      override ngram2(): Ngram2 {
        return model.ngram2();
      }
    })();
  }
}

export namespace PhoneticModel {
  export type Loader = {
    (language: Language): Promise<PhoneticModel>;
  };
}

export function makePhoneticModel(
  language: Language,
  data: TransitionTable | Uint8Array,
): PhoneticModel {
  const table =
    data instanceof TransitionTable ? data : TransitionTable.load(data);
  const letters = Letter.normalize(
    table.letters(language).filter(({ codePoint }) => codePoint !== 0x0020),
  );
  const prefixList = new PrefixList(table);
  const { min: minLength, max: maxLength } = wordLength(language);

  const nextWord = (filter: Filter, random: RNG): CodePoint[] => {
    const prefixes = prefixList.findPrefixes(filter);
    const word: CodePoint[] = [];
    let attempt = 0;

    const retry = (): boolean => {
      if (attempt < 5) {
        attempt++;
        word.length = 0;
        if (prefixes.length > 0) {
          word.push(...randomSample(prefixes, random).codePoints);
        }
        return true;
      } else {
        return false;
      }
    };

    retry();

    while (true) {
      const entries = table
        .segment(word)
        .filter(({ codePoint }) => {
          if (codePoint === 0x0020) {
            if (word.length < minLength) {
              // Remove the space character if the word is still too short.
              return false;
            }
          } else {
            if (!filter.includes(codePoint)) {
              // Remove a letter if it does not match the filter.
              return false;
            }
          }
          return true;
        })
        .map(({ codePoint, frequency }) => {
          if (codePoint === 0x0020) {
            // Boost the space character to generate shorter words.
            frequency = frequency * Math.pow(1.3, word.length);
          }
          return { codePoint, frequency };
        });

      if (entries.length === 0) {
        // Cannot continue a word from this prefix.
        if (retry()) {
          continue;
        } else {
          return word;
        }
      }

      const entry = weightedRandomSample(
        entries,
        ({ frequency }) => frequency,
        random,
      );
      if (entry.codePoint === 0x0020) {
        // A whole word was generated.
        return word;
      }

      if (word.length > maxLength) {
        // A word is too long already.
        if (retry()) {
          continue;
        } else {
          return word;
        }
      }

      word.push(entry.codePoint);
    }
  };

  return new (class extends PhoneticModel {
    constructor() {
      super(language, letters);
    }

    override nextWord(filter: Filter, random: RNG = Math.random): string {
      return String.fromCodePoint(...nextWord(filter, random));
    }

    override ngram1(): Ngram1 {
      return table.toNgram1();
    }

    override ngram2(): Ngram2 {
      return table.toNgram2();
    }
  })();
}

class Prefix {
  constructor(readonly codePoints: readonly CodePoint[]) {}

  matches(filter: Filter): boolean {
    return this.codePoints.every((codePoint) => filter.includes(codePoint));
  }
}

class PrefixList {
  readonly table: TransitionTable;
  readonly map: Map<CodePoint, Prefix[]>;

  constructor(table: TransitionTable) {
    this.table = table;
    this.map = new Map<CodePoint, Prefix[]>(
      table.alphabet.map((codePoint) => [codePoint, []]),
    );

    const walk = (word: CodePoint[]): void => {
      for (const { codePoint } of this.table.segment(word)) {
        if (codePoint !== 0x0020) {
          word.push(codePoint);

          const prefix = new Prefix([...word]);
          for (const index of new Set(word)) {
            this.map.get(codePoint)!.push(prefix);
          }

          // Deep enough for a focused tone mark to end a prefix such as
          // "ㄧㄠˋ", a word cannot start with a tone mark.
          if (word.length < prefixLength) {
            walk(word);
          }

          word.pop();
        }
      }
    };

    walk([]);
  }

  findPrefixes(filter: Filter): Prefix[] {
    const { focusedCodePoint } = filter;
    if (focusedCodePoint != null) {
      const prefixes = this.map
        .get(focusedCodePoint)!
        .filter((prefix) => prefix.matches(filter));
      if (prefixes.length > 0) {
        return prefixes;
      } else {
        return [new Prefix([focusedCodePoint])];
      }
    } else {
      return [];
    }
  }
}

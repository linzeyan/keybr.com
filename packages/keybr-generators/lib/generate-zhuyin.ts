#!/usr/bin/env -S npx tsnode

/**
 * This script builds the Taiwanese Mandarin dictionary and word list from the
 * data of the McBopomofo input method, https://github.com/openvanilla/McBopomofo
 * (MIT License).
 *
 * The dictionary lists keystroke chunks of the Dachen (大千) layout rather than
 * words. The first tone is typed with the space bar, which is also our word
 * separator, while the other tones have their own keys and are immediately
 * followed by the next syllable. To make every space in a lesson a real first
 * tone keystroke, we sample phrases by their corpus frequencies into one
 * continuous keystroke stream, and then split the stream at the spaces.
 *
 * The word list holds real phrases instead, so a first tone syllable inside
 * of a phrase keeps its space, as in "ㄐㄧㄣ ㄊㄧㄢ" for "今天".
 *
 * The readings of every character and corpus phrase let the browser read the
 * Hanzi of a custom text, and are used here to read the books. A book pairs
 * every Hanzi with its keystrokes, as in "我ㄨㄛˇ們ㄇㄣ˙", so that the Hanzi
 * are displayed while their keys are typed. A punctuation is typed with the
 * keys of the input method of the user. Where the phrases read a Hanzi of a
 * book wrong, its reading follows it in the book source, as in "從茲ㄗ".
 *
 * McBopomofo maps keys to Hanzi, so it accepts several readings of a phrase in
 * no particular order, like the colloquial "ㄗㄜˇ ㄇㄛ˙" of "怎麼". We pick the
 * standard reading of every phrase, and pronounce "一" and "不" with their
 * tone sandhi.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { Language } from "@keybr/keyboard";
import { XorShift128Plus } from "@keybr/rand";
import { phraseScale, sandhi, toneOf, ZhuyinReader } from "@keybr/zhuyin";
import chalk from "chalk";
import { sortByCount, toCsv, type Word } from "./language/words.ts";
import { pathTo } from "./root.ts";

// Pinned to make the output reproducible.
const commit = "a5ad2e94a173d6721b9d52e60f4d0266251a76ba";
const sampleSize = 3_000_000;
const language = Language.ZH_TW;
const toneMarks = new Set(["ˊ", "ˇ", "ˋ", "˙"]);
// The rare characters of the books missing in McBopomofo are read like a
// common one, with their Unihan reading, or with the reading of the character
// they stand for in the book when Unihan has none ("𧈢蜡" and "𤟹狨").
const readAs = new Map([
  ["猹", "查"],
  ["嗬", "呵"],
  ["唣", "皂"],
  ["䯼", "敵"],
  ["𡤫", "掐"],
  ["𤛮", "勞"],
  ["𤜱", "巴"],
  ["𧈢", "蚱"],
  ["𤟹", "禺"],
]);
// The pronunciation of the characters that McBopomofo prefers to type in
// another way, like the particles with the first tone.
const standardReadings = new Map([
  ["了", "ㄌㄜ˙"],
  ["們", "ㄇㄣ˙"],
  ["呢", "ㄋㄜ˙"],
  ["嗎", "ㄇㄚ˙"],
  ["吧", "ㄅㄚ˙"],
  ["啊", "ㄚ˙"],
  ["呀", "ㄧㄚ˙"],
  ["哩", "ㄌㄧ˙"],
  ["啦", "ㄌㄚ˙"],
  ["嘛", "ㄇㄚ˙"],
  ["咧", "ㄌㄧㄝ˙"],
  ["咱", "ㄗㄢˊ"],
  ["哦", "ㄛˊ"],
]);
// The colloquial readings that McBopomofo accepts, as in "怎麼" and "那時".
const colloquial = new Set([
  "麼ㄇㄛ˙",
  "麼ㄇㄛˊ",
  "那ㄋㄚˇ",
  "那ㄋㄟˋ",
  "這ㄓㄟˋ",
  "哪ㄋㄟˇ",
  "較ㄐㄧㄠˇ",
]);
// The variant readings that some phrases of McBopomofo have only, as in
// "怎的" and "波心", replaced by the standard ones. The erhua "兒" is typed
// with its own tone in every input method.
const variants = new Map([
  ["怎ㄗㄜˇ", "ㄗㄣˇ"],
  ["什ㄕㄣˊ", "ㄕㄜˊ"],
  ["甚ㄕㄣˊ", "ㄕㄜˊ"],
  ["波ㄆㄛ", "ㄅㄛ"],
  ["兒ㄦ", "ㄦˊ"],
]);
const books = [
  "zh-tw-baihua",
  "zh-tw-nahan",
  "zh-tw-panghuang",
  "zh-tw-zhaohua",
  "zh-tw-xinshi",
  "zh-tw-classics",
];

const [base, heterophony, mappings, occ] = await Promise.all(
  ["BPMFBase.txt", "heterophony1.list", "BPMFMappings.txt", "phrase.occ"].map(
    fetchData,
  ),
);

// A polyphonic character is read in its most common way only,
// otherwise the rare readings of "的" would be as frequent as "ㄉㄜ˙".
const primaryReadings = new Map<string, string>(standardReadings);
for (const [char, reading] of rows(heterophony)) {
  if (!primaryReadings.has(char)) {
    primaryReadings.set(char, reading);
  }
}
const phraseReadings = new Map<string, string[]>();
for (const [phrase, ...syllables] of rows(mappings)) {
  push(phraseReadings, phrase, syllables.join(" "));
}
const occCounts = new Map<string, number>();
for (const [phrase, count] of rows(occ)) {
  if (/^\p{Script=Han}+$/u.test(phrase)) {
    occCounts.set(phrase, Number(count));
  }
}
// The phrases with a single reading tell how often a character is read in
// each way, otherwise "放" would be read "ㄈㄤˇ", but a neutral tone is read
// in a phrase only, as in "東西". Then the readings of the original Big5
// dictionary come first, the later ones are mostly colloquial, like "ㄓㄟˋ"
// for "這".
const usage = new Map<string, number>();
for (const [phrase, count] of occCounts) {
  const readings = phraseReadings.get(phrase);
  if (readings?.length === 1) {
    const syllables = readings[0].split(" ");
    [...phrase].forEach((char, i) => {
      const key = char + syllables[i];
      usage.set(key, (usage.get(key) ?? 0) + count);
    });
  }
}
const charReadings = new Map<string, string[]>();
for (const [char, reading] of rows(base).sort(
  (a, b) => Number(a[4] !== "big5") - Number(b[4] !== "big5"),
)) {
  push(charReadings, char, reading);
}
const usageOf = (char: string, reading: string) =>
  reading.endsWith("˙") ? -1 : (usage.get(char + reading) ?? 0);
for (const [char, readings] of charReadings) {
  readings.sort((a, b) => usageOf(char, b) - usageOf(char, a));
}

let occNorm = 0;
const phrases: { readonly keys: string; readonly count: number }[] = [];
for (const [phrase, count] of occCounts) {
  occNorm += phraseScale(phrase) * count;
  const reading = readingOf(phrase);
  if (reading != null) {
    phrases.push({ keys: toKeystrokes(reading), count });
  }
}

const cumulative = new Float64Array(phrases.length);
let total = 0;
for (let i = 0; i < phrases.length; i++) {
  cumulative[i] = total += phrases[i].count;
}

// Not LCG, its period is too short for millions of samples.
const random = XorShift128Plus(1);
const counts = new Map<string, number>();
let chunk = "";
for (let n = 0; n < sampleSize; n++) {
  for (const char of phrases[search(random() * total)].keys) {
    if (char === " ") {
      counts.set(chunk, (counts.get(chunk) ?? 0) + 1);
      chunk = "";
    } else {
      chunk += char;
    }
  }
}

const dict: Word[] = sortByCount(language, [...counts]);
printStats(dict);
writeFileSync(
  pathTo(`dictionaries/dictionary-${language.id}.csv.gz`),
  gzipSync(toCsv(dict)),
);

// Homophones like "是" and "事" become the same word.
const words = new Set<string>();
for (const { keys } of [...phrases].sort((a, b) => b.count - a.count)) {
  if (words.size === 10000) {
    break;
  }
  words.add(keys.trimEnd());
}
writeFileSync(
  pathTo(`../keybr-content-words/lib/data/words-${language.id}.json`),
  JSON.stringify([...words], null, 2),
);
console.log(`[${language.id}] Generated word list (${words.size} words)`);

// A rare character still has a reading, a phrase must be in the corpus.
const readingLines: string[] = [];
const addReading = (phrase: string, reading: string, count: number) => {
  const keys = toKeystrokes(reading);
  // The reader splits the keys at the tone marks and first tone spaces.
  if (!/^([^ˊˇˋ˙ ]+[ˊˇˋ˙ ])+$/u.test(keys)) {
    throw new Error(`Bad reading "${reading}" of "${phrase}"`);
  }
  readingLines.push(`${phrase}\t${keys}\t${count}`);
};
for (const char of new Set([
  ...primaryReadings.keys(),
  ...charReadings.keys(),
])) {
  const reading = readingOf(char);
  if (/^\p{Script=Han}$/u.test(char) && reading != null) {
    addReading(char, reading, occCounts.get(char) ?? 0);
  }
}
for (const [char, as] of readAs) {
  addReading(char, readingOf(as)!, 0);
}
for (const [phrase, count] of occCounts) {
  const length = [...phrase].length;
  const reading = readingOf(phrase);
  if (length > 1 && reading?.split(" ").length === length) {
    addReading(phrase, reading, count);
  }
}
const readings = { norm: occNorm, phrases: readingLines.join("\n") };
writeFileSync(
  pathTo("../keybr-zhuyin/lib/data/readings.json"),
  JSON.stringify(readings, null, 2),
);
console.log(`[${language.id}] Generated ${readingLines.length} readings`);

// Chapter titles stay in Hanzi, only the paragraphs are typed.
const reader = new ZhuyinReader(readings);
for (const id of books) {
  const book: [string, string[]][] = [];
  for (const line of readFileSync(pathTo(`books/${id}.txt`), "utf-8")
    .split("\n")
    .filter((line) => line !== "")) {
    if (line.startsWith("# ")) {
      book.push([line.slice(2), []]);
    } else {
      book.at(-1)![1].push(toGlyphs(line));
    }
  }
  writeFileSync(
    pathTo(`../keybr-content-books/lib/data/${id}.json`),
    JSON.stringify(book, null, 2),
  );
  console.log(
    `[${language.id}] Generated book ${id} (${book.length} chapters)`,
  );
}

/**
 * Returns the standard reading of a phrase, as in "ㄧˊ ㄍㄜ˙" for "一個".
 * The "一" and "不" ending a phrase keep their tone, the reader changes them
 * by the next phrase.
 */
function readingOf(phrase: string): string | undefined {
  const chars = [...phrase];
  const primary = primaryReadings.get(phrase);
  const readings = (
    (chars.length > 1
      ? phraseReadings.get(phrase)
      : primary != null
        ? [primary]
        : charReadings.get(phrase)) ?? []
  )
    .filter((reading) => language.test(reading.replaceAll(" ", "")))
    .map((reading) => reading.split(" "));
  if (readings.length === 0) {
    return undefined;
  }
  // A colloquial reading is the last resort. The neutral tone is the
  // standard one where the other readings differ by its tone only, as in
  // "他們" and "意思".
  const letters = (syllable: string) => syllable.replace(/[ˊˇˋ˙]$/u, "");
  const score = (syllables: readonly string[]) =>
    syllables.reduce(
      (score, syllable, i) =>
        colloquial.has(chars[i] + syllable)
          ? score - 2
          : syllable.endsWith("˙") &&
              readings.some(
                (other) =>
                  other[i] !== syllable &&
                  letters(other[i]) === letters(syllable),
              )
            ? score + 1
            : score,
      0,
    );
  const syllables = (
    chars.length > 1
      ? readings.reduce((a, b) => (score(b) > score(a) ? b : a))
      : readings[0]
  ).map((syllable, i) => variants.get(chars[i] + syllable) ?? syllable);
  for (let i = chars.length - 1; i >= 0; i--) {
    syllables[i] =
      sandhi(chars, i, baseTone(chars[i + 1], syllables[i + 1]))?.trimEnd() ??
      syllables[i];
  }
  return syllables.join(" ");
}

/**
 * Returns the tone of a syllable, or the tone of a neutral tone syllable when
 * stressed, which decides the sandhi of "一" in "一個".
 */
function baseTone(char: string | undefined, syllable: string | undefined) {
  if (char == null || syllable == null) {
    return 0;
  }
  const reading = syllable.endsWith("˙")
    ? charReadings
        .get(char)
        ?.find(
          (reading) =>
            !reading.endsWith("˙") &&
            reading.replace(/[ˊˇˋ]$/u, "") === syllable.slice(0, -1),
        )
    : syllable;
  return reading != null ? toneOf(toKeystrokes(reading)) : 0;
}

/**
 * Pairs every Hanzi of a book with its keys. A punctuation stays as it is,
 * so it is typed after the space of a preceding first tone, as in "親ㄑㄧㄣ 。".
 */
function toGlyphs(text: string): string {
  // A space is a key, the words of a Latin title like "Sesame and Lilies"
  // are only displayed.
  text = text.replace(/(?<=[A-Za-z]) (?=[A-Za-z])/g, "\u00a0");
  if (text.includes(" ")) {
    throw new Error(`A space in "${text}"`);
  }
  // The reading following a Hanzi, as in "從茲ㄗ", wins over its phrases.
  let plain = "";
  const forced = new Map<number, string>();
  for (const part of text.split(/(\p{Script=Bopomofo}+[ˊˇˋ˙]?)/u)) {
    if (/^\p{Script=Bopomofo}/u.test(part)) {
      const char = [...plain].at(-1) ?? "";
      if (!/^\p{Script=Han}$/u.test(char) || !language.test(part)) {
        throw new Error(`Bad reading "${part}" in "${text}"`);
      }
      forced.set(plain.length - char.length, toKeystrokes(part));
    } else {
      plain += part;
    }
  }
  const glyphs = reader.toGlyphs(plain, forced);
  // Every syllable starts with a letter, a Hanzi without one has no reading.
  const unread = /\p{Script=Han}(?!\p{Script=Bopomofo})/u.exec(glyphs);
  if (unread != null) {
    throw new Error(`No reading for "${unread[0]}" in "${text}"`);
  }
  return glyphs;
}

function toKeystrokes(reading: string): string {
  return reading
    .split(" ")
    .map((syllable) =>
      toneMarks.has(syllable.at(-1)!) ? syllable : `${syllable} `,
    )
    .join("");
}

/** Finds the first phrase whose cumulative count exceeds the given value. */
function search(value: number): number {
  let lo = 0;
  let hi = cumulative.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cumulative[mid] > value) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}

function printStats(dict: readonly Word[]): void {
  const sum = (list: readonly Word[], f: (word: Word) => number) =>
    list.reduce((acc, word) => acc + f(word), 0);
  const tokens = sum(dict, ([, count]) => count);
  const chars = sum(dict, ([word, count]) => word.length * count);
  const top = dict.slice(0, 10000);
  const pct = (a: number, b: number) => `${((a / b) * 100).toFixed(1)}%`;
  console.log(`[${language.id}] ${phrases.length} phrase readings`);
  console.log(`[${language.id}] ${dict.length} unique chunks, ${tokens} total`);
  console.log(
    `[${language.id}] mean chunk length ${(chars / tokens).toFixed(2)}`,
  );
  for (const [min, max] of [
    [1, 2],
    [3, 10],
    [11, Infinity],
  ]) {
    const n = sum(dict, ([word, count]) =>
      word.length >= min && word.length <= max ? count : 0,
    );
    console.log(`[${language.id}] length ${min}..${max}: ${pct(n, tokens)}`);
  }
  console.log(
    chalk.green(
      `[${language.id}] top 10000 chunks cover ${pct(
        sum(top, ([, count]) => count),
        tokens,
      )} of chunks, ` +
        `${pct(
          sum(top, ([word, count]) => word.length * count),
          chars,
        )} of keystrokes`,
    ),
  );
}

async function fetchData(name: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/openvanilla/McBopomofo/${commit}/Source/Data/${name}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`);
  }
  return await response.text();
}

function rows(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"))
    .map((line) => line.split(/\s+/));
}

function push(map: Map<string, string[]>, key: string, value: string): void {
  const list = map.get(key);
  if (list == null) {
    map.set(key, [value]);
  } else if (!list.includes(value)) {
    list.push(value);
  }
}

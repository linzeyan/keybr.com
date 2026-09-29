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
 * are displayed while their keys are typed. A punctuation is typed with its
 * own key of the layout, like in McBopomofo.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { Language } from "@keybr/keyboard";
import { XorShift128Plus } from "@keybr/rand";
import { phraseScale, ZhuyinReader } from "@keybr/zhuyin";
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
const primaryReadings = new Map<string, string[]>();
for (const [char, reading] of rows(heterophony)) {
  if (!primaryReadings.has(char)) {
    primaryReadings.set(char, [reading]);
  }
}
// The readings of the original Big5 dictionary come first, the later ones
// are mostly colloquial, like "ㄓㄟˋ" for "這".
const charReadings = new Map<string, string[]>();
for (const [char, reading] of rows(base).sort(
  (a, b) => Number(a[4] !== "big5") - Number(b[4] !== "big5"),
)) {
  push(charReadings, char, reading);
}
const phraseReadings = new Map<string, string[]>();
for (const [phrase, ...syllables] of rows(mappings)) {
  push(phraseReadings, phrase, syllables.join(" "));
}

const occCounts = new Map<string, number>();
let occNorm = 0;
const phrases: { readonly keys: readonly string[]; readonly count: number }[] =
  [];
for (const [phrase, count] of rows(occ)) {
  if (!/^\p{Script=Han}+$/u.test(phrase)) {
    continue;
  }
  occCounts.set(phrase, Number(count));
  occNorm += phraseScale(phrase) * Number(count);
  const readings = readingsOf(phrase);
  if (readings.length === 0) {
    continue;
  }
  phrases.push({ keys: readings.map(toKeystrokes), count: Number(count) });
}

// Phrase readings differ mostly by the tone sandhi of "一" and "不",
// or by an optional neutral tone, so they share the phrase frequency.
const units: { readonly keys: string; readonly weight: number }[] = [];
for (const { keys, count } of phrases) {
  for (const key of keys) {
    units.push({ keys: key, weight: count / keys.length });
  }
}

const cumulative = new Float64Array(units.length);
let total = 0;
for (let i = 0; i < units.length; i++) {
  cumulative[i] = total += units[i].weight;
}

// Not LCG, its period is too short for millions of samples.
const random = XorShift128Plus(1);
const counts = new Map<string, number>();
let chunk = "";
for (let n = 0; n < sampleSize; n++) {
  for (const char of units[search(random() * total)].keys) {
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

// Homophones like "是" and "事" become the same word, and a phrase with
// several readings contributes its first one only.
const words = new Set<string>();
for (const { keys } of [...phrases].sort((a, b) => b.count - a.count)) {
  if (words.size === 10000) {
    break;
  }
  words.add(keys[0].trimEnd());
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
  const reading = readingsOf(char)[0];
  if (/^\p{Script=Han}$/u.test(char) && reading != null) {
    addReading(char, reading, occCounts.get(char) ?? 0);
  }
}
for (const [char, as] of readAs) {
  addReading(char, readingsOf(as)[0], 0);
}
for (const [phrase, count] of occCounts) {
  const length = [...phrase].length;
  const reading = readingsOf(phrase)[0];
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

function readingsOf(phrase: string): string[] {
  return (
    ([...phrase].length === 1
      ? (primaryReadings.get(phrase) ?? charReadings.get(phrase))
      : phraseReadings.get(phrase)) ?? []
  ).filter((reading) => language.test(reading.replaceAll(" ", "")));
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
  const glyphs = reader.toGlyphs(text);
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

/** Finds the first unit whose cumulative weight exceeds the given value. */
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
  console.log(`[${language.id}] ${units.length} phrase readings`);
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

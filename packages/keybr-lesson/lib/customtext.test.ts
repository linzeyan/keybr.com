import { describe, it, test } from "node:test";
import { Language, Layout, loadKeyboard } from "@keybr/keyboard";
import { FakePhoneticModel } from "@keybr/phonetic-model";
import { loadModelSync } from "@keybr/phonetic-model/lib/fs-load.ts";
import { FakeRNGStream } from "@keybr/rand";
import { makeKeyStatsMap } from "@keybr/result";
import { Settings } from "@keybr/settings";
import { ZhuyinReader } from "@keybr/zhuyin";
import { deepEqual, equal, isNull, match } from "rich-assert";
import { CustomTextLesson } from "./customtext.ts";
import { LessonKey } from "./key.ts";
import { lessonProps } from "./settings.ts";

test("provide key set", () => {
  const settings = new Settings();
  const keyboard = loadKeyboard(Layout.EN_US);
  const model = new FakePhoneticModel();
  const lesson = new CustomTextLesson(settings, keyboard, model);
  const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

  deepEqual(lessonKeys.findIncludedKeys(), [
    new LessonKey({
      letter: FakePhoneticModel.letter1,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter2,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter3,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter4,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter5,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter6,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter7,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter8,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter9,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
    new LessonKey({
      letter: FakePhoneticModel.letter10,
      samples: [],
      timeToType: null,
      bestTimeToType: null,
      confidence: null,
      bestConfidence: null,
      isIncluded: true,
      isFocused: false,
      isForced: false,
    }),
  ]);
  deepEqual(lessonKeys.findExcludedKeys(), []);
  isNull(lessonKeys.findFocusedKey());
});

test("generate text with empty settings", () => {
  const settings = new Settings().set(lessonProps.customText.content, "");
  const keyboard = loadKeyboard(Layout.EN_US);
  const model = new FakePhoneticModel();
  const lesson = new CustomTextLesson(settings, keyboard, model);
  const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

  equal(
    lesson.generate(lessonKeys, model.rng),
    "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ? " +
      "? ? ? ? ? ? ? ? ? ?",
  );
});

describe("generate text using settings", () => {
  const keyboard = loadKeyboard(Layout.EN_US);

  it("should transform to lower case", () => {
    const settings = new Settings()
      .set(lessonProps.customText.content, "Abc! Def? 123")
      .set(lessonProps.customText.lowercase, true)
      .set(lessonProps.customText.lettersOnly, true)
      .set(lessonProps.customText.randomize, false);
    const model = new FakePhoneticModel();
    const lesson = new CustomTextLesson(settings, keyboard, model);
    const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

    equal(
      lesson.generate(lessonKeys, model.rng),
      "abc def abc def abc def abc def abc def abc def abc def abc def abc " +
        "def abc def abc def abc def abc def abc def abc def abc def abc def",
    );
  });

  it("should preserve case", () => {
    const settings = new Settings()
      .set(lessonProps.customText.content, "Abc! Def? 123")
      .set(lessonProps.customText.lowercase, false)
      .set(lessonProps.customText.lettersOnly, false)
      .set(lessonProps.customText.randomize, false);
    const model = new FakePhoneticModel();
    const lesson = new CustomTextLesson(settings, keyboard, model);
    const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

    equal(
      lesson.generate(lessonKeys, model.rng),
      "Abc! Def? 123 Abc! Def? 123 Abc! Def? 123 Abc! Def? 123 Abc! Def? 123 " +
        "Abc! Def? 123 Abc! Def? 123 Abc! Def? 123 Abc! Def? 123 Abc!",
    );
  });
});

describe("generate randomized text using settings", () => {
  const keyboard = loadKeyboard(Layout.EN_US);

  it("should transform to lower case", () => {
    const settings = new Settings()
      .set(
        lessonProps.customText.content,
        "Abc! Def? 123 AAA aaa BBB bbb CCC ccc",
      )
      .set(lessonProps.customText.lowercase, true)
      .set(lessonProps.customText.lettersOnly, true)
      .set(lessonProps.customText.randomize, true);
    const model = new FakePhoneticModel();
    const lesson = new CustomTextLesson(settings, keyboard, model);
    const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

    equal(
      lesson.generate(lessonKeys, model.rng),
      "abc aaa bbb abc aaa bbb abc aaa bbb abc aaa bbb abc aaa bbb abc aaa " +
        "bbb abc aaa bbb abc aaa bbb abc aaa bbb abc aaa bbb abc aaa bbb abc",
    );
  });

  it("should preserve case", () => {
    const settings = new Settings()
      .set(
        lessonProps.customText.content,
        "Abc! Def? 123 AAA aaa BBB bbb CCC ccc",
      )
      .set(lessonProps.customText.lowercase, false)
      .set(lessonProps.customText.lettersOnly, false)
      .set(lessonProps.customText.randomize, true);
    const model = new FakePhoneticModel();
    const lesson = new CustomTextLesson(settings, keyboard, model);
    const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

    equal(
      lesson.generate(lessonKeys, model.rng),
      "Abc! AAA bbb Abc! AAA bbb Abc! AAA bbb Abc! AAA bbb Abc! AAA bbb Abc! " +
        "AAA bbb Abc! AAA bbb Abc! AAA bbb Abc! AAA bbb Abc! AAA bbb",
    );
  });
});

describe("generate zhuyin text", () => {
  const keyboard = loadKeyboard(Layout.ZH_TW_DACHEN);
  const { model } = loadModelSync(Language.ZH_TW);
  const rng = FakeRNGStream(1);
  const reader = new ZhuyinReader({
    norm: 1000,
    phrases: [
      "我\tㄨㄛˇ\t9",
      "今\tㄐㄧㄣ \t9",
      "天\tㄊㄧㄢ \t9",
      "好\tㄏㄠˇ\t9",
    ].join("\n"),
  });
  const settings = new Settings()
    .set(lessonProps.customText.content, "我今天好。\n好")
    .set(lessonProps.customText.randomize, false);

  it("should display the hanzi in place of their keys", () => {
    const lesson = new CustomTextLesson(
      settings.set(lessonProps.customText.lettersOnly, false),
      keyboard,
      model,
      reader,
    );
    const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

    // A line break is a word break, the space joining the words types a
    // first tone, or follows another tone.
    deepEqual(lesson.wordList, [
      "我ㄨㄛˇ今ㄐㄧㄣ",
      "天ㄊㄧㄢ",
      "好ㄏㄠˇ。",
      "好ㄏㄠˇ",
    ]);
    deepEqual((lesson.generate(lessonKeys, rng) as unknown[]).slice(0, 6), [
      { text: "ㄨㄛˇ", glyph: "我" },
      { text: "ㄐㄧㄣ ", glyph: "今" },
      { text: "ㄊㄧㄢ ", glyph: "天" },
      { text: "ㄏㄠˇ", glyph: "好" },
      { text: "。 ", glyph: "。" },
      { text: "ㄏㄠˇ ", glyph: "好" },
    ]);
  });

  it("should display the keys without the hanzi", () => {
    const lesson = new CustomTextLesson(
      settings
        .set(lessonProps.customText.lettersOnly, true)
        .set(lessonProps.customText.hanzi, false),
      keyboard,
      model,
      reader,
    );
    const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

    match(
      lesson.generate(lessonKeys, rng) as string,
      /^ㄨㄛˇㄐㄧㄣ ㄊㄧㄢ ㄏㄠˇ ㄏㄠˇ ㄨㄛˇ/u,
    );
  });

  it("should display zhuyin typed in the text", () => {
    const lesson = new CustomTextLesson(
      settings.set(lessonProps.customText.content, "ㄨㄛˇ ㄏㄠˇ"),
      keyboard,
      model,
    );
    const lessonKeys = lesson.update(makeKeyStatsMap(lesson.letters, []));

    // Without a Hanzi, the keys are not hidden behind a glyph.
    const [first] = lesson.generate(lessonKeys, rng) as {
      text: string;
      glyph?: string;
    }[];
    equal(first.text.slice(0, 8), "ㄨㄛˇ ㄏㄠˇ ");
    isNull(first.glyph ?? null);
  });
});

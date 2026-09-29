import { Book } from "@keybr/content";
import { Language } from "@keybr/keyboard";
import { Enum } from "@keybr/lang";
import {
  booleanProp,
  enumProp,
  itemProp,
  numberProp,
  type Settings,
  useSettings,
} from "@keybr/settings";
import {
  type TextDisplaySettings,
  type TextInputSettings,
  toTextDisplaySettings,
  toTextInputSettings,
} from "@keybr/textinput";
import { useMemo } from "react";
import {
  type Duration,
  duration_15_seconds,
  DurationType,
} from "./session/index.ts";

export enum TextSourceType {
  CommonWords = 1,
  PseudoWords = 2,
  Book = 3,
}

export type CommonWordsSource = {
  readonly type: TextSourceType.CommonWords;
  readonly language: Language;
  readonly wordListSize: number;
};

export type PseudoWordsSource = {
  readonly type: TextSourceType.PseudoWords;
  readonly language: Language;
};

export type BookSource = {
  readonly type: TextSourceType.Book;
  readonly book: Book;
  readonly paragraphIndex: number;
  readonly lettersOnly: boolean;
};

export type TextSource = CommonWordsSource | PseudoWordsSource | BookSource;

export const typingTestProps = {
  type: enumProp(
    "typingTest.textSource.type",
    TextSourceType,
    TextSourceType.CommonWords,
  ),
  wordList: {
    wordListSize: numberProp("typingTest.wordList.wordListSize", 1000, {
      min: 10,
      max: 1000,
    }),
  } as const,
  // The typing test is in Zhuyin only, so are its books.
  book: itemProp(
    "typingTest.book",
    new Enum(...Book.forLanguage(Language.ZH_TW)),
    Book.ZH_TW_BAIHUA,
  ),
  bookParagraphIndex: numberProp("typingTest.book.paragraphIndex", 0, {
    min: 0,
    max: 1000,
  }),
  bookLettersOnly: booleanProp("typingTest.book.lettersOnly", false),
  duration: {
    type: enumProp("typingTest.duration.type", DurationType, DurationType.Time),
    value: numberProp("typingTest.duration.value", 0),
  } as const,
} as const;

export function toDuration(settings: Settings): Duration {
  const type = settings.get(typingTestProps.duration.type);
  const value = settings.get(typingTestProps.duration.value);
  if (value === 0) {
    return duration_15_seconds;
  } else {
    return { type, value };
  }
}

export function toTextSource(settings: Settings): TextSource {
  switch (settings.get(typingTestProps.type)) {
    case TextSourceType.CommonWords:
      return {
        type: TextSourceType.CommonWords,
        language: Language.ZH_TW,
        wordListSize: settings.get(typingTestProps.wordList.wordListSize),
      };
    case TextSourceType.PseudoWords:
      return {
        type: TextSourceType.PseudoWords,
        language: Language.ZH_TW,
      };
    case TextSourceType.Book:
      return {
        type: TextSourceType.Book,
        book: settings.get(typingTestProps.book),
        paragraphIndex: settings.get(typingTestProps.bookParagraphIndex),
        lettersOnly: settings.get(typingTestProps.bookLettersOnly),
      };
    default:
      throw new Error();
  }
}

export type CompositeSettings = {
  readonly duration: Duration;
  readonly textSource: TextSource;
  readonly textInput: TextInputSettings;
  readonly textDisplay: TextDisplaySettings;
};

export function toCompositeSettings(settings: Settings): CompositeSettings {
  const duration = toDuration(settings);
  const textSource = toTextSource(settings);
  const textInput = toTextInputSettings(settings);
  const textDisplay = {
    ...toTextDisplaySettings(settings),
    language: languageOf(textSource),
  };
  return {
    duration,
    textSource,
    textInput,
    textDisplay,
  };
}

export function useCompositeSettings(): CompositeSettings {
  const { settings } = useSettings();
  return useMemo(() => toCompositeSettings(settings), [settings]);
}

function languageOf(textSource: TextSource): Language {
  switch (textSource.type) {
    case TextSourceType.CommonWords:
      return textSource.language;
    case TextSourceType.PseudoWords:
      return textSource.language;
    case TextSourceType.Book:
      return textSource.book.language;
  }
}

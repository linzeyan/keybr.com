import { type StyledText } from "@keybr/textinput";

export type TextGenerator<MarkT = unknown> = {
  nextWord(): string;
  mark(): MarkT;
  reset(state: MarkT): void;
  /** Returns the text to type for the given words, the words by default. */
  format?(words: string): StyledText;
};

export type Mark = unknown;

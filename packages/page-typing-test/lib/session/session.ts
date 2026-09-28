import {
  type Feedback,
  splitStyledText,
  type Step,
  type StyledText,
  TextInput,
} from "@keybr/textinput";
import {
  type AnyEvent,
  type IInputEvent,
  type IKeyboardEvent,
} from "@keybr/textinput-events";
import { type TextGenerator } from "../generators/index.ts";
import { computeProgress } from "./duration.ts";
import {
  type Progress,
  type SessionLine,
  type SessionLines,
  type SessionSettings,
} from "./types.ts";

export class Session {
  static readonly emptyLines = {
    text: "",
    lines: [],
  } satisfies SessionLines;
  static readonly emptyProgress = {
    time: 0,
    length: 0,
    progress: 0,
    speed: 0,
  } satisfies Progress;

  /** A list of events to replay. */
  #events: AnyEvent[] = [];
  /** The currently visible lines. */
  #lines!: SessionLine[];
  /** The index of the edited line. */
  #activeLine!: number;
  /** The text input for the edited line. */
  #textInput!: TextInput;
  /** The steps accumulated from all lines. */
  #steps!: Step[];
  /** Generates unique React element keys. */
  #index = 0;
  /** The rest of a word split at the end of the last line. */
  #rest: string | null = null;

  constructor(
    readonly settings: SessionSettings,
    readonly generator: TextGenerator,
  ) {
    this.#lines = [];
    this.#activeLine = 0;
    this.#steps = [];
    while (this.#lines.length < this.settings.numLines) {
      this.#appendLine();
    }
    this.#setActiveLine();
  }

  getEvents(): readonly AnyEvent[] {
    return this.#events;
  }

  getLines(): SessionLines {
    return { text: "", lines: this.#lines };
  }

  getSteps(): readonly Step[] {
    return this.#steps;
  }

  handleKeyDown = (event: IKeyboardEvent) => {
    this.#addEvent(event);
  };

  handleKeyUp = (event: IKeyboardEvent) => {
    this.#addEvent(event);
  };

  handleInput = (
    event: IInputEvent,
  ): {
    feedback: Feedback;
    progress: Progress;
    completed: boolean;
  } => {
    this.#addEvent(event);
    const feedback = this.#textInput.onInput(event);
    const { progress, completed } = computeProgress(
      this.settings.duration,
      this.#steps,
    );
    this.#updateActiveLine(progress);
    if (this.#textInput.completed) {
      if (this.#activeLine < this.#lines.length - 3) {
        this.#activeLine += 1;
      } else {
        this.#lines.shift();
        this.#appendLine();
      }
      this.#setActiveLine();
    }
    return { feedback, progress, completed };
  };

  #addEvent(event: AnyEvent) {
    this.#events.push(event);
  }

  #appendLine() {
    const mark = this.generator.mark();
    const text = this.#generateLine();
    const chars = splitStyledText(this.#format(text));
    const index = (this.#index += 1);
    this.#lines.push({
      mark,
      index,
      text,
      chars,
      progress: null,
    });
  }

  #setActiveLine() {
    const { text } = this.#lines[this.#activeLine];
    this.#textInput = new TextInput(
      this.#format(text),
      this.settings.textInput,
      (step) => {
        this.#steps.push(step);
      },
    );
    this.#updateActiveLine();
  }

  #updateActiveLine(progress: Progress | null = null) {
    const { mark, index, text } = this.#lines[this.#activeLine];
    const { chars } = this.#textInput;
    this.#lines[this.#activeLine] = {
      mark,
      index,
      text,
      chars,
      progress,
    };
  }

  #generateLine() {
    const {
      settings: { numCols },
      generator,
    } = this;
    let line = "";
    let width = 0;
    while (true) {
      const mark = generator.mark();
      const rest = this.#rest;
      const word = rest ?? generator.nextWord();
      this.#rest = null;
      const wordWidth = this.#width(word);
      if (width + wordWidth + 1 > numCols) {
        // A run of Hanzi without a first tone may be wider than a line,
        // it fills the rest of the line and goes on in the next one.
        const split =
          wordWidth + 1 > numCols ? this.#split(word, numCols - width) : 0;
        if (split > 0) {
          line += word.slice(0, split);
          this.#rest = word.slice(split);
          break;
        }
        if (width > 0) {
          if (rest != null) {
            this.#rest = rest;
          } else {
            generator.reset(mark);
          }
          break;
        }
      }
      line += `${word} `;
      width += wordWidth + 1;
    }
    return line;
  }

  /**
   * Returns the longest part of a word that fits the given width, ending
   * before a Hanzi, so a line neither starts with a closing punctuation nor
   * ends with an opening one, or zero if nothing fits.
   */
  #split(word: string, width: number): number {
    let split = 0;
    for (const { index } of word.matchAll(
      /(?<![\p{Ps}\p{Pi}])\p{Script=Han}/gu,
    )) {
      if (this.#width(word.slice(0, index)) > width) {
        break;
      }
      split = index;
    }
    return split;
  }

  #format(words: string): StyledText {
    return this.generator.format?.(words) ?? words;
  }

  #width(word: string): number {
    let width = 0;
    for (const { glyph } of splitStyledText(this.#format(word))) {
      // A glyph like Hanzi is displayed in place of its keys, twice as wide.
      width += glyph == null ? 1 : [...glyph].length * 2;
    }
    return width;
  }
}

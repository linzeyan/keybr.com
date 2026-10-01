import { Enum, type EnumItem } from "@keybr/lang";
import { defineMessage, type MessageDescriptor } from "react-intl";
import { type CharacterDict, type KeyId } from "./types.ts";

/**
 * The punctuation typed with a key, without and with the shift key, and with
 * the control key.
 */
type Punctuation = {
  readonly [id: KeyId]: readonly [
    base: string,
    shift: string,
    ctrl?: string,
    shiftCtrl?: string,
  ];
};

// Most input methods share these keys. A punctuation picked from a list of
// candidates, or typed in pairs by a single key, as in "——" of Rime, has no
// key, it is displayed but not typed in a lesson.
const common: Punctuation = {
  Digit1: ["", "！"],
  Digit9: ["", "（"],
  Digit0: ["", "）"],
  BracketLeft: ["「", "『"],
  BracketRight: ["」", "』"],
  Semicolon: ["", "："],
  Comma: ["", "，"],
  Period: ["", "。"],
  Slash: ["", "？"],
};

/**
 * A Zhuyin input method. They all type the Zhuyin symbols with the same keys
 * of the Dachen (大千) layout, but each one types the punctuation with its own
 * keys, in their default settings.
 */
export class Ime implements EnumItem {
  static readonly MICROSOFT = new Ime(
    "microsoft",
    defineMessage({
      id: "ime.microsoft.name",
      defaultMessage: "Microsoft Bopomofo",
    }),
    {
      // It types the half-width symbols without the control key.
      Digit1: ["", "", "", "！"],
      Semicolon: ["", "", "；", "："],
      Quote: ["", "", "、"],
      Comma: ["", "", "，"],
      Period: ["", "", "。"],
      Slash: ["", "", "", "？"],
    },
  );
  static readonly MACOS = new Ime(
    "macos",
    defineMessage({
      id: "ime.macos.name",
      defaultMessage: "macOS Zhuyin",
    }),
    {
      ...common,
      // The option key of "；" and "—" types no text in a browser.
      Backquote: ["", "～"],
      Backslash: ["、", ""],
    },
  );
  static readonly CHEWING = new Ime(
    "chewing",
    defineMessage({
      id: "ime.chewing.name",
      defaultMessage: "Chewing",
    }),
    {
      ...common,
      Backquote: ["", "～"],
      Minus: ["", "—"],
      Quote: ["、", "；"],
      // The easy symbols, on by default in Windows and IBus.
      KeyZ: ["", "《"],
      KeyX: ["", "》"],
      KeyM: ["", "…"],
    },
  );
  static readonly GOING = new Ime(
    "going",
    defineMessage({
      id: "ime.going.name",
      defaultMessage: "GOING",
    }),
    {
      ...common,
      Backquote: ["", "～"],
      Quote: ["、", "；"],
    },
  );
  static readonly RIME = new Ime(
    "rime",
    defineMessage({
      id: "ime.rime.name",
      defaultMessage: "Rime (Weasel, Squirrel)",
    }),
    {
      ...common,
      Backslash: ["、", ""],
    },
  );
  static readonly MCBOPOMOFO = new Ime(
    "mcbopomofo",
    defineMessage({
      id: "ime.mcbopomofo.name",
      defaultMessage: "McBopomofo",
    }),
    {
      ...common,
      Backquote: ["", "～"],
      Minus: ["", "—"],
      Quote: ["、", "；"],
    },
  );
  static readonly VCHEWING = new Ime(
    "vchewing",
    defineMessage({
      id: "ime.vchewing.name",
      defaultMessage: "vChewing",
    }),
    {
      ...common,
      Backquote: ["", "～"],
      Minus: ["", "—"],
      Quote: ["、", "；"],
      Backslash: ["", "…"],
    },
  );

  static readonly ALL = new Enum<Ime>(
    Ime.MICROSOFT,
    Ime.MACOS,
    Ime.CHEWING,
    Ime.GOING,
    Ime.RIME,
    Ime.MCBOPOMOFO,
    Ime.VCHEWING,
  );

  private constructor(
    readonly id: string,
    readonly name: MessageDescriptor,
    readonly punctuation: Punctuation,
  ) {}

  /** Adds the punctuation to the keys of a layout. */
  withPunctuation(dict: CharacterDict): CharacterDict {
    const result = { ...dict };
    for (const [id, keys] of Object.entries(this.punctuation)) {
      const [a = null, b = null, c = null, d = null, e = null, f = null] =
        dict[id] ?? [];
      const [base, shift, ctrl = "", shiftCtrl = ""] = keys;
      result[id] = [
        base !== "" ? base.codePointAt(0)! : a,
        shift !== "" ? shift.codePointAt(0)! : b,
        c,
        d,
        ctrl !== "" ? ctrl.codePointAt(0)! : e,
        shiftCtrl !== "" ? shiftCtrl.codePointAt(0)! : f,
      ];
    }
    return result;
  }

  toString() {
    return this.id;
  }

  toJSON() {
    return this.id;
  }
}

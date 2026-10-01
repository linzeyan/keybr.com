import {
  type Keyboard,
  KeyCharacters,
  type KeyId,
  Layout,
  loadKeyboard,
} from "@keybr/keyboard";
import {
  Attr,
  type Char,
  type TextDisplaySettings,
  WhitespaceStyle,
} from "@keybr/textinput";
import { type CodePoint } from "@keybr/unicode";
import { clsx } from "clsx";
import { type ReactNode } from "react";
import * as styles from "./chars.module.less";
import { getTextStyle } from "./styles.ts";

/**
 * Renders the chars of a text. The keyboard, if any, tells how to type a
 * punctuation glyph.
 */
export function renderChars(
  settings: TextDisplaySettings,
  chars: readonly Char[],
  keyboard: Keyboard | null = null,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  type Span = { chars: CodePoint[]; attrs: number; cls: string | null };
  let span: Span = { chars: [], attrs: 0, cls: null };
  const pushSpan = (nextSpan: Span) => {
    if (span.chars.length > 0) {
      nodes.push(
        <span
          key={nodes.length}
          className={getClassName(span)}
          style={getTextStyle(span, /* special= */ false)}
        >
          {String.fromCodePoint(...span.chars)}
        </span>,
      );
    }
    span = nextSpan;
  };
  for (let i = 0; i < chars.length; i++) {
    const { codePoint, attrs, cls = null, glyph } = chars[i];
    if (glyph != null) {
      if (glyph !== "") {
        pushSpan({ chars: [], attrs, cls });
        const { attrs: glyphAttrs, hint } = glyphState(chars, i, keyboard);
        const glyphSpan = { attrs: glyphAttrs, cls };
        nodes.push(
          <span
            key={nodes.length}
            className={clsx(styles.glyph, getClassName(glyphSpan))}
            style={getTextStyle(glyphSpan, /* special= */ false)}
            data-hint={hint}
          >
            {glyph}
          </span>,
        );
      }
    } else if (codePoint > 0x0020) {
      if (span.attrs !== attrs || span.cls !== cls) {
        pushSpan({ chars: [], attrs, cls });
      }
      span.chars.push(codePoint);
    } else {
      pushSpan({ chars: [], attrs, cls });
      nodes.push(
        <span
          key={nodes.length}
          className={getClassName(span)}
          style={getTextStyle(span, /* special= */ true)}
        >
          {specialChar(settings.whitespaceStyle, codePoint)}
        </span>,
      );
    }
  }
  pushSpan({ chars: [], attrs: 0, cls: null });
  return nodes;
}

/**
 * Returns the state of a glyph from all of its chars, which may be
 * interleaved with the garbage chars typed before the cursor. After a miss,
 * the keys of a glyph like a Hanzi are its hint until it is typed, while a
 * punctuation, which is its own key, hints at the key combo that types it.
 */
function glyphState(
  chars: readonly Char[],
  start: number,
  keyboard: Keyboard | null,
): { readonly attrs: Attr; readonly hint?: string } {
  const glyph = chars[start].glyph!;
  let keys = "";
  let cursor = false;
  let hit = true;
  let miss = false;
  for (let i = start; i < chars.length; i++) {
    const char = chars[i];
    if (i > start && char.glyph !== "" && char.glyph != null) {
      break;
    }
    if (char.glyph != null) {
      keys += String.fromCodePoint(char.codePoint);
      cursor ||= (char.attrs & Attr.Cursor) !== 0;
      miss ||= (char.attrs & Attr.Miss) !== 0;
      hit &&= (char.attrs & (Attr.Hit | Attr.Miss)) !== 0;
    }
  }
  let hint = [...keys]
    .filter((key) => !glyph.includes(key))
    .join("")
    .trim();
  if (hint === "" && keyboard != null) {
    hint = [...keys.trim()].map((key) => comboHint(keyboard, key)).join("");
  }
  return {
    attrs: cursor
      ? Attr.Cursor
      : miss
        ? Attr.Miss
        : hit
          ? Attr.Hit
          : Attr.Normal,
    hint: cursor && miss && hint !== "" ? hint : undefined,
  };
}

let usKeyboard: Keyboard | null = null;

/**
 * Returns the key combo that types a char, as in "⇧," for "，", named by the
 * US key caps, which every keyboard in Taiwan has.
 */
function comboHint(keyboard: Keyboard, char: string): string {
  const combo = keyboard.getCombo(char.codePointAt(0)!);
  const label = combo != null ? keyLabel(combo.id) : null;
  return combo != null && label != null
    ? (combo.modifier.ctrl ? "Ctrl+" : "") + (combo.shift ? "⇧" : "") + label
    : "";
}

function keyLabel(id: KeyId): string | null {
  usKeyboard ??= loadKeyboard(Layout.EN_US);
  const a = usKeyboard.getCharacters(id)?.a;
  return KeyCharacters.isCodePoint(a) ? String.fromCodePoint(a) : null;
}

function specialChar(whitespaceStyle: WhitespaceStyle, codePoint: CodePoint) {
  switch (codePoint) {
    case 0x0009:
      return "\uE002";
    case 0x000a:
      return "\uE003";
    case 0x0020:
      switch (whitespaceStyle) {
        case WhitespaceStyle.Bar:
          return "\uE001";
        case WhitespaceStyle.Bullet:
          return "\uE000";
        default:
          return "\u00A0";
      }
    default:
      return `U+${codePoint.toString(16).padStart(4, "0")}`;
  }
}

function getClassName({ attrs }: { readonly attrs: Attr }) {
  return attrs & Attr.Cursor ? styles.cursor : undefined;
}

const cursorSelector = `.${styles.cursor}`;

export function findCursor(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>(cursorSelector) ?? null;
}

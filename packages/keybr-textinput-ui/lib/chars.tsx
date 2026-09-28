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

export function renderChars(
  settings: TextDisplaySettings,
  chars: readonly Char[],
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
        const { attrs: glyphAttrs, hint } = glyphState(chars, i);
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
 * punctuation has none.
 */
function glyphState(
  chars: readonly Char[],
  start: number,
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
  const hint = [...keys]
    .filter((key) => !glyph.includes(key))
    .join("")
    .trim();
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

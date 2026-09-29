import { test } from "node:test";
import { Language } from "@keybr/keyboard";
import { Attr, textDisplaySettings } from "@keybr/textinput";
import { render } from "@testing-library/react";
import { deepEqual, equal } from "rich-assert";
import { TextLines } from "./TextLines.tsx";

test("render chars", () => {
  const r = render(
    <TextLines
      settings={textDisplaySettings}
      lines={{
        text: "abcd",
        lines: [
          {
            text: "abcd",
            chars: [
              { codePoint: /* "a" */ 0x0061, attrs: Attr.Miss },
              { codePoint: /* "b" */ 0x0062, attrs: Attr.Hit },
              { codePoint: /* "c" */ 0x0063, attrs: Attr.Cursor },
              { codePoint: /* "d" */ 0x0064, attrs: Attr.Normal },
            ],
          },
        ],
      }}
      cursor={false}
      focus={true}
    />,
  );

  equal(r.container.textContent, "abcd");

  r.unmount();
});

test("render glyphs in place of their keys", () => {
  const r = render(
    <TextLines
      settings={textDisplaySettings}
      lines={{
        text: "ㄐㄧㄣ ㄊㄧㄢ",
        lines: [
          {
            text: "ㄐㄧㄣ ㄊㄧㄢ",
            chars: [
              { codePoint: /* "ㄐ" */ 0x3110, attrs: Attr.Hit, glyph: "今" },
              { codePoint: /* "ㄧ" */ 0x3127, attrs: Attr.Hit, glyph: "" },
              { codePoint: /* "ㄣ" */ 0x3123, attrs: Attr.Hit, glyph: "" },
              { codePoint: /* " " */ 0x0020, attrs: Attr.Hit, glyph: "" },
              { codePoint: /* "ㄊ" */ 0x310a, attrs: Attr.Cursor, glyph: "天" },
              { codePoint: /* "ㄧ" */ 0x3127, attrs: Attr.Normal, glyph: "" },
              { codePoint: /* "ㄢ" */ 0x3122, attrs: Attr.Normal, glyph: "" },
            ],
          },
        ],
      }}
      cursor={false}
      focus={true}
    />,
  );

  // The first tone space is a key of "今", not a gap in the text, and every
  // glyph is an item of its own, so that a line of Hanzi wraps anywhere.
  equal(r.container.textContent, "今天");
  equal(r.container.querySelectorAll("div > span").length, 2);

  r.unmount();
});

test("keep punctuation next to its hanzi", () => {
  const r = render(
    <TextLines
      settings={textDisplaySettings}
      lines={{
        text: "ㄊㄧㄢ ，「ㄨㄛˇ",
        lines: [
          {
            text: "ㄊㄧㄢ ，「ㄨㄛˇ",
            chars: [
              { codePoint: /* "ㄊ" */ 0x310a, attrs: Attr.Hit, glyph: "天" },
              { codePoint: /* "ㄧ" */ 0x3127, attrs: Attr.Hit, glyph: "" },
              { codePoint: /* "ㄢ" */ 0x3122, attrs: Attr.Hit, glyph: "" },
              { codePoint: /* " " */ 0x0020, attrs: Attr.Hit, glyph: "" },
              { codePoint: /* "，" */ 0xff0c, attrs: Attr.Cursor, glyph: "，" },
              { codePoint: /* "「" */ 0x300c, attrs: Attr.Normal, glyph: "「" },
              { codePoint: /* "ㄨ" */ 0x3128, attrs: Attr.Normal, glyph: "我" },
              { codePoint: /* "ㄛ" */ 0x311b, attrs: Attr.Normal, glyph: "" },
              { codePoint: /* "ˇ" */ 0x02c7, attrs: Attr.Normal, glyph: "" },
            ],
          },
        ],
      }}
      cursor={false}
      focus={true}
    />,
  );

  // A line can wrap before "「" but neither before "，" nor after "「".
  deepEqual(
    [...r.container.querySelectorAll("div > span")].map(
      ({ textContent }) => textContent,
    ),
    ["天，", "「我"],
  );

  r.unmount();
});

test("keep punctuation next to its zhuyin keys", () => {
  const chars = (text: string) =>
    [...text].map((char) => ({
      codePoint: char.codePointAt(0)!,
      attrs: Attr.Normal,
    }));
  const items = (language: Language, text: string) => {
    const r = render(
      <TextLines
        settings={{ ...textDisplaySettings, language }}
        lines={{ text, lines: [{ text, chars: chars(text) }] }}
        cursor={false}
        focus={true}
      />,
    );
    const items = [...r.container.querySelectorAll("div > span")].length;
    r.unmount();
    return items;
  };

  // The space before "：" types the first tone of "說", a line can wrap
  // before "「" but not before "：".
  equal(items(Language.ZH_TW, "ㄕㄨㄛ ：ㄨㄛˇ 「ㄒ"), 2);
  // Latin text wraps at every space, as it always did.
  equal(items(Language.EN, "say : me 'x"), 4);
});

test("render chars with line template", () => {
  const r = render(
    <TextLines
      settings={textDisplaySettings}
      lines={{
        text: "abcd",
        lines: [
          {
            text: "abcd",
            chars: [
              { codePoint: /* "a" */ 0x0061, attrs: Attr.Miss },
              { codePoint: /* "b" */ 0x0062, attrs: Attr.Hit },
              { codePoint: /* "c" */ 0x0063, attrs: Attr.Cursor },
              { codePoint: /* "d" */ 0x0064, attrs: Attr.Normal },
            ],
          },
        ],
      }}
      cursor={false}
      focus={true}
      lineTemplate={({ children }) => <div>[{children}]</div>}
    />,
  );

  equal(r.container.textContent, "[abcd]");

  r.unmount();
});

import { test } from "node:test";
import { Ime, KeyboardOptions, loadKeyboard } from "@keybr/keyboard";
import { Attr, textDisplaySettings } from "@keybr/textinput";
import { deepEqual } from "rich-assert";
import { renderChars } from "./chars.tsx";

test("render empty chars", () => {
  deepEqual(renderChars(textDisplaySettings, []), []);
});

test("render simple chars", () => {
  deepEqual(
    renderChars(textDisplaySettings, [
      { codePoint: /* "a" */ 0x0061, attrs: Attr.Hit },
      { codePoint: /* "b" */ 0x0062, attrs: Attr.Miss },
      { codePoint: /* "c" */ 0x0063, attrs: Attr.Hit },
      { codePoint: /* " " */ 0x0020, attrs: Attr.Hit },
      { codePoint: /* "x" */ 0x0078, attrs: Attr.Cursor },
      { codePoint: /* "y" */ 0x0079, attrs: Attr.Normal },
      { codePoint: /* "z" */ 0x007a, attrs: Attr.Normal },
    ]),
    [
      <span
        key={0}
        className={undefined}
        style={{ color: "var(--textinput--hit__color)" }}
      >
        a
      </span>,
      <span
        key={1}
        className={undefined}
        style={{ color: "var(--textinput--miss__color)" }}
      >
        b
      </span>,
      <span
        key={2}
        className={undefined}
        style={{ color: "var(--textinput--hit__color)" }}
      >
        c
      </span>,
      <span
        key={3}
        className={undefined}
        style={{ color: "var(--textinput--hit__color)" }}
      >
        {"\uE000"}
      </span>,
      <span
        key={4}
        className="cursor"
        style={{ color: "var(--textinput__color)" }}
      >
        x
      </span>,
      <span
        key={5}
        className={undefined}
        style={{ color: "var(--textinput__color)" }}
      >
        yz
      </span>,
    ],
  );
});

test("render styled chars", () => {
  deepEqual(
    renderChars(textDisplaySettings, [
      { codePoint: /* "a" */ 0x0061, attrs: Attr.Hit, cls: "keyword" },
      { codePoint: /* "b" */ 0x0062, attrs: Attr.Miss, cls: "keyword" },
      { codePoint: /* "c" */ 0x0063, attrs: Attr.Hit, cls: "keyword" },
      { codePoint: /* " " */ 0x0020, attrs: Attr.Hit, cls: "keyword" },
      { codePoint: /* "x" */ 0x0078, attrs: Attr.Cursor, cls: "keyword" },
      { codePoint: /* "y" */ 0x0079, attrs: Attr.Normal, cls: "keyword" },
      { codePoint: /* "z" */ 0x007a, attrs: Attr.Normal, cls: "keyword" },
    ]),
    [
      <span
        key={0}
        className={undefined}
        style={{ color: "var(--textinput--hit__color)" }}
      >
        a
      </span>,
      <span
        key={1}
        className={undefined}
        style={{ color: "var(--textinput--miss__color)" }}
      >
        b
      </span>,
      <span
        key={2}
        className={undefined}
        style={{ color: "var(--textinput--hit__color)" }}
      >
        c
      </span>,
      <span
        key={3}
        className={undefined}
        style={{ color: "var(--textinput--hit__color)" }}
      >
        {"\uE000"}
      </span>,
      <span
        key={4}
        className="cursor"
        style={{ color: "var(--syntax-keyword)" }}
      >
        x
      </span>,
      <span
        key={5}
        className={undefined}
        style={{ color: "var(--syntax-keyword)" }}
      >
        yz
      </span>,
    ],
  );
});

test("render glyph chars", () => {
  // A glyph shows the state of all of its keys, and the garbage typed
  // inside of the glyph under the cursor stays visible. A missed Hanzi
  // hints at its Zhuyin until it is typed, a punctuation is its own key
  // and has no hint.
  deepEqual(
    renderChars(textDisplaySettings, [
      { codePoint: /* "ㄋ" */ 0x310b, attrs: Attr.Hit, glyph: "你" },
      { codePoint: /* "ㄧ" */ 0x3127, attrs: Attr.Hit, glyph: "" },
      { codePoint: /* "ˇ" */ 0x02c7, attrs: Attr.Hit, glyph: "" },
      { codePoint: /* "ㄊ" */ 0x310a, attrs: Attr.Hit, glyph: "天" },
      { codePoint: /* "ㄧ" */ 0x3127, attrs: Attr.Miss, glyph: "" },
      { codePoint: /* "ㄢ" */ 0x3122, attrs: Attr.Hit, glyph: "" },
      { codePoint: /* " " */ 0x0020, attrs: Attr.Hit, glyph: "" },
      { codePoint: /* "，" */ 0xff0c, attrs: Attr.Miss, glyph: "，" },
      { codePoint: /* "ㄊ" */ 0x310a, attrs: Attr.Hit, glyph: "他" },
      { codePoint: /* "ㄅ" */ 0x3105, attrs: Attr.Garbage },
      {
        codePoint: /* "ㄚ" */ 0x311a,
        attrs: Attr.Cursor | Attr.Miss,
        glyph: "",
      },
      { codePoint: /* " " */ 0x0020, attrs: Attr.Normal, glyph: "" },
      { codePoint: /* "ㄐ" */ 0x3110, attrs: Attr.Normal, glyph: "今" },
      { codePoint: /* "ㄧ" */ 0x3127, attrs: Attr.Normal, glyph: "" },
      { codePoint: /* "ㄣ" */ 0x3123, attrs: Attr.Normal, glyph: "" },
      { codePoint: /* " " */ 0x0020, attrs: Attr.Normal, glyph: "" },
    ]),
    [
      <span
        key={0}
        className="glyph"
        style={{ color: "var(--textinput--hit__color)" }}
        data-hint={undefined}
      >
        你
      </span>,
      <span
        key={1}
        className="glyph"
        style={{ color: "var(--textinput--miss__color)" }}
        data-hint={undefined}
      >
        天
      </span>,
      <span
        key={2}
        className="glyph"
        style={{ color: "var(--textinput--miss__color)" }}
        data-hint={undefined}
      >
        ，
      </span>,
      <span
        key={3}
        className="glyph cursor"
        style={{ color: "var(--textinput__color)" }}
        data-hint="ㄊㄚ"
      >
        他
      </span>,
      <span
        key={4}
        className={undefined}
        style={{
          color: "var(--textinput__color)",
          backgroundColor: "var(--textinput--miss__color)",
        }}
      >
        ㄅ
      </span>,
      <span
        key={5}
        className="glyph"
        style={{ color: "var(--textinput__color)" }}
        data-hint={undefined}
      >
        今
      </span>,
    ],
  );
});

test("hint at the key combo of a missed punctuation", () => {
  // The punctuation keys depend on the input method, the hint names the US
  // key caps. Only the glyph under the cursor has a hint.
  const hints = (ime: Ime) =>
    renderChars(
      textDisplaySettings,
      [
        {
          codePoint: /* "，" */ 0xff0c,
          attrs: Attr.Cursor | Attr.Miss,
          glyph: "，",
        },
        { codePoint: /* "、" */ 0x3001, attrs: Attr.Miss, glyph: "、" },
      ],
      loadKeyboard(KeyboardOptions.default().withIme(ime)),
    ).map((node: any) => node.props["data-hint"]);
  deepEqual(hints(Ime.CHEWING), ["⇧,", undefined]);
  deepEqual(hints(Ime.MICROSOFT), ["Ctrl+,", undefined]);
});

test("render special chars", () => {
  deepEqual(
    renderChars(textDisplaySettings, [
      { codePoint: 0x0000, attrs: Attr.Normal },
      { codePoint: 0x0009, attrs: Attr.Normal },
      { codePoint: 0x000a, attrs: Attr.Normal },
      { codePoint: 0x0020, attrs: Attr.Normal },
    ]),
    [
      <span
        key={0}
        className={undefined}
        style={{ color: "var(--textinput--special__color)" }}
      >
        U+0000
      </span>,
      <span
        key={1}
        className={undefined}
        style={{ color: "var(--textinput--special__color)" }}
      >
        {"\uE002"}
      </span>,
      <span
        key={2}
        className={undefined}
        style={{ color: "var(--textinput--special__color)" }}
      >
        {"\uE003"}
      </span>,
      <span
        key={3}
        className={undefined}
        style={{ color: "var(--textinput--special__color)" }}
      >
        {"\uE000"}
      </span>,
    ],
  );
});

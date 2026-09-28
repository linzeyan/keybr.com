import { describe, it, test } from "node:test";
import { Settings } from "@keybr/settings";
import { equal, isNotEmpty } from "rich-assert";
import { Geometry, ZoneMod } from "./geometry.ts";
import { Language } from "./language.ts";
import { Layout } from "./layout.ts";
import { KeyboardOptions, keyboardProps } from "./settings.ts";

test("use default settings", () => {
  const options = KeyboardOptions.default();

  equal(options.language, Language.ZH_TW);
  equal(options.layout, Layout.ZH_TW_DACHEN);
  equal(options.geometry, Geometry.ANSI_101);
  equal(options.zones, ZoneMod.STANDARD);
});

test("read default settings", () => {
  const options = KeyboardOptions.from(new Settings());

  // A new visitor starts with Zhuyin, even with an English browser.
  equal(options.language, Language.ZH_TW);
  equal(options.layout, Layout.ZH_TW_DACHEN);
  equal(options.geometry, Geometry.ANSI_101);
  equal(options.zones, ZoneMod.STANDARD);
});

test("read configured values", () => {
  const options = KeyboardOptions.from(
    new Settings()
      .set(keyboardProps.language, Language.ZH_TW)
      .set(keyboardProps.layout, Layout.ZH_TW_DACHEN)
      .set(keyboardProps.geometry, Geometry.ISO_102)
      .set(keyboardProps.zones, ZoneMod.SYMMETRIC),
  );

  equal(options.language, Language.ZH_TW);
  equal(options.layout, Layout.ZH_TW_DACHEN);
  equal(options.geometry, Geometry.ISO_102);
  equal(options.zones, ZoneMod.SYMMETRIC);
});

describe("update properties", () => {
  it("with a custom language", () => {
    const options = KeyboardOptions.default().withLanguage(Language.ZH_TW);

    equal(options.language, Language.ZH_TW);
    equal(options.layout, Layout.ZH_TW_DACHEN);
    equal(options.geometry, Geometry.ANSI_101);
    equal(options.zones, ZoneMod.STANDARD);
  });

  it("with a custom language and layout", () => {
    const options = KeyboardOptions.default()
      .withLanguage(Language.EN)
      .withLayout(Layout.EN_DVORAK);

    equal(options.language, Language.EN);
    equal(options.layout, Layout.EN_DVORAK);
    equal(options.geometry, Geometry.ANSI_101);
    equal(options.zones, ZoneMod.STANDARD);
  });

  it("with a custom language, layout and geometry", () => {
    const options = KeyboardOptions.default()
      .withLanguage(Language.EN)
      .withLayout(Layout.EN_DVORAK)
      .withGeometry(Geometry.ISO_102);

    equal(options.language, Language.EN);
    equal(options.layout, Layout.EN_DVORAK);
    equal(options.geometry, Geometry.ISO_102);
    equal(options.zones, ZoneMod.STANDARD);
  });

  it("with a custom language, layout, geometry and zones", () => {
    const options = KeyboardOptions.default()
      .withLanguage(Language.EN)
      .withLayout(Layout.EN_DVORAK)
      .withGeometry(Geometry.ISO_102)
      .withZones(ZoneMod.SYMMETRIC);

    equal(options.language, Language.EN);
    equal(options.layout, Layout.EN_DVORAK);
    equal(options.geometry, Geometry.ISO_102);
    equal(options.zones, ZoneMod.SYMMETRIC);
  });

  it("reject invalid language and layout combination", () => {
    // Zhuyin cannot be typed on an English layout, and vice versa.
    const zhuyin = KeyboardOptions.default()
      .withLanguage(Language.ZH_TW)
      .withLayout(Layout.EN_DVORAK);

    equal(zhuyin.language, Language.ZH_TW);
    equal(zhuyin.layout, Layout.ZH_TW_DACHEN);

    const english = KeyboardOptions.default()
      .withLanguage(Language.EN)
      .withLayout(Layout.ZH_TW_DACHEN);

    equal(english.language, Language.EN);
    equal(english.layout, Layout.EN_US);
  });
});

test("find layouts for all languages", () => {
  for (const language of Language.ALL) {
    const options = KeyboardOptions.default().withLanguage(language);
    equal(options.language, language);
    equal(options.layout.language.script, language.script);
    isNotEmpty(options.selectableLayouts());
  }
});

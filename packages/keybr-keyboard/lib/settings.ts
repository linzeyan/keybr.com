import {
  booleanProp,
  enumProp,
  itemProp,
  type Settings,
  xitemProp,
} from "@keybr/settings";
import { Geometry, ZoneMod } from "./geometry.ts";
import { Ime } from "./ime.ts";
import { Language } from "./language.ts";
import { Layout } from "./layout.ts";
import { nullMod } from "./mod.ts";

export enum Emulation {
  /**
   * No emulation.
   */
  None = 0,
  /**
   * Assumes that the physical key locations are correct,
   * fixes the character codes.
   */
  Forward = 1,
  /**
   * Assumes that the character codes are correct,
   * fixes the physical key locations.
   * It reverses the effect of layout emulation in hardware.
   */
  Reverse = 2,
}

export const keyboardProps = {
  // This is a Zhuyin trainer, a new visitor starts with the Dachen layout
  // whatever the browser language is.
  language: itemProp("keyboard.language", Language.ALL, Language.ZH_TW),
  layout: xitemProp("keyboard.layout", Layout.ALL, Layout.ZH_TW_DACHEN),
  geometry: itemProp("keyboard.geometry", Geometry.ALL, Geometry.ANSI_101),
  zones: itemProp("keyboard.zones", ZoneMod.ALL, ZoneMod.STANDARD),
  ime: itemProp("keyboard.ime", Ime.ALL, Ime.CHEWING),
  emulation: enumProp("keyboard.emulation", Emulation, Emulation.Forward),
  colors: booleanProp("keyboard.colors", true),
  pointers: booleanProp("keyboard.pointers", true),
} as const;

export class KeyboardOptions {
  static default(): KeyboardOptions {
    return new KeyboardOptions(
      Language.ZH_TW,
      Layout.ZH_TW_DACHEN,
      Geometry.ANSI_101,
      ZoneMod.STANDARD,
      Ime.CHEWING,
    );
  }

  static from(settings: Settings): KeyboardOptions {
    const language = settings.get(keyboardProps.language);
    const layout = settings.get(keyboardProps.layout);
    const geometry = settings.get(keyboardProps.geometry);
    const zones = settings.get(keyboardProps.zones);
    const ime = settings.get(keyboardProps.ime);
    return KeyboardOptions.default()
      .withLanguage(language)
      .withLayout(layout)
      .withGeometry(geometry)
      .withZones(zones)
      .withIme(ime);
  }

  readonly #language: Language;
  readonly #layout: Layout;
  readonly #geometry: Geometry;
  readonly #zones: ZoneMod;
  readonly #ime: Ime;

  private constructor(
    language: Language,
    layout: Layout,
    geometry: Geometry,
    zones: ZoneMod,
    ime: Ime,
  ) {
    this.#language = language;
    this.#layout = layout;
    this.#geometry = geometry;
    this.#zones = zones;
    this.#ime = ime;
  }

  get language(): Language {
    return this.#language;
  }

  get layout(): Layout {
    return this.#layout;
  }

  get geometry(): Geometry {
    return this.#geometry;
  }

  get zones(): ZoneMod {
    return this.#zones;
  }

  /** The input method, which decides the punctuation keys of a Zhuyin layout. */
  get ime(): Ime {
    return this.#ime;
  }

  selectableLanguages(): Language[] {
    return [...Language.ALL];
  }

  selectableLayouts(): Layout[] {
    return Layout.selectableLayouts(this.#language);
  }

  selectableGeometries(): Geometry[] {
    return [...this.#layout.geometries];
  }

  selectableZones(): ZoneMod[] {
    if (this.#layout.mod !== nullMod) {
      return [];
    }
    return [...this.#geometry.zones];
  }

  withLanguage(language: Language): KeyboardOptions {
    const layout = Layout.selectLayout(language);
    const geometry = Geometry.first(layout.geometries);
    const zones = ZoneMod.first(geometry.zones);
    return new KeyboardOptions(
      language, //
      layout,
      geometry,
      zones,
      this.#ime,
    );
  }

  withLayout(layout: Layout): KeyboardOptions {
    if (this.#language.script === layout.language.script) {
      const geometry = Geometry.first(layout.geometries);
      const zones = ZoneMod.first(geometry.zones);
      return new KeyboardOptions(
        this.#language, //
        layout,
        geometry,
        zones,
        this.#ime,
      );
    } else {
      return this;
    }
  }

  withGeometry(geometry: Geometry): KeyboardOptions {
    if (this.#layout.geometries.has(geometry)) {
      const zones = ZoneMod.first(geometry.zones);
      return new KeyboardOptions(
        this.#language, //
        this.#layout,
        geometry,
        zones,
        this.#ime,
      );
    } else {
      return this;
    }
  }

  withZones(zones: ZoneMod): KeyboardOptions {
    if (this.#layout.mod !== nullMod) {
      return this;
    }
    if (this.#geometry.zones.has(zones)) {
      return new KeyboardOptions(
        this.#language,
        this.#layout,
        this.#geometry,
        zones,
        this.#ime,
      );
    } else {
      return this;
    }
  }

  withIme(ime: Ime): KeyboardOptions {
    return new KeyboardOptions(
      this.#language,
      this.#layout,
      this.#geometry,
      this.#zones,
      ime,
    );
  }

  save(settings: Settings): Settings {
    return settings
      .set(keyboardProps.language, this.#language)
      .set(keyboardProps.layout, this.#layout)
      .set(keyboardProps.geometry, this.#geometry)
      .set(keyboardProps.zones, this.#zones)
      .set(keyboardProps.ime, this.#ime);
  }
}

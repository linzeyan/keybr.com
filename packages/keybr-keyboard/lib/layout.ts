import { Enum, XEnum, type XEnumItem } from "@keybr/lang";
import { Geometry } from "./geometry.ts";
import { Language } from "./language.ts";
import { angleMod, angleWideMod, type Mod, nullMod } from "./mod.ts";

export class Layout implements XEnumItem {
  static custom(language: Language) {
    return new Layout(
      /* id= */ "custom",
      /* xid= */ 0xff,
      /* name= */ "Custom",
      /* family= */ "custom",
      /* language= */ language,
      /* emulate= */ true,
      /* geometries= */ Geometry.ALL,
    );
  }

  static readonly EN_US = new Layout(
    /* id= */ "en-us",
    /* xid= */ 0x10,
    /* name= */ "{US}",
    /* family= */ "qwerty",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_DVORAK = new Layout(
    /* id= */ "en-dvorak",
    /* xid= */ 0x18,
    /* name= */ "Dvorak",
    /* family= */ "dvorak",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_DVORAK_PROG = new Layout(
    /* id= */ "en-dvorak-prog",
    /* xid= */ 0x15,
    /* name= */ "Dvorak (Programmers)",
    /* family= */ "dvorak",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_COLEMAK = new Layout(
    /* id= */ "en-colemak",
    /* xid= */ 0x19,
    /* name= */ "Colemak",
    /* family= */ "colemak",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_COLEMAK_DH_ANSI = new Layout(
    /* id= */ "en-colemak-dh",
    /* xid= */ 0x1b,
    /* name= */ "Colemak-DH (ANSI)",
    /* family= */ "colemak-dh",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.MATRIX,
    ),
    /* mod= */ angleMod,
  );
  static readonly EN_COLEMAK_DH_ANSI_WIDE = new Layout(
    /* id= */ "en-colemak-dh-wide",
    /* xid= */ 0x1f,
    /* name= */ "Colemak-DH Wide (ANSI)",
    /* family= */ "colemak-dh-wide",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.MATRIX,
    ),
    /* mod= */ angleWideMod,
  );
  static readonly EN_COLEMAK_DH_ISO = new Layout(
    /* id= */ "en-colemak-dh-iso",
    /* xid= */ 0x16,
    /* name= */ "Colemak-DH (ISO)",
    /* family= */ "colemak-dh-iso",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
    /* mod= */ angleMod,
  );
  static readonly EN_COLEMAK_DH_ISO_WIDE = new Layout(
    /* id= */ "en-colemak-dh-iso-wide",
    /* xid= */ 0x17,
    /* name= */ "Colemak-DH Wide (ISO)",
    /* family= */ "colemak-dh-iso-wide",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
    /* mod= */ angleWideMod,
  );
  static readonly EN_COLEMAK_DH_MATRIX = new Layout(
    /* id= */ "en-colemak-dh-matrix",
    /* xid= */ 0x1c,
    /* name= */ "Colemak-DH (matrix)",
    /* family= */ "colemak-dh-matrix",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_WORKMAN = new Layout(
    /* id= */ "en-workman",
    /* xid= */ 0x1a,
    /* name= */ "Workman",
    /* family= */ "workman",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_UK = new Layout(
    /* id= */ "en-uk",
    /* xid= */ 0x11,
    /* name= */ "{UK}",
    /* family= */ "qwerty",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_JP = new Layout(
    /* id= */ "en-jp",
    /* xid= */ 0x12,
    /* name= */ "{JP}",
    /* family= */ "qwerty",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(
      Geometry.JAPANESE_106,
      Geometry.JAPANESE_106_FULL,
    ),
  );
  static readonly EN_CANARY = new Layout(
    /* id= */ "en-canary",
    /* xid= */ 0x1e,
    /* name= */ "Canary",
    /* family= */ "canary",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_CANARY_MATRIX = new Layout(
    /* id= */ "en-canary-matrix",
    /* xid= */ 0x1d,
    /* name= */ "Canary (matrix)",
    /* family= */ "canary-matrix",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_NORMAN = new Layout(
    /* id= */ "en-norman",
    /* xid= */ 0x8b,
    /* name= */ "Norman",
    /* family= */ "norman",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_HALMAK = new Layout(
    /* id= */ "en-halmak",
    /* xid= */ 0x8c,
    /* name= */ "Halmak",
    /* family= */ "halmak",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_ENGRAM = new Layout(
    /* id= */ "en-engram",
    /* xid= */ 0x92,
    /* name= */ "Engram",
    /* family= */ "en-engram",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_NERPS = new Layout(
    /* id= */ "en-nerps",
    /* xid= */ 0x93,
    /* name= */ "Nerps",
    /* family= */ "nerps",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_NERPS_MATRIX = new Layout(
    /* id= */ "en-nerps-matrix",
    /* xid= */ 0x94,
    /* name= */ "Nerps (matrix)",
    /* family= */ "nerps-matrix",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_HANDS_DOWN_NEU = new Layout(
    /* id= */ "en-hands-down-neu",
    /* xid= */ 0x95,
    /* name= */ "Hands Down Neu",
    /* family= */ "hands-down-neu",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.MATRIX,
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
    ),
  );
  static readonly EN_STURDY = new Layout(
    /* id= */ "en-sturdy",
    /* xid= */ 0x96,
    /* name= */ "Sturdy",
    /* family= */ "sturdy",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_GRAPHITE = new Layout(
    /* id= */ "en-graphite",
    /* xid= */ 0x99,
    /* name= */ "Graphite",
    /* family= */ "en-graphite",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_GRAPHITE_ANGLE_KP = new Layout(
    /* id= */ "en-graphite-angle-kp",
    /* xid= */ 0xad,
    /* name= */ "Graphite Angle KP",
    /* family= */ "en-graphite-angle-kp",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_GALLIUM = new Layout(
    /* id= */ "en-gallium",
    /* xid= */ 0xa1,
    /* name= */ "Gallium",
    /* family= */ "gallium",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_GALLIUM_MATRIX = new Layout(
    /* id= */ "en-gallium-matrix",
    /* xid= */ 0xa2,
    /* name= */ "Gallium (Matrix)",
    /* family= */ "gallium-matrix",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_GALLIUM_NL = new Layout(
    /* id= */ "en-gallium-nl",
    /* xid= */ 0xb0,
    /* name= */ "Gallium-NL",
    /* family= */ "gallium-nl",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_HANDS_DOWN_PROMETHIUM = new Layout(
    /* id= */ "en-hands-down-promethium",
    /* xid= */ 0xa3,
    /* name= */ "Hands Down Promethium (Matrix)",
    /* family= */ "en-hands-down-promethium",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_HANDS_DOWN_PROMETHIUM_INVERTED = new Layout(
    /* id= */ "en-hands-down-promethium-inverted",
    /* xid= */ 0xaf,
    /* name= */ "Hands Down Promethium Inverted (Matrix)",
    /* family= */ "en-hands-down-promethium",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_APT_V3 = new Layout(
    /* id= */ "en-aptv3",
    /* xid= */ 0xa4,
    /* name= */ "APTv3",
    /* family= */ "en-aptv3",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_FOCAL = new Layout(
    /* id= */ "en_focal",
    /* xid= */ 0xa5,
    /* name= */ "Focal",
    /* family= */ "focal",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
      Geometry.MATRIX,
    ),
  );
  static readonly EN_ENTHIUM_V6 = new Layout(
    /* id= */ "en-enthium-v6",
    /* xid= */ 0xa8,
    /* name= */ "Enthium V6 (Matrix)",
    /* family= */ "enthium",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_ENTHIUM_V10 = new Layout(
    /* id= */ "en-enthium-v10",
    /* xid= */ 0xb8,
    /* name= */ "Enthium V10 (Matrix)",
    /* family= */ "enthium",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_ENTHIUM_V11 = new Layout(
    /* id= */ "en-enthium-v11",
    /* xid= */ 0xb9,
    /* name= */ "Enthium V11 (Matrix)",
    /* family= */ "enthium",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_ENTHIUM_V13 = new Layout(
    /* id= */ "en-enthium-v13",
    /* xid= */ 0xba,
    /* name= */ "Enthium V13 (Matrix)",
    /* family= */ "enthium",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_ENTHIUM_V14 = new Layout(
    /* id= */ "en-enthium-v14",
    /* xid= */ 0xbb,
    /* name= */ "Enthium V14 (Matrix)",
    /* family= */ "enthium",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_NIGHT_MATRIX = new Layout(
    /* id= */ "en-night-matrix",
    /* xid= */ 0xa9,
    /* name= */ "Night (matrix)",
    /* family= */ "night",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(Geometry.MATRIX),
  );
  static readonly EN_MTGAP = new Layout(
    /* id= */ "en-mtgap",
    /* xid= */ 0xaa,
    /* name= */ "MTGAP",
    /* family= */ "MTGAP",
    /* language= */ Language.EN,
    /* emulate= */ false,
    /* geometries= */ new Enum(
      Geometry.MATRIX,
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
    ),
  );
  static readonly EN_KUNTEM = new Layout(
    /* id= */ "en-kuntem",
    /* xid= */ 0xae,
    /* name= */ "Kuntem",
    /* family= */ "kuntem",
    /* language= */ Language.EN,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
    ),
  );
  // Emulated so that users can keep the OS in English input mode, an active
  // Bopomofo IME would swallow the keystrokes into its composition window.
  static readonly ZH_TW_DACHEN = new Layout(
    /* id= */ "zh-tw",
    /* xid= */ 0xbc,
    /* name= */ "大千",
    /* family= */ "dachen",
    /* language= */ Language.ZH_TW,
    /* emulate= */ true,
    /* geometries= */ new Enum(
      Geometry.ANSI_101,
      Geometry.ANSI_101_FULL,
      Geometry.ISO_102,
      Geometry.ISO_102_FULL,
    ),
  );

  static readonly ALL = new XEnum<Layout>(
    Layout.EN_US,
    Layout.EN_DVORAK,
    Layout.EN_DVORAK_PROG,
    Layout.EN_COLEMAK,
    Layout.EN_COLEMAK_DH_ANSI,
    Layout.EN_COLEMAK_DH_ANSI_WIDE,
    Layout.EN_COLEMAK_DH_ISO,
    Layout.EN_COLEMAK_DH_ISO_WIDE,
    Layout.EN_COLEMAK_DH_MATRIX,
    Layout.EN_WORKMAN,
    Layout.EN_CANARY,
    Layout.EN_CANARY_MATRIX,
    Layout.EN_NERPS,
    Layout.EN_NERPS_MATRIX,
    Layout.EN_NIGHT_MATRIX,
    Layout.EN_HANDS_DOWN_NEU,
    Layout.EN_HANDS_DOWN_PROMETHIUM,
    Layout.EN_HANDS_DOWN_PROMETHIUM_INVERTED,
    Layout.EN_STURDY,
    Layout.EN_NORMAN,
    Layout.EN_HALMAK,
    Layout.EN_ENGRAM,
    Layout.EN_GALLIUM,
    Layout.EN_GALLIUM_MATRIX,
    // Layout.EN_GALLIUM_NL,
    Layout.EN_GRAPHITE,
    Layout.EN_GRAPHITE_ANGLE_KP,
    Layout.EN_APT_V3,
    Layout.EN_FOCAL,
    Layout.EN_ENTHIUM_V6,
    Layout.EN_ENTHIUM_V10,
    Layout.EN_ENTHIUM_V11,
    Layout.EN_ENTHIUM_V13,
    Layout.EN_ENTHIUM_V14,
    Layout.EN_KUNTEM,
    Layout.EN_UK,
    Layout.EN_JP,
    Layout.EN_MTGAP,
    Layout.ZH_TW_DACHEN,
  );

  static selectableLayouts(language: Language): Layout[] {
    const list = Layout.ALL.filter(
      (layout) => layout.language.script === language.script,
    );
    return [
      ...list.filter((layout) => layout.language.id === language.id),
      ...list.filter((layout) => layout.language.id !== language.id),
    ];
  }

  static selectLayout(language: Language): Layout {
    const [layout] = Layout.selectableLayouts(language);
    if (layout == null) {
      throw new Error(); // Unreachable.
    }
    return layout;
  }

  private constructor(
    readonly id: string,
    readonly xid: number,
    readonly name: string,
    readonly family: string,
    readonly language: Language,
    readonly emulate: boolean,
    readonly geometries: Enum<Geometry>,
    readonly mod: Mod = nullMod,
  ) {
    Object.freeze(this);
  }

  toString() {
    return this.id;
  }

  toJSON() {
    return this.id;
  }
}

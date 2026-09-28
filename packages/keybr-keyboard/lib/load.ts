import { Geometry, ZoneMod } from "./geometry.ts";
import { ANSI_101 } from "./geometry/ansi_101.ts";
import { ANSI_101_FULL } from "./geometry/ansi_101_full.ts";
import { BRAZILIAN_104 } from "./geometry/brazilian_104.ts";
import { BRAZILIAN_104_FULL } from "./geometry/brazilian_104_full.ts";
import { ISO_102 } from "./geometry/iso_102.ts";
import { ISO_102_FULL } from "./geometry/iso_102_full.ts";
import { JAPANESE_106 } from "./geometry/japanese_106.ts";
import { JAPANESE_106_FULL } from "./geometry/japanese_106_full.ts";
import { KOREAN_103 } from "./geometry/korean_103.ts";
import { KOREAN_103_FULL } from "./geometry/korean_103_full.ts";
import { MATRIX } from "./geometry/matrix.ts";
import { Keyboard } from "./keyboard.ts";
import { Layout } from "./layout.ts";
import { LAYOUT_EN_APTV3 } from "./layout/en_aptv3.ts";
import { LAYOUT_EN_CANARY } from "./layout/en_canary.ts";
import { LAYOUT_EN_CANARY_MATRIX } from "./layout/en_canary_matrix.ts";
import { LAYOUT_EN_COLEMAK } from "./layout/en_colemak.ts";
import { LAYOUT_EN_COLEMAK_DH_ANSI } from "./layout/en_colemak_dh_ansi.ts";
import { LAYOUT_EN_COLEMAK_DH_ANSI_WIDE } from "./layout/en_colemak_dh_ansi_wide.ts";
import { LAYOUT_EN_COLEMAK_DH_ISO } from "./layout/en_colemak_dh_iso.ts";
import { LAYOUT_EN_COLEMAK_DH_ISO_WIDE } from "./layout/en_colemak_dh_iso_wide.ts";
import { LAYOUT_EN_COLEMAK_DH_MATRIX } from "./layout/en_colemak_dh_matrix.ts";
import { LAYOUT_EN_DVORAK } from "./layout/en_dvorak.ts";
import { LAYOUT_EN_DVORAK_PROG } from "./layout/en_dvorak_prog.ts";
import { LAYOUT_EN_ENGRAM } from "./layout/en_engram.ts";
import { LAYOUT_EN_ENTHIUM_V6 } from "./layout/en_enthium_v6.ts";
import { LAYOUT_EN_ENTHIUM_V10 } from "./layout/en_enthium_v10.ts";
import { LAYOUT_EN_ENTHIUM_V11 } from "./layout/en_enthium_v11.ts";
import { LAYOUT_EN_ENTHIUM_V13 } from "./layout/en_enthium_v13.ts";
import { LAYOUT_EN_ENTHIUM_V14 } from "./layout/en_enthium_v14.ts";
import { LAYOUT_EN_FOCAL } from "./layout/en_focal.ts";
import { LAYOUT_EN_GALLIUM } from "./layout/en_gallium.ts";
import { LAYOUT_EN_GALLIUM_MATRIX } from "./layout/en_gallium_matrix.ts";
import { LAYOUT_EN_GALLIUM_NL } from "./layout/en_gallium_nl.ts";
import { LAYOUT_EN_GRAPHITE } from "./layout/en_graphite.ts";
import { LAYOUT_EN_GRAPHITE_ANGLE_KP } from "./layout/en_graphite_angle_kp.ts";
import { LAYOUT_EN_HALMAK } from "./layout/en_halmak.ts";
import { LAYOUT_EN_HANDS_DOWN_NEU } from "./layout/en_hands_down_neu.ts";
import { LAYOUT_EN_HANDS_DOWN_PROMETHIUM } from "./layout/en_hands_down_promethium.ts";
import { LAYOUT_EN_HANDS_DOWN_PROMETHIUM_INVERTED } from "./layout/en_hands_down_promethium_inverted.ts";
import { LAYOUT_EN_KUNTEM } from "./layout/en_kuntem.ts";
import { LAYOUT_EN_MTGAP } from "./layout/en_mtgap.ts";
import { LAYOUT_EN_NERPS } from "./layout/en_nerps.ts";
import { LAYOUT_EN_NERPS_MATRIX } from "./layout/en_nerps_matrix.ts";
import { LAYOUT_EN_NIGHT_MATRIX } from "./layout/en_night_matrix.ts";
import { LAYOUT_EN_NORMAN } from "./layout/en_norman.ts";
import { LAYOUT_EN_STURDY } from "./layout/en_sturdy.ts";
import { LAYOUT_EN_UK } from "./layout/en_uk.ts";
import { LAYOUT_EN_US } from "./layout/en_us.ts";
import { LAYOUT_EN_WORKMAN } from "./layout/en_workman.ts";
import { LAYOUT_JA_JP_JIS } from "./layout/ja_jp_jis.ts";
import { LAYOUT_ZH_TW_DACHEN } from "./layout/zh_tw_dachen.ts";
import { nullMod, remapZones } from "./mod.ts";
import { KeyboardOptions } from "./settings.ts";
import { type CharacterDict, type GeometryDict } from "./types.ts";

const layouts = new Map<Layout, CharacterDict>([
  [Layout.EN_APT_V3, LAYOUT_EN_APTV3],
  [Layout.EN_CANARY, LAYOUT_EN_CANARY],
  [Layout.EN_CANARY_MATRIX, LAYOUT_EN_CANARY_MATRIX],
  [Layout.EN_COLEMAK, LAYOUT_EN_COLEMAK],
  [Layout.EN_COLEMAK_DH_ANSI, LAYOUT_EN_COLEMAK_DH_ANSI],
  [Layout.EN_COLEMAK_DH_ANSI_WIDE, LAYOUT_EN_COLEMAK_DH_ANSI_WIDE],
  [Layout.EN_COLEMAK_DH_ISO, LAYOUT_EN_COLEMAK_DH_ISO],
  [Layout.EN_COLEMAK_DH_ISO_WIDE, LAYOUT_EN_COLEMAK_DH_ISO_WIDE],
  [Layout.EN_COLEMAK_DH_MATRIX, LAYOUT_EN_COLEMAK_DH_MATRIX],
  [Layout.EN_DVORAK, LAYOUT_EN_DVORAK],
  [Layout.EN_DVORAK_PROG, LAYOUT_EN_DVORAK_PROG],
  [Layout.EN_ENGRAM, LAYOUT_EN_ENGRAM],
  [Layout.EN_ENTHIUM_V6, LAYOUT_EN_ENTHIUM_V6],
  [Layout.EN_ENTHIUM_V10, LAYOUT_EN_ENTHIUM_V10],
  [Layout.EN_ENTHIUM_V11, LAYOUT_EN_ENTHIUM_V11],
  [Layout.EN_ENTHIUM_V13, LAYOUT_EN_ENTHIUM_V13],
  [Layout.EN_ENTHIUM_V14, LAYOUT_EN_ENTHIUM_V14],
  [Layout.EN_FOCAL, LAYOUT_EN_FOCAL],
  [Layout.EN_GALLIUM, LAYOUT_EN_GALLIUM],
  [Layout.EN_GALLIUM_MATRIX, LAYOUT_EN_GALLIUM_MATRIX],
  [Layout.EN_GALLIUM_NL, LAYOUT_EN_GALLIUM_NL],
  [Layout.EN_GRAPHITE, LAYOUT_EN_GRAPHITE],
  [Layout.EN_GRAPHITE_ANGLE_KP, LAYOUT_EN_GRAPHITE_ANGLE_KP],
  [Layout.EN_HALMAK, LAYOUT_EN_HALMAK],
  [Layout.EN_HANDS_DOWN_NEU, LAYOUT_EN_HANDS_DOWN_NEU],
  [Layout.EN_HANDS_DOWN_PROMETHIUM, LAYOUT_EN_HANDS_DOWN_PROMETHIUM],
  [
    Layout.EN_HANDS_DOWN_PROMETHIUM_INVERTED,
    LAYOUT_EN_HANDS_DOWN_PROMETHIUM_INVERTED,
  ],
  [Layout.EN_JP, LAYOUT_JA_JP_JIS],
  [Layout.EN_KUNTEM, LAYOUT_EN_KUNTEM],
  [Layout.EN_MTGAP, LAYOUT_EN_MTGAP],
  [Layout.EN_NERPS, LAYOUT_EN_NERPS],
  [Layout.EN_NERPS_MATRIX, LAYOUT_EN_NERPS_MATRIX],
  [Layout.EN_NIGHT_MATRIX, LAYOUT_EN_NIGHT_MATRIX],
  [Layout.EN_NORMAN, LAYOUT_EN_NORMAN],
  [Layout.EN_STURDY, LAYOUT_EN_STURDY],
  [Layout.EN_UK, LAYOUT_EN_UK],
  [Layout.EN_US, LAYOUT_EN_US],
  [Layout.EN_WORKMAN, LAYOUT_EN_WORKMAN],
  [Layout.ZH_TW_DACHEN, LAYOUT_ZH_TW_DACHEN],
]);

const geometries = new Map<Geometry, GeometryDict>([
  [Geometry.ANSI_101, ANSI_101],
  [Geometry.ANSI_101_FULL, ANSI_101_FULL],
  [Geometry.BRAZILIAN_104, BRAZILIAN_104],
  [Geometry.BRAZILIAN_104_FULL, BRAZILIAN_104_FULL],
  [Geometry.ISO_102, ISO_102],
  [Geometry.ISO_102_FULL, ISO_102_FULL],
  [Geometry.JAPANESE_106, JAPANESE_106],
  [Geometry.JAPANESE_106_FULL, JAPANESE_106_FULL],
  [Geometry.KOREAN_103, KOREAN_103],
  [Geometry.KOREAN_103_FULL, KOREAN_103_FULL],
  [Geometry.MATRIX, MATRIX],
]);

export function loadKeyboard(options: KeyboardOptions): Keyboard;
export function loadKeyboard(layout: Layout): Keyboard;
export function loadKeyboard(layout: Layout, geometry: Geometry): Keyboard;
export function loadKeyboard(...args: any[]): Keyboard {
  const { length } = args;
  let options: KeyboardOptions;
  if (length === 1 && (options = args[0]) instanceof KeyboardOptions) {
    return loadImpl(options.layout, options.geometry, options.zones);
  }
  let layout: Layout;
  if (length === 1 && (layout = args[0]) instanceof Layout) {
    return loadImpl(layout);
  }
  let geometry: Geometry;
  if (
    length === 2 &&
    (layout = args[0]) instanceof Layout &&
    (geometry = args[1]) instanceof Geometry
  ) {
    return loadImpl(layout, geometry);
  }
  throw new TypeError();
}

function loadImpl(
  layout: Layout,
  geometry: Geometry = Geometry.first(layout.geometries),
  zones: ZoneMod = ZoneMod.first(geometry.zones),
): Keyboard {
  let characterDict = layouts.get(layout)!;
  let geometryDict = geometries.get(geometry)!;
  if (layout.mod === nullMod && zones !== ZoneMod.STANDARD) {
    geometryDict = remapZones(geometryDict, zones.mod);
  }
  return new Keyboard(layout, geometry, characterDict, geometryDict);
}

#!/usr/bin/env -S npx tsnode

/**
 * This script takes keyboard layout definitions in various formats and generates
 * TypeScript files with the same layouts converted into our own internal representation.
 */

import { type CharacterDict } from "@keybr/keyboard";
import { writeGeneratedFile } from "./layout/generate.ts";
import { importCldr, importKeymap, importKlc } from "./layout/import.ts";
import { pathTo } from "./root.ts";

for (const [id, layout] of [
  ["en_aptv3", importKeymap("layouts/en_aptv3.json")],
  ["en_canary", importKeymap("layouts/en_canary.json")],
  ["en_canary_matrix", importKeymap("layouts/en_canary_matrix.json")],
  ["en_colemak", undead(importKlc("layouts/colemak.klc"))],
  ["en_colemak_dh_ansi", undead(importKlc("layouts/colemak_dh_ansi_us.klc"))],
  ["en_colemak_dh_ansi_wide", undead(importKlc("layouts/colemak_dh_ansi_us_wide.klc"))],
  ["en_colemak_dh_iso", undead(importKlc("layouts/colemak_dh_iso_uk.klc"))],
  ["en_colemak_dh_iso_wide", undead(importKlc("layouts/colemak_dh_iso_uk_wide.klc"))],
  ["en_colemak_dh_matrix", undead(importKlc("layouts/colemak_dh_matrix_us.klc"))],
  ["en_dvorak", importCldr("cldr-keyboards-43.0/keyboards/windows/en-t-k0-windows-dvorak.xml")],
  ["en_dvorak_l", importCldr("cldr-keyboards-43.0/keyboards/windows/en-t-k0-windows-dvorakl.xml")],
  ["en_dvorak_prog", importKeymap("layouts/en_dvorak_prog.json")],
  ["en_dvorak_r", importCldr("cldr-keyboards-43.0/keyboards/windows/en-t-k0-windows-dvorakr.xml")],
  ["en_engram", importKlc("layouts/engram.klc")],
  ["en_engrammer", importKlc("layouts/engrammer.klc")],
  ["en_enthium_v6", importKeymap("layouts/enthium_v6.json")],
  ["en_enthium_v10", importKeymap("layouts/enthium_v10.json")],
  ["en_enthium_v11", importKeymap("layouts/enthium_v11.json")],
  ["en_enthium_v13", importKeymap("layouts/enthium_v13.json")],
  ["en_enthium_v14", importKeymap("layouts/enthium_v14.json")],
  ["en_focal", importKeymap("layouts/en_focal.json")],
  ["en_gallium", importKlc("layouts/en_gallium.klc")],
  ["en_gallium_matrix", importKlc("layouts/en_gallium_matrix.klc")],
  ["en_gallium_nl", importKlc("layouts/en_gallium_nl.klc")],
  ["en_graphite", importKeymap("layouts/en_graphite.json")],
  ["en_graphite_angle_kp", importKeymap("layouts/en_graphite_angle_kp.json")],
  ["en_halmak", importKeymap("layouts/en_halmak.json")],
  ["en_hands_down_neu", importKeymap("layouts/en_hands_down_neu.json")],
  ["en_hands_down_promethium", importKeymap("layouts/en_hands_down_promethium.json")],
  ["en_hands_down_promethium_inverted", importKeymap("layouts/en_hands_down_promethium_inverted.json")],
  ["en_kuntem", importKeymap("layouts/en_kuntem.json")],
  ["en_nerps", importKeymap("layouts/en_nerps.json")],
  ["en_nerps_matrix", importKeymap("layouts/en_nerps_matrix.json")],
  ["en_night_matrix", importKeymap("layouts/en_night_matrix.json")],
  ["en_norman", importKeymap("layouts/en_norman.json")],
  ["en_sturdy", importKeymap("layouts/en_sturdy.json")],
  ["en_uk", importCldr("cldr-keyboards-43.0/keyboards/windows/en-GB-t-k0-windows.xml")],
  ["en_us", importCldr("cldr-keyboards-43.0/keyboards/windows/en-t-k0-windows.xml")],
  ["en_workman", importKeymap("layouts/en_workman.json")],
  ["en_workman_prog", importKeymap("layouts/en_workman_prog.json")],
  ["ja_jp_jis", importKeymap("layouts/ja_jp_jis.json")],
  ["zh_tw_dachen", importKeymap("layouts/zh_tw_dachen.json")],
] as [string, CharacterDict][]) {
  writeGeneratedFile(layout, pathTo(`../keybr-keyboard/lib/layout/${id}.ts`));
}

/** Removes dead keys from the given keyboard layout. */
function undead(layout: CharacterDict): CharacterDict {
  return Object.fromEntries(Object.entries(layout).map(([id, [a, b]]) => [id, [a, b]]));
}

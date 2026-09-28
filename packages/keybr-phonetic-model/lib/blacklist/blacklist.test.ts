import { test } from "node:test";
import { Language } from "@keybr/keyboard";
import { isFalse, isTrue } from "rich-assert";
import { getBlacklist } from "./blacklist.ts";

test("forbid blacklisted words", () => {
  const en = getBlacklist(Language.EN);
  const zh = getBlacklist(Language.ZH_TW);

  isTrue(en.allow("LOVE"));
  isTrue(en.allow("love"));
  isFalse(en.allow("FUCK"));
  isFalse(en.allow("fuck"));

  isTrue(zh.allow("LOVE"));
  isTrue(zh.allow("love"));
  isTrue(zh.allow("FUCK"));
  isTrue(zh.allow("fuck"));
});

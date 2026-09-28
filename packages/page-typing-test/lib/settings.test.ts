import { test } from "node:test";
import { Book } from "@keybr/content";
import { Settings } from "@keybr/settings";
import { equal } from "rich-assert";
import { typingTestProps } from "./settings.ts";

test("replace a stored english book with a zhuyin one", () => {
  const settings = new Settings({
    [typingTestProps.book.key]: Book.EN_ALICE_WONDERLAND.id,
  });

  equal(settings.get(typingTestProps.book), Book.ZH_TW_BAIHUA);
});

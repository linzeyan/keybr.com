import { test } from "node:test";
import { Language } from "@keybr/keyboard";
import { deepEqual, isFalse, isTrue } from "rich-assert";
import { Book } from "./book.ts";

test("list only the books which can be typed in a language", () => {
  deepEqual(Book.forLanguage(Language.ZH_TW), [Book.ZH_TW_BAIHUA]);
  isTrue(Book.forLanguage(Language.EN).includes(Book.EN_ALICE_WONDERLAND));
  isFalse(Book.forLanguage(Language.EN).includes(Book.ZH_TW_BAIHUA));
});

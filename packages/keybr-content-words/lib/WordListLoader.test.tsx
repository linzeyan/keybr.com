import { test } from "node:test";
import { type WordList } from "@keybr/content";
import { Language } from "@keybr/keyboard";
import { render } from "@testing-library/react";
import { doesNotInclude, includes } from "rich-assert";
import { WordListLoader } from "./WordListLoader.tsx";

test("load word list", async () => {
  let res = [] as WordList;

  const r = render(
    <WordListLoader language={Language.EN} fallback="fallback">
      {(result) => {
        res = result;
        return <div>english</div>;
      }}
    </WordListLoader>,
  );

  await r.findByText("english");
  includes(res, "mother");
  doesNotInclude(res, "ㄐㄧㄣ ㄊㄧㄢ");

  r.rerender(
    <WordListLoader language={Language.ZH_TW} fallback="fallback">
      {(result) => {
        res = result;
        return <div>zhuyin</div>;
      }}
    </WordListLoader>,
  );

  await r.findByText("zhuyin");
  includes(res, "ㄐㄧㄣ ㄊㄧㄢ");
  doesNotInclude(res, "mother");

  r.unmount();
});

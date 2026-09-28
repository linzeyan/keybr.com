import { test } from "node:test";
import { Book } from "@keybr/content";
import {
  KeyboardContext,
  keyboardProps,
  Language,
  Layout,
  loadKeyboard,
} from "@keybr/keyboard";
import { type BooksLesson, lessonProps, LessonType } from "@keybr/lesson";
import { FakePhoneticModel, type PhoneticModel } from "@keybr/phonetic-model";
import { PhoneticModelLoader } from "@keybr/phonetic-model-loader";
import { FakeSettingsContext, Settings } from "@keybr/settings";
import { render } from "@testing-library/react";
import { equal, includes } from "rich-assert";
import { LessonLoader } from "./LessonLoader.tsx";

test("load", async () => {
  PhoneticModelLoader.loader = FakePhoneticModel.loader;
  const keyboard = loadKeyboard(Layout.EN_US);

  const r = render(
    <FakeSettingsContext initialSettings={new Settings()}>
      <KeyboardContext.Provider value={keyboard}>
        <LessonLoader>
          {({ model }) => <TestChild model={model} />}
        </LessonLoader>
      </KeyboardContext.Provider>
    </FakeSettingsContext>,
  );

  includes((await r.findByTitle("letters")).textContent!, "ABCDEFGHIJ");

  r.unmount();
});

test("replace the default english book for the zhuyin layout", async () => {
  PhoneticModelLoader.loader = FakePhoneticModel.loader;
  const keyboard = loadKeyboard(Layout.ZH_TW_DACHEN);
  const settings = new Settings()
    .set(keyboardProps.language, Language.ZH_TW)
    .set(keyboardProps.layout, Layout.ZH_TW_DACHEN)
    .set(lessonProps.type, LessonType.BOOKS);

  const r = render(
    <FakeSettingsContext initialSettings={settings}>
      <KeyboardContext.Provider value={keyboard}>
        <LessonLoader>
          {(lesson) => (
            <span title="book">{(lesson as BooksLesson).book.id}</span>
          )}
        </LessonLoader>
      </KeyboardContext.Provider>
    </FakeSettingsContext>,
  );

  equal((await r.findByTitle("book")).textContent, Book.ZH_TW_BAIHUA.id);

  r.unmount();
});

function TestChild({ model }: { model: PhoneticModel }) {
  return <span title="letters">{model.letters.map(String).join("")}</span>;
}

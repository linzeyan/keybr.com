import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { keyboardProps, Language } from "@keybr/keyboard";
import { type PageData, PageDataContext } from "@keybr/pages-shared";
import { FakePhoneticModel } from "@keybr/phonetic-model";
import { PhoneticModelLoader } from "@keybr/phonetic-model-loader";
import { FakeResultContext, ResultFaker } from "@keybr/result";
import { FakeSettingsContext, Settings } from "@keybr/settings";
import { fireEvent, render } from "@testing-library/react";
import { PracticePage } from "./PracticePage.tsx";

const faker = new ResultFaker();

test("render", async () => {
  PhoneticModelLoader.loader = FakePhoneticModel.loader;

  const r = render(
    <FakeIntlProvider>
      <PageDataContext.Provider
        value={{ publicUser: { id: "abc" } } as PageData}
      >
        {/* The fake phonetic model knows only English letters. */}
        <FakeSettingsContext
          initialSettings={new Settings().set(
            keyboardProps.language,
            Language.EN,
          )}
        >
          <FakeResultContext initialResults={faker.nextResultList(100)}>
            <PracticePage />
          </FakeResultContext>
        </FakeSettingsContext>
      </PageDataContext.Provider>
    </FakeIntlProvider>,
  );

  fireEvent.click(
    await r.findByTitle("Change lesson settings", { exact: false }),
  );
  fireEvent.click(await r.findByText("Done"));

  r.unmount();
});

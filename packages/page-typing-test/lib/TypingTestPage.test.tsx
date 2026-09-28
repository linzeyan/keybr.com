import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { FakePhoneticModel } from "@keybr/phonetic-model";
import { PhoneticModelLoader } from "@keybr/phonetic-model-loader";
import { FakeSettingsContext } from "@keybr/settings";
import { render } from "@testing-library/react";
import { TypingTestPage } from "./TypingTestPage.tsx";

test("render", () => {
  PhoneticModelLoader.loader = FakePhoneticModel.loader;

  const r = render(
    <FakeIntlProvider>
      <FakeSettingsContext>
        <TypingTestPage />
      </FakeSettingsContext>
    </FakeIntlProvider>,
  );

  r.unmount();
});

import { afterEach, test } from "node:test";
import { FakeIntlProvider, localeChoiceKey } from "@keybr/intl";
import { type PageData, PageDataContext } from "@keybr/pages-shared";
import { fireEvent, render } from "@testing-library/react";
import { equal, isNull } from "rich-assert";
import { LocaleSwitcher } from "./LocaleSwitcher.tsx";

afterEach(() => {
  localStorage.clear();
});

test("switch to the same page in the other language", () => {
  for (const [locale, current, other, href] of [
    ["en", "English", "正體中文", "/zh-tw/help"],
    ["zh-tw", "正體中文", "English", "/help"],
  ]) {
    const r = render(
      <PageDataContext.Provider value={{ locale } as PageData}>
        <FakeIntlProvider>
          <LocaleSwitcher currentPath="/help" />
        </FakeIntlProvider>
      </PageDataContext.Provider>,
    );

    // Every language is named in itself, never by its locale code.
    isNull(r.queryByText("zh-tw"));
    // The current language is marked, and there is nowhere to go from it.
    equal(r.getByText(current).getAttribute("aria-current"), "true");
    isNull(r.getByText(current).closest("a"));
    equal(r.getByText(other).closest("a")?.getAttribute("href"), href);

    r.unmount();
  }
});

test("remember the chosen language", () => {
  const r = render(
    <PageDataContext.Provider value={{ locale: "zh-tw" } as PageData}>
      <FakeIntlProvider>
        <LocaleSwitcher currentPath="/" />
      </FakeIntlProvider>
    </PageDataContext.Provider>,
  );

  // A Chinese browser must not be sent back to Chinese after choosing English.
  isNull(localStorage.getItem(localeChoiceKey));
  fireEvent.click(r.getByText("English"));
  equal(localStorage.getItem(localeChoiceKey), JSON.stringify("en"));

  r.unmount();
});

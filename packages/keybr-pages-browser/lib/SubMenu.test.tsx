import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { PageDataContext } from "@keybr/pages-shared";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { isNotNull, isNull } from "rich-assert";
import { SubMenu } from "./SubMenu.tsx";

test("render", () => {
  const r = render(
    <PageDataContext.Provider
      value={{
        base: "https://www.keybr.com/",
        locale: "en",
        user: null,
        publicUser: {
          id: "userId",
          name: "userName",
          imageUrl: "imageUrl",
        },
        settings: null,
      }}
    >
      <FakeIntlProvider>
        <MemoryRouter>
          <SubMenu currentPath="/page" />
        </MemoryRouter>
      </FakeIntlProvider>
    </PageDataContext.Provider>,
  );

  // Every language is named in itself, never by its locale code.
  isNotNull(r.queryByText("中文（台灣）"));
  isNotNull(r.queryByText("English"));
  isNull(r.queryByText("zh-tw"));

  r.unmount();
});

import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { PageDataContext } from "@keybr/pages-shared";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { equal } from "rich-assert";
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
          <SubMenu />
        </MemoryRouter>
      </FakeIntlProvider>
    </PageDataContext.Provider>,
  );

  // The AGPL asks the site to offer its source code to every visitor.
  equal(
    r.getByText("Github").closest("a")?.getAttribute("href"),
    "https://github.com/linzeyan/keybr.com",
  );

  r.unmount();
});

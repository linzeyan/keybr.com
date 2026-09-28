import { test } from "node:test";
import { FakeIntlProvider } from "@keybr/intl";
import { PageDataContext } from "@keybr/pages-shared";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { equal, isNotNull } from "rich-assert";
import { NavMenu } from "./NavMenu.tsx";

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
          <NavMenu currentPath="/page" />
        </MemoryRouter>
      </FakeIntlProvider>
    </PageDataContext.Provider>,
  );

  isNotNull(r.queryByText("userName"));
  isNotNull(r.queryByText("中文（台灣）"));
  isNotNull(r.queryByText("English"));

  r.unmount();
});

test("offer to sign in only when there is a server", () => {
  for (const staticSite of [false, true]) {
    const r = render(
      <PageDataContext.Provider
        value={{
          base: "https://www.keybr.com/",
          locale: "en",
          user: null,
          publicUser: {
            id: null,
            name: "name",
            imageUrl: null,
          },
          settings: null,
          staticSite,
        }}
      >
        <FakeIntlProvider>
          <MemoryRouter>
            <NavMenu currentPath="/page" />
          </MemoryRouter>
        </FakeIntlProvider>
      </PageDataContext.Provider>,
    );

    equal(r.queryByText("Sign-In") != null, !staticSite);
    isNotNull(r.queryByText("Practice"));

    r.unmount();
  }
});

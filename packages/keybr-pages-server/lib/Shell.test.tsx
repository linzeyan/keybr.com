import { test } from "node:test";
import { type IncomingHeaders } from "@fastr/headers";
import { Manifest, ManifestContext } from "@keybr/assets";
import { FakeIntlProvider } from "@keybr/intl";
import { PageDataContext, Pages } from "@keybr/pages-shared";
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { deepEqual, equal, like } from "rich-assert";
import { Shell } from "./Shell.tsx";

test("render", () => {
  const html = renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
      <PageDataContext.Provider
        value={{
          base: "https://keybr.example/",
          locale: "en",
          user: null,
          publicUser: {
            id: null,
            name: "name",
            imageUrl: null,
          },
          settings: null,
        }}
      >
        <FakeIntlProvider>
          <Shell page={Pages.practice} headers={fakeHeaders()} />
        </FakeIntlProvider>
      </PageDataContext.Provider>
    </ManifestContext.Provider>,
  );

  const $ = load(html);

  like($("html").attr(), {
    "prefix": "og: http://ogp.me/ns#",
    "lang": "en",
    "dir": "ltr",
    "data-color": "system",
    "data-font": "open-sans",
  });
  equal($("nav").length, 0);
  // Open Graph links must point at this deployment, not at upstream.
  equal($('meta[property="og:url"]').attr("content"), "https://keybr.example/");
  equal(
    $('meta[property="og:image"]').attr("content"),
    "https://keybr.example/cover.png",
  );
});

test("render for a bot", () => {
  const html = renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
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
        }}
      >
        <FakeIntlProvider>
          <Shell
            page={Pages.practice}
            headers={fakeHeaders({ useragent: "Googlebot" })}
          />
        </FakeIntlProvider>
      </PageDataContext.Provider>
    </ManifestContext.Provider>,
  );

  const $ = load(html);

  like($("html").attr(), {
    "prefix": "og: http://ogp.me/ns#",
    "lang": "en",
    "dir": "ltr",
    "data-color": "system",
    "data-font": "open-sans",
  });
  equal($("nav").length, 1);
});

test("apply the stored theme on a static site", () => {
  const html = renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
      <PageDataContext.Provider
        value={{
          base: "https://keybr.example/",
          locale: "en",
          user: null,
          publicUser: {
            id: null,
            name: "name",
            imageUrl: null,
          },
          settings: null,
          staticSite: true,
        }}
      >
        <FakeIntlProvider>
          <Shell page={Pages.practice} headers={fakeHeaders()} />
        </FakeIntlProvider>
      </PageDataContext.Provider>
    </ManifestContext.Provider>,
  );

  // No server renders the stored theme into a static page, and the browser
  // app does not apply it either, so the page must do it on its own.
  const script = load(html)("head > script").first().html() ?? "";
  const attributes = new Map<string, string>();
  const document = {
    cookie:
      "other=1; prefs=" +
      encodeURIComponent(
        JSON.stringify({ color: "dark", font: "no-such-font" }),
      ),
    documentElement: {
      setAttribute: (name: string, value: string) => {
        attributes.set(name, value);
      },
    },
  };
  new Function("document", script)(document);
  deepEqual([...attributes], [["data-color", "dark"]]);
});

function fakeHeaders(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  return {
    get(name) {
      return map.get(name.toLowerCase()) ?? null;
    },
  } as IncomingHeaders;
}

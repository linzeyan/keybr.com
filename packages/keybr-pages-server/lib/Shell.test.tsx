import { test } from "node:test";
import { type IncomingHeaders } from "@fastr/headers";
import { Manifest, ManifestContext } from "@keybr/assets";
import { FakeIntlProvider, localeChoiceKey } from "@keybr/intl";
import { PageDataContext, Pages } from "@keybr/pages-shared";
import { load } from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";
import { deepEqual, equal, isEmpty, like } from "rich-assert";
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
  const script = findScript(html, "document.cookie");
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

test("send the visitor to the page in their language", () => {
  const script = findScript(renderPage("en"), localeChoiceKey);
  const run = (
    pathname: string,
    languages: readonly string[],
    stored: string | null = null,
  ) => {
    let target: string | null = null;
    new Function("localStorage", "navigator", "location", script)(
      { getItem: (key: string) => (key === localeChoiceKey ? stored : null) },
      { languages },
      {
        pathname,
        search: "?q=1",
        hash: "#h",
        replace: (url: string) => {
          target = url;
        },
      },
    );
    return target;
  };

  // Nothing chosen yet, the first language of the browser that we have wins.
  equal(run("/", ["zh-TW", "en"]), "/zh-tw?q=1#h");
  equal(run("/help", ["ja", "zh-Hant", "en"]), "/zh-tw/help?q=1#h");
  equal(run("/help", ["ja", "en-US", "zh-TW"]), null);
  equal(run("/help", ["fr"]), null);
  // The last choice beats the browser, in both directions.
  equal(run("/help", ["zh-TW"], JSON.stringify("en")), null);
  equal(run("/help", ["en-US"], JSON.stringify("zh-tw")), "/zh-tw/help?q=1#h");
  equal(run("/help", ["zh-TW"], JSON.stringify("xx")), "/zh-tw/help?q=1#h");
  // The static site serves unknown paths with the default page, even the
  // ones which already have a locale, redirecting them would never end.
  equal(run("/zh-tw/account", ["zh-TW"]), null);
});

test("stay on a page which is already in some language", () => {
  const $ = load(renderPage("zh-tw"));
  isEmpty(
    $("head > script")
      .toArray()
      .filter((element) => ($(element).html() ?? "").includes(localeChoiceKey)),
  );
});

function renderPage(locale: string) {
  return renderToStaticMarkup(
    <ManifestContext.Provider value={Manifest.fake}>
      <PageDataContext.Provider
        value={{
          base: "https://keybr.example/",
          locale,
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
}

function findScript(html: string, content: string): string {
  const $ = load(html);
  const scripts = $("head > script")
    .toArray()
    .map((element) => $(element).html() ?? "")
    .filter((script) => script.includes(content));
  equal(scripts.length, 1);
  return scripts[0];
}

function fakeHeaders(entries: Record<string, string> = {}) {
  const map = new Map(Object.entries(entries));
  return {
    get(name) {
      return map.get(name.toLowerCase()) ?? null;
    },
  } as IncomingHeaders;
}

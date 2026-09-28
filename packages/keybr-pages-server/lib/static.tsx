// A webpack entry point which pre-renders the pages for static hosting,
// such as Cloudflare Pages. See `PageData.staticSite`.
//
// Usage: APP_URL=<site url> node static.js <public dir> <output dir>

import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type IncomingHeaders } from "@fastr/headers";
import { loadManifestSync } from "@keybr/assets";
import { allLocales, loadIntl } from "@keybr/intl";
import {
  type PageData,
  PageDataContext,
  type PageInfo,
  Pages,
} from "@keybr/pages-shared";
import { staticTheme, ThemeContext, ThemePrefs } from "@keybr/themes";
import { RawIntlProvider } from "react-intl";
import { Shell } from "./Shell.tsx";
import { View } from "./view.tsx";

// The account page needs a server. Public profiles need a server too, the
// single-page app fallback shows whatever it can for any other path.
const pages: readonly PageInfo[] = [
  Pages.practice,
  Pages.profile,
  Pages.typingTest,
  Pages.layouts,
  Pages.help,
];

async function main() {
  const [publicDir, outDir] = process.argv.slice(2);
  const base = process.env.APP_URL;
  if (!publicDir || !outDir || !base) {
    throw new Error(
      "Usage: APP_URL=<site url> node static.js <public dir> <output dir>",
    );
  }
  const view = new View(
    loadManifestSync(join(publicDir, "assets", "manifest.json")),
  );
  // Every visitor gets the same page, so there is no user agent to look at,
  // and the stored theme is applied in the browser.
  const headers = { get: () => null } as unknown as IncomingHeaders;
  const theme = staticTheme(new ThemePrefs(null));
  rmSync(outDir, { recursive: true, force: true });
  cpSync(publicDir, outDir, { recursive: true });
  for (const locale of allLocales) {
    const intl = await loadIntl(locale);
    const pageData: PageData = {
      base,
      locale,
      user: null,
      publicUser: { id: null, name: "Anonymous", imageUrl: null },
      settings: null,
      staticSite: true,
    };
    for (const page of pages) {
      const file = join(outDir, htmlPath(Pages.intlPath(page.path, locale)));
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(
        file,
        view.renderPage(
          <RawIntlProvider value={intl}>
            <PageDataContext.Provider value={pageData}>
              <ThemeContext.Provider value={theme}>
                <Shell page={page} headers={headers} />
              </ThemeContext.Provider>
            </PageDataContext.Provider>
          </RawIntlProvider>,
        ),
      );
    }
  }
}

// Cloudflare Pages serves "/help" from "help.html" as is, but redirects it
// to "/help/" when the file is "help/index.html".
function htmlPath(path: string): string {
  return path === "/" ? "index.html" : `${path.substring(1)}.html`;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

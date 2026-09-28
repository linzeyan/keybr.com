import { type IncomingHeaders } from "@fastr/headers";
import { FavIconAssets, ScriptAssets, StylesheetAssets } from "@keybr/assets";
import { getDir } from "@keybr/intl";
import {
  LoadingProgress,
  PageDataScript,
  type PageInfo,
  Pages,
  Root,
  usePageData,
} from "@keybr/pages-shared";
import { COLORS, FONTS, ThemePrefs, useTheme } from "@keybr/themes";
import { type ReactNode } from "react";
import { useIntl } from "react-intl";
import { isBot } from "./bot.ts";
import { AltLangLinks, favIcons, Metas } from "./meta.tsx";

export function Shell({
  page,
  headers,
}: {
  readonly page: PageInfo;
  readonly headers: IncomingHeaders;
}) {
  return (
    <Html>
      <Head page={page} />
      <Body>
        {isBot(headers) ? <Content page={page} /> : <LoadingProgress />}
      </Body>
    </Html>
  );
}

function Html({ children }: { readonly children?: ReactNode }) {
  const { locale } = usePageData();
  const theme = useTheme();
  return (
    <html
      lang={locale}
      dir={getDir(locale)}
      prefix="og: http://ogp.me/ns#"
      {...ThemePrefs.dataAttributes(theme)}
    >
      {children}
    </html>
  );
}

function Head({
  page,
  children,
}: {
  readonly page: PageInfo;
  readonly children?: ReactNode;
}) {
  const { formatMessage } = useIntl();
  const { staticSite } = usePageData();
  return (
    <head>
      <meta charSet="UTF-8" />
      {staticSite && <ThemeScript />}
      <title>{formatMessage(page.title)}</title>
      <StylesheetAssets entrypoint="browser" />
      <FavIconAssets links={favIcons} />
      <AltLangLinks page={page} />
      <Metas page={page} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <PageDataScript />
      <ScriptAssets entrypoint="browser" />
      {children}
    </head>
  );
}

/**
 * The server renders the stored theme into the page, the browser app never
 * applies it on start. With no server, apply it before the first paint.
 * Unknown ids keep the default, like in `ThemePrefs`.
 */
function ThemeScript() {
  const ids = (list: Iterable<{ readonly id: string }>) =>
    JSON.stringify(Array.from(list, ({ id }) => id));
  const script =
    `try{` +
    `var m=document.cookie.match(/(?:^|; )${ThemePrefs.cookieKey}=([^;]*)/);` +
    `if(m){` +
    `var p=JSON.parse(decodeURIComponent(m[1])),e=document.documentElement;` +
    `if(${ids(COLORS)}.indexOf(p.color)>=0)` +
    `e.setAttribute("${ThemePrefs.colorAttrName}",p.color);` +
    `if(${ids(FONTS)}.indexOf(p.font)>=0)` +
    `e.setAttribute("${ThemePrefs.fontAttrName}",p.font);` +
    `}` +
    `}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

function Body({ children }: { readonly children?: ReactNode }) {
  return (
    <body>
      <Root>{children}</Root>
    </body>
  );
}

function Content({ page }: { readonly page: PageInfo }) {
  const { formatMessage, locale } = useIntl();
  return (
    <>
      <h1>{formatMessage(page.link.label)}</h1>
      {page.link.title && <p>{formatMessage(page.link.title)}</p>}
      <nav>
        <ul>
          {[
            Pages.practice,
            Pages.profile,
            Pages.typingTest,
            Pages.layouts,
            Pages.help,
          ].map(({ path, link }, index) => (
            <li key={index}>
              <a
                href={Pages.intlPath(path, locale)}
                title={link.title && formatMessage(link.title)}
              >
                {formatMessage(link.label)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

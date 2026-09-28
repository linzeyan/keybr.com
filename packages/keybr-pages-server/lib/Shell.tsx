import { type IncomingHeaders } from "@fastr/headers";
import { FavIconAssets, ScriptAssets, StylesheetAssets } from "@keybr/assets";
import {
  allLocales,
  defaultLocale,
  getDir,
  localeChoiceKey,
} from "@keybr/intl";
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
  const { locale, staticSite } = usePageData();
  return (
    <head>
      <meta charSet="UTF-8" />
      {locale === defaultLocale && <LocaleScript />}
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
 * A path without a locale is a page in the default language. Before anything
 * loads, send the visitor to the same page in their language instead: the one
 * they chose last with `LocaleSwitcher`, or else the first language of their
 * browser which the site has. The static site has no server to do this.
 */
function LocaleScript() {
  const others = allLocales.filter((locale) => locale !== defaultLocale);
  const languages = allLocales.map((locale) => [locale.split("-")[0], locale]);
  const script =
    `try{` +
    `var c=JSON.parse(localStorage.getItem(${JSON.stringify(localeChoiceKey)})||"null"),` +
    `o=${JSON.stringify(others)},m=${JSON.stringify(languages)},` +
    `n=navigator.languages||[navigator.language],p=location.pathname,i,j;` +
    `if(c!==${JSON.stringify(defaultLocale)}&&o.indexOf(c)<0)c=null;` +
    `for(i=0;c==null&&i<n.length;i++)` +
    `for(j=0;j<m.length;j++)` +
    `if(String(n[i]).toLowerCase().split("-")[0]===m[j][0]){c=m[j][1];break}` +
    // A path with a locale gets here only by the single-page app fallback of
    // the static site, redirecting it again would never end.
    `if(o.indexOf(c)>=0&&!o.some(function(x){return p==="/"+x||p.indexOf("/"+x+"/")===0}))` +
    `location.replace("/"+c+(p==="/"?"":p)+location.search+location.hash);` +
    `}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
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

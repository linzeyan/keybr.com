import { allLocales, localeChoiceKey, useIntlDisplayNames } from "@keybr/intl";
import { Pages, usePageData } from "@keybr/pages-shared";
import { clsx } from "clsx";
import * as styles from "./LocaleSwitcher.module.less";

export function LocaleSwitcher({
  currentPath,
}: {
  readonly currentPath: string;
}) {
  const { locale } = usePageData();
  const { formatLocalLanguageName } = useIntlDisplayNames();
  return (
    <div className={styles.root}>
      {allLocales.map((item) =>
        item === locale ? (
          <span
            key={item}
            className={clsx(styles.item, styles.isActive)}
            lang={item}
            aria-current="true"
          >
            {formatLocalLanguageName(item)}
          </span>
        ) : (
          <a
            key={item}
            className={styles.item}
            href={Pages.intlPath(currentPath, item)}
            hrefLang={item}
            lang={item}
            onClick={() => {
              saveChoice(item);
            }}
          >
            {formatLocalLanguageName(item)}
          </a>
        ),
      )}
    </div>
  );
}

// Once chosen, the language no longer follows the browser language on the
// pages without a locale in their path, see `LocaleScript`.
function saveChoice(locale: string): void {
  try {
    localStorage.setItem(localeChoiceKey, JSON.stringify(locale));
  } catch {
    // Without storage the browser language keeps deciding.
  }
}

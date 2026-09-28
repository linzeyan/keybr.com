import { type IntlShape, useIntl } from "react-intl";
import { intlMemo } from "./memo.ts";

export type IntlDisplayNames = {
  formatRegionName(id: string): string;
  formatLanguageName(id: string): string;
  formatLocalLanguageName(id: string): string;
};

const capitalize = (value: string, locale: string): string =>
  value.replaceAll(
    /\p{Letter}+/gu,
    (word) =>
      word.substring(0, 1).toLocaleUpperCase(locale) +
      word.substring(1).toLocaleLowerCase(locale),
  );

// The two languages of this site are always named in themselves, whatever
// the language of the interface is, so that everybody finds their own.
const ownNames = new Map([
  ["en", "English"],
  ["zh-tw", "正體中文"],
]);

const factory = (intl: IntlShape): IntlDisplayNames => {
  const { locale } = intl;
  const formatRegionName = (id: string): string => {
    const dn = intl.formatters.getDisplayNames(locale, {
      type: "region",
      fallback: "none",
    });
    return capitalize(dn.of(id) || "", locale) || id;
  };
  const formatLanguageName = (id: string): string => {
    const ownName = ownNames.get(id.toLowerCase());
    if (ownName != null) {
      return ownName;
    }
    const dn = intl.formatters.getDisplayNames(locale, {
      type: "language",
      fallback: "none",
    });
    return capitalize(dn.of(id) || "", locale) || id;
  };
  const formatLocalLanguageName = (id: string): string => {
    const ownName = ownNames.get(id.toLowerCase());
    if (ownName != null) {
      return ownName;
    }
    const dn = intl.formatters.getDisplayNames(id, {
      type: "language",
      fallback: "none",
    });
    return capitalize(dn.of(id) || "", id) || id;
  };
  return {
    formatRegionName,
    formatLanguageName,
    formatLocalLanguageName,
  };
};

export const makeIntlDisplayNames = intlMemo(Symbol("displayNames"), factory);

export const useIntlDisplayNames = (): IntlDisplayNames => {
  return makeIntlDisplayNames(useIntl());
};

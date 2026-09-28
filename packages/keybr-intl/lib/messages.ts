import { type LocaleId } from "./locale.ts";

export type Messages = Record<string, string | any>;

export async function loadMessages(locale: LocaleId): Promise<Messages> {
  switch (locale) {
    case "en":
      return (
        await import(
          /* webpackChunkName: "messages-en" */ "./messages/en.json",
          { with: { type: "json" } }
        )
      ).default;
    case "zh-tw":
      return (
        await import(
          /* webpackChunkName: "messages-zh-tw" */ "./messages/zh-tw.json",
          { with: { type: "json" } }
        )
      ).default;
    default:
      throw new Error(
        process.env.NODE_ENV !== "production"
          ? `Unknown locale [${locale}]`
          : undefined,
      );
  }
}

import { Book, type Content } from "@keybr/content";

export async function loadContent(book: Book): Promise<Content> {
  switch (book) {
    case Book.EN_ALICE_WONDERLAND:
      return (
        await import(
          /* webpackChunkName: "book-en-alice-wonderland" */
          "./data/en-alice-wonderland.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.EN_JEKYLL_HYDE:
      return (
        await import(
          /* webpackChunkName: "book-en-jekyll-hyde" */
          "./data/en-jekyll-hyde.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.EN_CALL_WILD:
      return (
        await import(
          /* webpackChunkName: "book-en-call-wild" */
          "./data/en-call-wild.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.ZH_TW_BAIHUA:
      return (
        await import(
          /* webpackChunkName: "book-zh-tw-baihua" */
          "./data/zh-tw-baihua.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.ZH_TW_NAHAN:
      return (
        await import(
          /* webpackChunkName: "book-zh-tw-nahan" */
          "./data/zh-tw-nahan.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.ZH_TW_PANGHUANG:
      return (
        await import(
          /* webpackChunkName: "book-zh-tw-panghuang" */
          "./data/zh-tw-panghuang.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.ZH_TW_ZHAOHUA:
      return (
        await import(
          /* webpackChunkName: "book-zh-tw-zhaohua" */
          "./data/zh-tw-zhaohua.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.ZH_TW_XINSHI:
      return (
        await import(
          /* webpackChunkName: "book-zh-tw-xinshi" */
          "./data/zh-tw-xinshi.json",
          { with: { type: "json" } }
        )
      ).default as any;
    case Book.ZH_TW_CLASSICS:
      return (
        await import(
          /* webpackChunkName: "book-zh-tw-classics" */
          "./data/zh-tw-classics.json",
          { with: { type: "json" } }
        )
      ).default as any;
    default:
      throw new Error();
  }
}

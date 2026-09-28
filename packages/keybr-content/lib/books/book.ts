import { Language } from "@keybr/keyboard";
import { Enum, type EnumItem } from "@keybr/lang";
import coverImageEnAliceWonderland from "../../assets/cover-image-en-alice-wonderland.jpg";
import coverImageEnCallWild from "../../assets/cover-image-en-call-wild.jpg";
import coverImageEnJekyllHyde from "../../assets/cover-image-en-jekyll-hyde.jpg";
import coverImageZhTwBaihua from "../../assets/cover-image-zh-tw-baihua.jpg";

export class Book implements EnumItem {
  static readonly EN_ALICE_WONDERLAND = new Book(
    /* id= */ "en-alice-wonderland",
    /* language= */ Language.EN,
    /* title= */ "Alice’s Adventures in Wonderland",
    /* author= */ "Lewis Carroll",
    /* coverImage= */ coverImageEnAliceWonderland,
  );
  static readonly EN_JEKYLL_HYDE = new Book(
    /* id= */ "en-jekyll-hyde",
    /* language= */ Language.EN,
    /* title= */ "The Strange Case Of Dr. Jekyll And Mr. Hyde",
    /* author= */ "Robert Louis Stevenson",
    /* coverImage= */ coverImageEnJekyllHyde,
  );
  static readonly EN_CALL_WILD = new Book(
    /* id= */ "en-call-wild",
    /* language= */ Language.EN,
    /* title= */ "The Call of the Wild",
    /* author= */ "Jack London",
    /* coverImage= */ coverImageEnCallWild,
  );
  static readonly ZH_TW_BAIHUA = new Book(
    /* id= */ "zh-tw-baihua",
    /* language= */ Language.ZH_TW,
    /* title= */ "白話文選",
    /* author= */ "朱自清、許地山、胡適、魯迅",
    /* coverImage= */ coverImageZhTwBaihua,
  );

  static readonly ALL = new Enum<Book>(
    Book.EN_ALICE_WONDERLAND,
    Book.EN_JEKYLL_HYDE,
    Book.EN_CALL_WILD,
    Book.ZH_TW_BAIHUA,
  );

  /** Returns the books which can be typed in the given language. */
  static forLanguage(language: Language): Book[] {
    // The Zhuyin layout types nothing but Zhuyin, and vice versa.
    const zhuyin = language.script === "bopomofo";
    return Book.ALL.filter(
      (book) => (book.language.script === "bopomofo") === zhuyin,
    );
  }

  private constructor(
    readonly id: string,
    readonly language: Language,
    readonly title: string,
    readonly author: string,
    readonly coverImage: string,
  ) {
    Object.freeze(this);
  }

  toString() {
    return this.id;
  }

  toJSON() {
    return this.id;
  }
}

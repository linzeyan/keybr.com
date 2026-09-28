import { Language } from "@keybr/keyboard";
import EN from "@keybr/phonetic-model/assets/model-en.data";
import ZH_TW from "@keybr/phonetic-model/assets/model-zh-TW.data";

export function modelAssetPath(language: Language): string {
  switch (language) {
    case Language.EN:
      return EN;
    case Language.ZH_TW:
      return ZH_TW;
    default:
      throw new Error();
  }
}

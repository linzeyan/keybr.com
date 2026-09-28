import { KeyboardContext, Layout, loadKeyboard } from "@keybr/keyboard";
import { ViewSwitch } from "@keybr/widget";
import { useMemo } from "react";
import { views } from "./views.tsx";

export function TypingTestPage() {
  // The typing test is in Zhuyin only, whatever the layout of the lessons.
  const keyboard = useMemo(() => loadKeyboard(Layout.ZH_TW_DACHEN), []);
  return (
    <KeyboardContext.Provider value={keyboard}>
      <ViewSwitch views={views} />
    </KeyboardContext.Provider>
  );
}

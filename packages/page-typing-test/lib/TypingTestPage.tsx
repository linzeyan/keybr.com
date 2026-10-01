import {
  KeyboardContext,
  KeyboardOptions,
  keyboardProps,
  loadKeyboard,
} from "@keybr/keyboard";
import { useSettings } from "@keybr/settings";
import { ViewSwitch } from "@keybr/widget";
import { useMemo } from "react";
import { views } from "./views.tsx";

export function TypingTestPage() {
  const { settings } = useSettings();
  const ime = settings.get(keyboardProps.ime);
  // The typing test is in Zhuyin only, whatever the layout of the lessons.
  const keyboard = useMemo(
    () => loadKeyboard(KeyboardOptions.default().withIme(ime)),
    [ime],
  );
  return (
    <KeyboardContext.Provider value={keyboard}>
      <ViewSwitch views={views} />
    </KeyboardContext.Provider>
  );
}

import { TypingTestPage } from "@keybr/page-typing-test";
import { ResultLoader } from "@keybr/result-loader";

export default function Page() {
  return (
    <ResultLoader>
      <TypingTestPage />
    </ResultLoader>
  );
}

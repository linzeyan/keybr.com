import { Link as StaticLink } from "@keybr/widget";
import { useIntl } from "react-intl";
import * as styles from "./SubMenu.module.less";

export function SubMenu() {
  return (
    <div className={styles.root}>
      <GithubLink />
    </div>
  );
}

function GithubLink() {
  const { formatMessage } = useIntl();
  return (
    <StaticLink
      href="https://github.com/linzeyan/keybr.com"
      target="github"
      title={formatMessage({
        id: "footer.githubLink.description",
        defaultMessage: "The source code of keybr.com is available on Github.",
      })}
    >
      Github
    </StaticLink>
  );
}

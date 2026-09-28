import { type LocaleId } from "@keybr/intl";

export type PageData = {
  /**
   * Base URL.
   */
  readonly base: string;
  /**
   * Active locale identifier.
   */
  readonly locale: LocaleId;
  /**
   * The full details about the currently authenticated user, which include
   * private information such as email, or null if the anonymous is anonymous.
   *
   * This is only visible to the authenticated user.
   */
  readonly user: UserDetails | null;
  /**
   * The current user as is visible to the public.
   *
   * This value does not include any user private information.
   *
   * If the current user is authenticated, then this value is derived from the
   * available user details, or can be anonymized on demand of the user.
   *
   * If the current user is anonymous, then this value is automatically
   * generated.
   */
  readonly publicUser: AnyUser;
  /**
   * Serialized user settings.
   */
  readonly settings: unknown | null;
  /**
   * Whether the page was pre-rendered for static hosting. There is no server
   * then, hence no accounts, and all user data stays in the browser storage.
   */
  readonly staticSite?: boolean;
};

export type UserDetails = {
  /**
   * Unique id.
   */
  readonly id: string;
  /**
   * Unique e-mail.
   */
  readonly email: string;
  /**
   * User name.
   */
  readonly name: string;
  /**
   * Whether the user name is anonymized.
   */
  readonly anonymized: boolean;
  /**
   * Timestamp.
   */
  readonly createdAt: string | Date;
};

export type AnonymousUser = {
  /**
   * Anonymous user id.
   */
  readonly id: null;
  /**
   * Anonymous user name.
   */
  readonly name: string;
  /**
   * Image url for avatar.
   */
  readonly imageUrl: null;
};

export type NamedUser = {
  /**
   * Unique user id.
   */
  readonly id: string;
  /**
   * Non-unique user name.
   */
  readonly name: string;
  /**
   * Image url for avatar.
   */
  readonly imageUrl: string | null;
};

export type AnyUser = AnonymousUser | NamedUser;

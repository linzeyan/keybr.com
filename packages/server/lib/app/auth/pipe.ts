import { type Context } from "@fastr/core";
import { NotFoundError } from "@fastr/errors";
import { type RouterState } from "@fastr/middleware-router";
import { User } from "@keybr/database";
import { type NamedUser } from "@keybr/pages-shared";
import { PublicId } from "@keybr/publicid";

export const pProfileOwner = async (
  ctx: Context<RouterState>,
  value: string,
): Promise<NamedUser> => {
  const publicId = PublicId.parse(value);
  if (publicId != null) {
    const profileOwner = await User.loadProfileOwner(publicId);
    if (profileOwner != null) {
      return profileOwner;
    }
  }
  throw new NotFoundError();
};

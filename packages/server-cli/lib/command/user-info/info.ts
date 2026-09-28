import { type User } from "@keybr/database";
import { PublicId } from "@keybr/publicid";

export function userToInfo(model?: User | null): unknown {
  if (model == null) {
    return null;
  }
  const { id, email, name, createdAt } = model;
  const publicId = String(new PublicId(id!));
  return { id, publicId, email, name, createdAt };
}

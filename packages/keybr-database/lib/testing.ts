import { after, before, beforeEach } from "node:test";
import { makeKnex } from "@keybr/config";
import { Model } from "objection";
import { User, UserLoginRequest } from "./model.ts";
import { createSchema } from "./schema.ts";

export function useDatabase() {
  const knex = makeKnex();

  before(async () => {
    await createSchema(knex);
  });

  beforeEach(async () => {
    await clearTables();
    await seedModels();
  });

  after(async () => {
    await knex.destroy();
  });
}

export async function seedModels() {
  await User.query().delete();
  await User.query().insertGraph([
    {
      email: "user1@keybr.com",
      name: "user1",
      createdAt: new Date("2001-02-03T04:05:06Z"),
    } as User,
    {
      email: "user2@keybr.com",
      name: "user2",
      createdAt: new Date("2001-02-03T04:05:06Z"),
    } as User,
    {
      email: "user3@keybr.com",
      name: "user3",
      createdAt: new Date("2001-02-03T04:05:06Z"),
    } as User,
  ]);
}

export async function clearTables() {
  await clearTable(UserLoginRequest.tableName);
  await clearTable(User.tableName);
}

export async function clearTable(name: string) {
  const knex = Model.knex();
  const tpl = (sql: string) => {
    return sql.replaceAll("{name}", name);
  };
  await knex.raw(tpl("DELETE FROM `{name}`"));
  switch (knex.client.config.__client) {
    case "mysql":
      await knex.raw(tpl("ALTER TABLE `{name}` AUTO_INCREMENT = 1"));
      break;
    case "sqlite":
      await knex.raw(
        tpl("UPDATE `sqlite_sequence` SET `seq` = 0 WHERE `name` = '{name}';"),
      );
      break;
  }
}

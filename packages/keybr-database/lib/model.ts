import {
  type AnonymousUser,
  type AnyUser,
  type NamedUser,
  type UserDetails,
} from "@keybr/pages-shared";
import { PublicId } from "@keybr/publicid";
import { type Knex } from "knex";
import { type JSONSchema, Model, type Pojo, snakeCaseMappers } from "objection";
import { anonymousName } from "./name.ts";
import { Random } from "./util.ts";

export function TimestampMixin(superClass: typeof Model): typeof Model {
  return class extends superClass implements Model {
    createdAt?: Date;

    override $beforeInsert(): void {
      if (this.createdAt == null) {
        this.createdAt = new Date();
      }
    }
  };
}

export class User extends TimestampMixin(Model) {
  static override readonly tableName = "user";
  static override readonly columnNameMappers = snakeCaseMappers();
  static override jsonSchema = {
    type: "object",
    required: ["email", "name"],
    properties: {
      id: { type: "integer" },
      email: { type: "string", minLength: 1, maxLength: 64 },
      name: { type: "string", minLength: 1, maxLength: 32 },
    },
  } satisfies JSONSchema;

  static createTable(knex: Knex, table: Knex.CreateTableBuilder) {
    const { email, name } = User.jsonSchema.properties;
    table.increments("id").primary();
    table.string("email", email.maxLength).notNullable();
    table.string("name", name.maxLength).notNullable();
    table.boolean("anonymized").notNullable().defaultTo(false);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["email"]);
    table.unique(["name"]);
  }

  readonly id?: number;
  email?: string;
  name?: string;
  anonymized?: number;
  createdAt?: Date;

  static async loadProfileOwner(publicId: PublicId): Promise<NamedUser | null> {
    if (publicId.example) {
      return publicId.toUser();
    }
    const user = await User.findById(publicId.id);
    if (user != null) {
      return User.toPublicUser(user, 0);
    }
    return null;
  }

  static async findById(id: number): Promise<User | null> {
    return (await User.query().findOne({ id })) ?? null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    return (await User.query().findOne({ email })) ?? null;
  }

  static async login(email: string): Promise<User> {
    let user = await User.findByEmail(email);
    if (user == null) {
      const name = await User.findUniqueName(email, email);
      user = await User.query().insertAndFetch({ email, name });
    }
    return user;
  }

  static async findUniqueName(
    email: string | null,
    hint: string,
  ): Promise<string> {
    for (const candidate of candidates(hint)) {
      if (!(await User.nameExists(email, candidate))) {
        return candidate;
      }
    }
    throw new Error(); // Unreachable.

    function* candidates(hint: string, length: number = 32): Iterable<string> {
      let name = hint;
      const pos = hint.indexOf("@");
      if (pos !== -1) {
        name = hint.substring(0, pos);
      }
      name = name.substring(0, length);
      // Try original name.
      yield name;
      // Try name with numeric suffix.
      for (let index = 0; index < 10; index++) {
        const suffix = String(index + 1);
        yield name.substring(0, length - suffix.length) + suffix;
      }
      // Try name with random suffix.
      for (let index = 0; index < 10; index++) {
        const suffix = Random.string(10);
        yield name.substring(0, length - suffix.length) + suffix;
      }
    }
  }

  static async nameExists(
    email: string | null,
    name: string,
  ): Promise<boolean> {
    if (email != null) {
      return (await User.query().whereNot({ email }).findOne({ name })) != null;
    } else {
      return (await User.query().findOne({ name })) != null;
    }
  }

  toDetails(): UserDetails {
    return {
      id: String(new PublicId(this.id!)),
      email: this.email!,
      name: this.name!,
      anonymized: Boolean(this.anonymized!),
      createdAt: this.createdAt!,
    };
  }

  static toPublicUser(user: null, hint: number | string): AnonymousUser;
  static toPublicUser(user: User, hint: number | string): NamedUser;
  static toPublicUser(user: User | null, hint: number | string): AnyUser;
  static toPublicUser(user: User | null, hint: number | string): AnyUser {
    if (user != null) {
      // Handle authenticated user.
      const details = user.toDetails();
      return Object.freeze<NamedUser>({
        id: details.id,
        name: user.anonymized ? anonymousName(details.email) : details.name,
        imageUrl: null,
      });
    } else {
      // Handle anonymous user.
      return Object.freeze<AnonymousUser>({
        id: null,
        name: anonymousName(hint),
        imageUrl: null,
      });
    }
  }
}

export class UserLoginRequest extends TimestampMixin(Model) {
  static override readonly tableName = "user_login_request";
  static override readonly columnNameMappers = snakeCaseMappers();
  static override jsonSchema = {
    type: "object",
    required: ["email", "accessToken"],
    properties: {
      id: { type: "integer" },
      email: { type: "string", minLength: 1, maxLength: 64 },
      accessToken: { type: "string", minLength: 1, maxLength: 64 },
    },
  } satisfies JSONSchema;

  static createTable(knex: Knex, table: Knex.CreateTableBuilder) {
    const { email, accessToken } = UserLoginRequest.jsonSchema.properties;
    table.increments("id").primary();
    table.string("email", email.maxLength).notNullable();
    table.binary("access_token", accessToken.maxLength).notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.unique(["email"]);
    table.unique(["access_token"]);
  }

  static readonly expireTime = 24 * 3600 * 1000;

  readonly id?: number;
  email?: string;
  accessToken?: string;
  createdAt?: Date;

  override $formatDatabaseJson(json: Pojo): Pojo {
    json = super.$formatDatabaseJson(json);
    if (json.accessToken != null) {
      json.accessToken = Buffer.from(json.accessToken);
    }
    return json;
  }

  override $parseDatabaseJson(json: Pojo): Pojo {
    json = super.$parseDatabaseJson(json);
    if (json.accessToken != null) {
      json.accessToken = String(json.accessToken);
    }
    return json;
  }

  static async findById(id: number): Promise<UserLoginRequest | null> {
    return (await UserLoginRequest.query().findOne({ id })) ?? null;
  }

  static async findByEmail(email: string): Promise<UserLoginRequest | null> {
    return (await UserLoginRequest.query().findOne({ email })) ?? null;
  }

  static async findByAccessToken(
    accessToken: string,
  ): Promise<UserLoginRequest | null> {
    return (await UserLoginRequest.query().findOne({ accessToken })) ?? null;
  }

  static async init(email: string): Promise<string> {
    await this.deleteExpired();
    let request = await UserLoginRequest.findByEmail(email);
    if (request == null) {
      request = await UserLoginRequest.query().insertAndFetch({
        email,
        accessToken: Random.string(20),
      });
    }
    return request.accessToken!;
  }

  static async login(accessToken: string): Promise<User | null> {
    await this.deleteExpired();
    const request = await UserLoginRequest.findByAccessToken(accessToken);
    if (request != null) {
      return User.login(request.email!);
    }
    return null;
  }

  static async deleteExpired(now: number = Date.now()): Promise<void> {
    await UserLoginRequest.query()
      .where("createdAt", "<", new Date(now - UserLoginRequest.expireTime))
      .delete();
  }
}

User.relationMappings = {};

UserLoginRequest.relationMappings = {};

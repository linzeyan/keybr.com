import { test } from "node:test";
import { PublicId } from "@keybr/publicid";
import { ValidationError } from "objection";
import {
  deepEqual,
  doesNotThrow,
  equal,
  isNotNull,
  isNull,
  like,
  throws,
} from "rich-assert";
import { User, UserLoginRequest } from "./model.ts";
import { useDatabase } from "./testing.ts";
import { Random } from "./util.ts";

useDatabase();

const now = new Date("2001-02-03T04:05:06Z");

test("validate models", (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  throws(() => {
    User.fromJson({});
  }, ValidationError);

  throws(() => {
    User.fromJson({
      name: null,
      email: null,
    });
  }, ValidationError);

  throws(() => {
    User.fromJson({
      name: "",
      email: "",
    });
  }, ValidationError);

  doesNotThrow(() => {
    User.fromJson({
      name: "name",
      email: "email",
    });
  });
});

test("automatically populate createdAt", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  const user = await User.query().insertGraph({
    email: "user0@keybr.com",
    name: "user0",
  });

  deepEqual(user.createdAt, now);
});

test("generate unique user name", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  await User.query().insertGraph({
    email: `test@keybr.com`,
    name: `test`,
    createdAt: now,
  });
  for (let i = 1; i <= 9; i++) {
    await User.query().insertGraph({
      email: `test${i}@keybr.com`,
      name: `test${i}`,
      createdAt: now,
    });
  }
  await User.query().insertGraph({
    email: `example@keybr.com`,
    name: `example`,
    createdAt: now,
  });

  equal(await User.findUniqueName(null, "x".repeat(100)), "x".repeat(32));
  equal(
    await User.findUniqueName(null, "x".repeat(100) + "@keybr.com"),
    "x".repeat(32),
  );
  equal(await User.findUniqueName(null, "unique"), "unique");
  equal(await User.findUniqueName(null, "unique@keybr.com"), "unique");
  equal(await User.findUniqueName(null, "test"), "test10");
  equal(await User.findUniqueName(null, "test@keybr.com"), "test10");
  equal(await User.findUniqueName("test@keybr.com", "test"), "test");
  equal(await User.findUniqueName("test@keybr.com", "test@keybr.com"), "test");
  equal(await User.findUniqueName(null, "test10"), "test10");
  equal(await User.findUniqueName(null, "test10@keybr.com"), "test10");
  equal(await User.findUniqueName("test@keybr.com", "example"), "example1");
  equal(
    await User.findUniqueName("test@keybr.com", "example@keybr.com"),
    "example1",
  );
});

test("create access token", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  // Should create a new access token.

  Random.string = () => "token1";
  equal(await UserLoginRequest.init("example1@keybr.com"), "token1");
  isNull(await User.findByEmail("example1@keybr.com"));
  deepEqual(
    (await UserLoginRequest.findByEmail("example1@keybr.com"))!.toJSON(),
    {
      id: 1,
      email: "example1@keybr.com",
      accessToken: "token1",
      createdAt: now,
    },
  );

  // Should reuse an existing access token.

  Random.string = () => "tokenX";
  equal(await UserLoginRequest.init("example1@keybr.com"), "token1");
  equal(await User.findByEmail("example1@keybr.com"), null);
  deepEqual(
    (await UserLoginRequest.findByEmail("example1@keybr.com"))!.toJSON(),
    {
      id: 1,
      email: "example1@keybr.com",
      accessToken: "token1",
      createdAt: now,
    },
  );
});

test("delete expired access token", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  Random.string = () => "token1";
  equal(await UserLoginRequest.init("example1@keybr.com"), "token1");

  isNotNull(await UserLoginRequest.findByEmail("example1@keybr.com"));
  isNotNull(await UserLoginRequest.findByAccessToken("token1"));

  await UserLoginRequest.deleteExpired(
    now.getTime() + UserLoginRequest.expireTime + 1000,
  );

  isNull(await UserLoginRequest.findByEmail("example1@keybr.com"));
  isNull(await UserLoginRequest.findByAccessToken("token1"));
});

test("login with a valid access token", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  Random.string = () => "token1";

  // Should create a new access token.

  equal(await UserLoginRequest.init("example1@keybr.com"), "token1");

  // Before the first login.

  isNull(await User.findByEmail("example1@keybr.com"));
  isNotNull(await UserLoginRequest.findByEmail("example1@keybr.com"));

  // First login.

  deepEqual((await UserLoginRequest.login("token1"))!.toJSON(), {
    id: 4,
    createdAt: now,
    email: "example1@keybr.com",
    name: "example1",
    anonymized: 0,
  } as unknown);

  // Should create a new user after login.

  isNotNull(await User.findByEmail("example1@keybr.com"));
  isNotNull(await UserLoginRequest.findByEmail("example1@keybr.com"));

  // Second login.

  deepEqual((await UserLoginRequest.login("token1"))!.toJSON(), {
    id: 4,
    createdAt: now,
    email: "example1@keybr.com",
    name: "example1",
    anonymized: 0,
  } as unknown);

  // Should load an existing user after login.

  isNotNull(await User.findByEmail("example1@keybr.com"));
  isNotNull(await UserLoginRequest.findByEmail("example1@keybr.com"));
});

test("ignore invalid access token", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  Random.string = () => "token1";

  isNull(await UserLoginRequest.login("token1"));
  isNull(await UserLoginRequest.login("abc"));
  isNull(await UserLoginRequest.login("xyz"));
});

test("access token should be case-sensitive", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  await UserLoginRequest.query().insertGraph({
    email: "test@keybr.com",
    accessToken: "token",
    createdAt: now,
  });

  isNotNull(await UserLoginRequest.findByAccessToken("token"));
  isNull(await UserLoginRequest.findByAccessToken("TOKEN"));
});

test("load profile owner", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  isNull(await User.loadProfileOwner(new PublicId(999)));
  deepEqual(await User.loadProfileOwner(PublicId.of("example1")), {
    id: "example1",
    name: "Example User 1",
    imageUrl: null,
  });
  deepEqual(await User.loadProfileOwner(new PublicId(1)), {
    id: "55vdtk1",
    name: "user1",
    imageUrl: null,
  });
});

test("convert to user details", async (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  deepEqual((await User.findByEmail("user1@keybr.com"))?.toDetails(), {
    id: "55vdtk1",
    email: "user1@keybr.com",
    name: "user1",
    anonymized: false,
    createdAt: now,
  });
});

test("make public user for anonymous", (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  deepEqual(User.toPublicUser(null, "hint1"), {
    id: null,
    name: "Suspicious Silverfish",
    imageUrl: null,
  });
  deepEqual(User.toPublicUser(null, "hint2"), {
    id: null,
    name: "Suspicious Skink",
    imageUrl: null,
  });
});

test("make public user from user name", (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  deepEqual(
    User.toPublicUser(
      User.fromJson({
        id: 1,
        email: "email",
        name: "somebody",
        anonymized: 0,
        createdAt: new Date(0),
      }),
      0,
    ),
    {
      id: "55vdtk1",
      name: "somebody",
      imageUrl: null,
    },
  );
});

test("make public user with anonymous name", (ctx) => {
  ctx.mock.timers.enable({ apis: ["Date"], now });

  deepEqual(
    User.toPublicUser(
      User.fromJson({
        id: 1,
        email: "email1",
        name: "somebody",
        anonymized: 1,
        createdAt: new Date(0),
      }),
      0,
    ),
    {
      id: "55vdtk1",
      name: "Distinctive Vulture",
      imageUrl: null,
    },
  );
  deepEqual(
    User.toPublicUser(
      User.fromJson({
        id: 1,
        email: "email2",
        name: "somebody",
        anonymized: 1,
        createdAt: new Date(0),
      }),
      0,
    ),
    {
      id: "55vdtk1",
      name: "Distinctive Wallaby",
      imageUrl: null,
    },
  );
});

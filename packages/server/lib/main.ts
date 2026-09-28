import cluster, { type ClusterSettings } from "node:cluster";
import { Application } from "@fastr/core";
import { Container } from "@fastr/invert";
import { Manifest } from "@keybr/assets";
import { ConfigModule, Env } from "@keybr/config";
import { createSchema } from "@keybr/database";
import { Logger } from "@keybr/logger";
import Knex from "knex";
import { ApplicationModule, kMain } from "./app/index.ts";
import { Mailer } from "./app/mail/index.ts";
import { ServerModule } from "./server/module.ts";
import { Service } from "./server/service.ts";

// Allow Node to bind to port 80 and 443 without sudo:
// sudo setcap cap_net_bind_service=+ep $(which node)

initErrorHandlers();
if (cluster.isPrimary) {
  Env.probeFilesSync();
  const container = makeContainer();
  Logger.info("Configuration", {
    dataDir: container.get("dataDir"),
    publicDir: container.get("publicDir"),
    canonicalUrl: container.get("canonicalUrl"),
  });
  // These read their settings lazily, on the first request or the first mail.
  // Read them now, so that a missing setting stops the server right away.
  container.get("sessionOptions");
  container.get(Mailer);
  process.title = "keybr master process";
  // Once here rather than per worker, so the workers never race to create
  // the same tables. A failure exits through the unhandled rejection handler.
  createSchema(container.get(Knex)).then(() => {
    fork({ args: ["http"] });
    fork({ args: ["http"] });
    fork({ args: ["http"] });
    fork({ args: ["http"] });
  });
} else {
  const container = makeContainer();
  const service = container.get(Service);
  switch (process.argv[2]) {
    case "http":
      process.title = "keybr server worker process";
      service.start({
        app: container.get(Application, kMain),
        port: Env.getPort("SERVER_PORT", 3000),
      });
      break;
  }
}

function makeContainer() {
  const container = new Container();
  container.load(new ConfigModule());
  container.load(new ApplicationModule());
  container.load(new ServerModule());
  container.get(Manifest); // Sanity check.
  return container;
}

function fork(settings: ClusterSettings) {
  cluster.setupPrimary(settings);
  const worker = cluster.fork({});
  worker.on("online", () => {
    Logger.info("Worker started", { pid: worker.process.pid });
  });
  worker.on("exit", (code, signal) => {
    Logger.info("Worker died, starting a new worker", {
      pid: worker.process.pid,
      code,
      signal,
    });
    fork(settings); // Restart failed worker.
  });
}

function initErrorHandlers() {
  process.on("warning", (warning) => {
    Logger.warn("Warning", warning);
  });
  process.on("multipleResolves", (type, promise, reason) => {
    Logger.error("Multiple resolvers", { type, promise, reason });
    process.exit(1);
  });
  process.on("uncaughtException", (error) => {
    Logger.error("Uncaught exception", error);
    process.exit(1);
  });
  process.on("unhandledRejection", (reason) => {
    Logger.error("Unhandled rejection", reason);
    process.exit(1);
  });
}

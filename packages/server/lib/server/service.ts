import { Server } from "node:http";
import { userInfo } from "node:os";
import { type Application } from "@fastr/core";
import { injectable } from "@fastr/invert";
import { Logger } from "@keybr/logger";
import { type Closer, createCloser } from "./closer.ts";

const { pid } = process;
const { username } = userInfo();

@injectable({ singleton: true })
export class Service {
  readonly #server: Server;
  readonly #closer: Closer;

  constructor(server: Server) {
    this.#server = server;
    this.#closer = createCloser(this.#server);
  }

  start({ app, port }: { app: Application; port: number }) {
    this.#server.on("request", app.callback());
    this.#server.listen(port);
    process.on("SIGINT", () => {
      this.stop();
    });
    process.on("SIGTERM", () => {
      this.stop();
    });
    Logger.info("Server started", { pid, port, username });
  }

  stop() {
    const graceful = () => {
      Logger.info("Server stopped gracefully", { pid });
      process.exit(0);
    };

    const forceful = () => {
      Logger.info("Server stopped forcefully", { pid });
      process.exit(0);
    };

    Logger.info("Stopping server...", { pid });

    // Stop accepting new connections.
    this.#closer(false, graceful);

    // There may be open keep-alive connections, force shutdown.
    setTimeout(forceful, 1000);
  }
}

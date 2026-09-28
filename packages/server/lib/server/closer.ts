import {
  type IncomingMessage,
  type OutgoingMessage,
  type Server,
} from "node:http";
import { type Socket } from "node:net";

export type Closer = (force: boolean, cb?: (err?: Error) => void) => void;

const kIdle = Symbol();

declare module "net" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Socket {
    [kIdle]?: boolean;
  }
}

export function createCloser(server: Server): Closer {
  const sockets = new Set<Socket>();
  let isShuttingDown = false;

  const destroy = (socket: Socket, force: boolean = false) => {
    if (force || (socket[kIdle] && isShuttingDown)) {
      socket.destroy();
      sockets.delete(socket);
    }
  };

  const onConnection = (socket: Socket) => {
    socket[kIdle] = true;
    sockets.add(socket);
    socket.on("close", () => {
      sockets.delete(socket);
    });
  };

  const onRequest = (req: IncomingMessage, res: OutgoingMessage) => {
    const { socket } = req;
    socket[kIdle] = false;
    res.on("finish", () => {
      socket[kIdle] = true;
      destroy(socket);
    });
  };

  server.on("connection", onConnection);
  server.on("secureConnection", onConnection);
  server.on("request", onRequest);

  return (force: boolean, cb?: (err?: Error) => void) => {
    isShuttingDown = true;
    server.close((err) => {
      if (err) {
        if (cb) {
          cb(err);
        }
        return;
      }
      for (const socket of sockets) {
        destroy(socket, force);
      }
      if (cb) {
        cb();
      }
    });
  };
}

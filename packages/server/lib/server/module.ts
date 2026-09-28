import { Server } from "node:http";
import { type Binder, type Module } from "@fastr/invert";

export class ServerModule implements Module {
  configure({ bind }: Binder) {
    bind(Server).toValue(new Server());
  }
}

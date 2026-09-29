import { ZhuyinReader } from "./reader.ts";

let reader: Promise<ZhuyinReader> | null = null;

/** Loads the reader once, as its data is large. */
export function loadZhuyinReader(): Promise<ZhuyinReader> {
  return (reader ??= import(
    /* webpackChunkName: "zhuyin-readings" */ "./data/readings.json",
    { with: { type: "json" } }
  ).then(
    ({ default: readings }) => new ZhuyinReader(readings),
    (err) => {
      // Let the next lesson retry after a network error.
      reader = null;
      throw err;
    },
  ));
}

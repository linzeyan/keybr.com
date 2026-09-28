import { compile, extract } from "@formatjs/cli-lib";
import { globSync } from "glob";
import { readJsonSync, writeJsonSync } from "./lib/fs-json.js";
import { messageIdHash } from "./lib/intl.js";
import {
  mergedTranslationsPath,
  messagesPath,
  translationsPath,
} from "./lib/intl-io.js";
import { allLocales, defaultLocale } from "./locale.js";
import { findPackages } from "./root.js";

function findSourceFiles() {
  const files = [];
  for (const packageDirectory of findPackages()) {
    for (const file of globSync(["lib/**/*.@(ts|tsx)"], {
      cwd: packageDirectory,
      absolute: true,
      ignore: ["**/*.d.ts", "**/test/*", "**/*.test.*"],
    })) {
      files.push(file);
    }
  }
  files.sort();
  return files;
}

async function extractTranslations() {
  const defaultTranslationsFile = translationsPath(defaultLocale);
  const defaultTranslations = JSON.parse(
    await extract(findSourceFiles(), {
      additionalFunctionNames: [],
      additionalComponentNames: [],
      preserveWhitespace: true,
    }),
  );
  writeJsonSync(
    defaultTranslationsFile,
    remap(defaultTranslations, ([id, { defaultMessage }]) => [
      id,
      defaultMessage,
    ]),
  );
}

async function syncTranslations() {
  const defaultTranslationsFile = translationsPath(defaultLocale);
  const defaultTranslations = readJsonSync(defaultTranslationsFile);
  for (const locale of allLocales) {
    if (locale === defaultLocale) {
      continue;
    }
    const translationsFile = translationsPath(locale);
    const translations = readJsonSync(translationsFile);
    writeJsonSync(
      translationsFile,
      remap(defaultTranslations, ([id, message]) => [
        id,
        translations[id] &&
        translations[id] !== id &&
        translations[id] !== message
          ? translations[id]
          : undefined,
      ]),
    );
  }
}

async function compileMessages() {
  const defaultTranslationsFile = translationsPath(defaultLocale);
  const defaultTranslations = readJsonSync(defaultTranslationsFile);

  const format = {
    compile: (translations) => {
      return remap(translations, ([id, message]) => [
        messageIdHash(id),
        message,
      ]);
    },
  };

  for (const locale of allLocales) {
    const translationsFile = translationsPath(locale);
    const translations = readJsonSync(translationsFile);
    const mergedTranslationsFile = mergedTranslationsPath(locale);
    writeJsonSync(
      mergedTranslationsFile,
      remap(defaultTranslations, ([id, message]) => [
        id,
        translations[id] || message,
      ]),
    );
    const messagesFile = messagesPath(locale);
    const messages = JSON.parse(
      await compile([mergedTranslationsFile], {
        ast: true,
        format,
      }),
    );
    writeJsonSync(messagesFile, messages, null);
  }
}

function remap(entries, callback) {
  return Object.fromEntries(Object.entries(entries).map(callback));
}

await extractTranslations();
await syncTranslations();
await compileMessages();

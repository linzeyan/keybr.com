#!/usr/bin/env bash

set -e

project_dir="$(realpath "${BASH_SOURCE%/*}")"

rm -fr "${project_dir}/node_modules"
pnpm --dir "${project_dir}" install
pnpm --dir "${project_dir}" run clean
pnpm --dir "${project_dir}" run compile
pnpm --dir "${project_dir}" run lint
pnpm --dir "${project_dir}" run stylelint
pnpm --dir "${project_dir}" run build
pnpm --dir "${project_dir}" run test

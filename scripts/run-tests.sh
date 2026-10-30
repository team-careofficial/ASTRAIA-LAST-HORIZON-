#!/usr/bin/env bash
# Runs all tests with Node's built-in TypeScript stripping (no npm needed).
set -e
T="$(mktemp -d)"; mkdir -p "$T/src/compute" "$T/src/data/real" "$T/src/game/classroom" "$T/scripts"
cp src/compute/*.ts "$T/src/compute/"; cp src/data/real/*.ts "$T/src/data/real/"; cp src/game/classroom/challenge.ts "$T/src/game/classroom/"; cp scripts/closure.test.ts scripts/features.test.ts "$T/scripts/"
find "$T" -name '*.ts' -exec sed -i -E 's#from "(\.\.?/[^"]+)"#from "\1.ts"#' {} +
node --experimental-strip-types --no-warnings "$T/scripts/closure.test.ts"
node --experimental-strip-types --no-warnings "$T/scripts/features.test.ts"

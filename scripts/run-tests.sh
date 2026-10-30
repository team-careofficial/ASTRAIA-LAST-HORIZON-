#!/usr/bin/env bash
# Runs the closure tests with Node's built-in TypeScript stripping (no npm needed).
set -e
T="$(mktemp -d)"; mkdir -p "$T/src/compute" "$T/src/data/real" "$T/scripts"
cp src/compute/closure.ts "$T/src/compute/"; cp src/data/real/missionData.ts "$T/src/data/real/"; cp scripts/closure.test.ts "$T/scripts/"
sed -i -E 's#from "(\.\.?/[^"]+)"#from "\1.ts"#' "$T/src/compute/closure.ts" "$T/scripts/closure.test.ts"
node --experimental-strip-types --no-warnings "$T/scripts/closure.test.ts"

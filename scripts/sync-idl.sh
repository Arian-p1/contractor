#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/target/idl" "$ROOT/target/types"
cp "$ROOT/idl/contractor.json" "$ROOT/target/idl/contractor.json"
cp "$ROOT/idl/contractor.ts" "$ROOT/target/types/contractor.ts"
echo "Synced idl/ → target/idl + target/types"

#!/usr/bin/env bash
# Make program immutable. Run ONLY after initialize + verification.
# Usage: ./scripts/set-upgrade-authority-final.sh [PROGRAM_ID]
set -euo pipefail
PROGRAM_ID="${1:-${PROGRAM_ID:-DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k}}"

echo "Cluster: $(solana config get | sed -n 's/RPC URL: //p')"
echo "Program: $PROGRAM_ID"
echo
echo "This sets upgrade authority to none (--final). Irreversible."
read -r -p "Type FINAL to continue: " confirm
[[ "$confirm" == "FINAL" ]] || { echo "Aborted."; exit 1; }

solana program show "$PROGRAM_ID" || true
solana program set-upgrade-authority "$PROGRAM_ID" --final
solana program show "$PROGRAM_ID"

echo
echo "Next: securely discard deployer key material used only for deploy/init."
echo "Keep fee-recipient multisig keys separate — this script never touches them."

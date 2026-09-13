#!/usr/bin/env bash
# Print / lightly verify launch checklist (no secrets).
set -euo pipefail
PROGRAM_ID="${PROGRAM_ID:-DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k}"
echo "=== Contractor mainnet checklist ==="
echo "[ ] Independent security audit complete + findings fixed"
echo "[ ] Counsel review of fee collection / marketing (see docs/LEGAL-RISK.md)"
echo "[ ] Fee recipient is a published multisig (not a hot EOA)"
echo "[ ] Config initialized with intended fee_bps"
echo "[ ] Frontend .env points at mainnet RPC + program id"
echo "[ ] Frontend pinned to IPFS; CID recorded"
echo "[ ] SNS / DNSLink (optional) points at CID"
echo "[ ] solana program set-upgrade-authority $PROGRAM_ID --final"
echo "[ ] Deployer key discarded / offline"
echo "[ ] IDL + program id published with UI"
echo "[ ] Public demo GIF / thread (docs/marketing/)"
echo
if command -v solana >/dev/null; then
  echo "--- program show (current cluster) ---"
  solana program show "$PROGRAM_ID" 2>/dev/null || echo "(not found on current cluster)"
fi

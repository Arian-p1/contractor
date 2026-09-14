# Mainnet deploy checklist

**Warning:** This is real money. Smart contracts can have bugs. Dual-confirm can strand funds on dispute. An independent audit is strongly recommended before collecting fees. Hosting a fee-taking UI creates legal/operational risk — see [LEGAL-RISK.md](./LEGAL-RISK.md). Not legal advice.

## Steps

1. **Fund the deployer** with ~3–5 SOL on mainnet-beta (rent + deploy + initialize).
2. **Point Solana CLI at mainnet:**
   ```bash
   solana config set --url mainnet-beta
   ```
3. **Build and deploy the program:**
   ```bash
   anchor build --no-idl
   solana program deploy target/deploy/contractor.so
   # Or: anchor deploy
   ```
   Record the program id. If it differs from the keypair id already in the repo, update `declare_id!`, `Anchor.toml`, and the frontend.
4. **Initialize config once** (fee 600 bps = 6%, fee recipient below):
   ```bash
   export FEE_BPS=600
   export FEE_RECIPIENT=6E1Ex6LpamiwVEPej6yYStL9hytarsefzwv8mnfG1R8s
   export ANCHOR_PROVIDER_URL=https://api.mainnet-beta.solana.com
   export ANCHOR_WALLET=~/.config/solana/id.json
   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/initialize-config.ts
   ```
   Prefer a **multisig** for `FEE_RECIPIENT` in production.
5. **Relinquish upgrade authority** (immutable program):
   ```bash
   solana program set-upgrade-authority <PROGRAM_ID> --final
   # or: ./scripts/set-upgrade-authority-final.sh <PROGRAM_ID>
   ```
6. **Update frontend env** — set `PUBLIC_PROGRAM_ID` in `app/.env` to the deployed id (may change on redeploy). Keep:
   ```
   PUBLIC_SOLANA_RPC=https://api.mainnet-beta.solana.com
   PUBLIC_NETWORK=mainnet-beta
   PUBLIC_EXPLORER=https://explorer.solana.com
   PUBLIC_FEE_RECIPIENT=6E1Ex6LpamiwVEPej6yYStL9hytarsefzwv8mnfG1R8s
   PUBLIC_FEE_BPS=600
   ```
7. **Build and host the static UI:**
   ```bash
   cd app && npm install && npm run build
   # Pin app/build/ to IPFS (Pinata / web3.storage / Fleek) or a static host
   ```
8. **Point domain DNS** at the gateway / static host (and optional SNS).

## Notes

- Current keypair program id in repo: `DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k` — treat as provisional until mainnet deploy confirms it.
- Fee is immutable after `initialize`; there is no admin pause or emergency withdraw.
- Local-demo wallet UI is stripped from production; `connectLocal` remains gated to `PUBLIC_NETWORK=localnet` only.

# Deploy & IPFS

## Prerequisites

- Solana CLI + Anchor 0.30.1 (see [BUILD-NOTES.md](./BUILD-NOTES.md))
- Node 20+
- Funded deployer keypair on target cluster
- Prefer a **multisig** for `fee_recipient` (Squads / similar). Do **not** invent mainnet keys in git.

## Build & test

```bash
anchor build --no-idl
# ensure target/idl/contractor.json + target/types/contractor.ts exist
anchor test --skip-build
```

## Deploy program

```bash
solana config set --url devnet   # or mainnet-beta
anchor deploy
# Note the program id; update declare_id! / Anchor.toml / app/.env if needed
```

## Initialize (once)

```bash
export FEE_BPS=250
export FEE_RECIPIENT=REPLACE_WITH_FEE_MULTISIG_PUBKEY
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com   # or mainnet
export ANCHOR_WALLET=~/.config/solana/id.json

# Requires workspace program loaded (run from repo after build)
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/initialize-config.ts
```

Equivalent Anchor TS:

```ts
await program.methods
  .initialize(250, feeRecipientPubkey)
  .accounts({ authority, config: configPda, systemProgram })
  .rpc();
```

Fee is **immutable** after this — no update instruction.

## Make upgrade authority immutable

```bash
./scripts/set-upgrade-authority-final.sh <PROGRAM_ID>
# or:
solana program set-upgrade-authority <PROGRAM_ID> --final
```

Then **discard** deployer key material used only for deploy/init. Fee multisig keys stay separate.

## Frontend (static / IPFS)

```bash
cd app
cp .env.example .env   # PUBLIC_SOLANA_RPC, PUBLIC_PROGRAM_ID, PUBLIC_NETWORK
npm install
npm run build
# build/ is static
```

### Pin options

| Provider | Notes |
|----------|--------|
| **Pinata** | Upload `app/build/` as folder; copy CID; enable dedicated gateway |
| **web3.storage** / **Storacha** | `w3 up app/build` (or current CLI); record root CID |
| **Fleek** | Connect repo or upload static site; IPFS/Filecoin backend |
| Local IPFS | `ipfs add -r app/build/` then pin on a pinning service |

Publish the **CID** next to the program id in the README / release notes. Prefer content-addressed URLs over mutable hosting for the “immutable UI” story — remember hosting the UI still creates operational exposure ([LEGAL-RISK.md](./LEGAL-RISK.md)).

### SNS / domain

1. Obtain an `.sol` name (SNS) or traditional DNS.
2. Set **IPFS / IPNS / DNSLink** records to the pinned CID (e.g. `dnslink=/ipfs/<CID>`).
3. For SNS: use a resolver / Bonfida tools to point the record at the CID or HTTPS gateway URL.
4. Document both the human name and the raw CID so users can verify.

No backend keys belong in the static site. RPC may be public or a project-rate-limited endpoint.

## Verify

1. Config PDA exists with expected `fee_bps` / `fee_recipient`
2. Create → deposit → dual complete releases with fee
3. Dual cancel refunds 100%
4. Upgrade authority is `none`
5. `./scripts/checklist-mainnet.sh`

## Security checklist

- [ ] `set-upgrade-authority --final`
- [ ] Deployer key offline / destroyed
- [ ] Fee recipient is a transparent multisig
- [ ] IDL + program id published with frontend
- [ ] No admin / pause / withdraw instructions in IDL
- [ ] Counsel + audit before collecting mainnet fees

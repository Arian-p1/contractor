# Deploy & IPFS

## Prerequisites

- Solana CLI + Anchor 0.30.1
- Node 20+, yarn
- Funded deployer keypair on target cluster

## Build & test

```bash
anchor build
anchor test
```

## Deploy program

```bash
# Choose cluster
solana config set --url devnet   # or mainnet-beta

anchor deploy
# Note the program id; update declare_id! / Anchor.toml / app/.env if needed
```

## Initialize (once)

```bash
# fee_bps e.g. 250 = 2.5%, fee_recipient = multisig preferred
anchor run initialize   # or use a one-shot script / frontend admin tool
```

Example via `anchor` TypeScript once:

```ts
await program.methods
  .initialize(250, feeRecipientPubkey)
  .accounts({ authority, config: configPda, systemProgram })
  .rpc();
```

## Make upgrade authority immutable

```bash
solana program set-upgrade-authority <PROGRAM_ID> --final
```

Then **discard** the deployer key material used only for deploy/init.

## Frontend (static / IPFS)

```bash
cd app
cp .env.example .env   # set PUBLIC_SOLANA_RPC, PUBLIC_PROGRAM_ID
npm install
npm run build
# build/ is static — pin to IPFS
npx ipfs add -r build/
# or upload build/ to web3.storage / Pinata / nft.storage
```

Optional: point an SNS / ENS / DNSLink domain at the CID.

## Verify

1. Config PDA exists with expected `fee_bps` / `fee_recipient`
2. Create → deposit → dual complete releases with fee
3. Dual cancel refunds 100%
4. Upgrade authority is `none`

## Security checklist

- [ ] `set-upgrade-authority --final`
- [ ] Deployer key offline / destroyed
- [ ] Fee recipient is a transparent multisig
- [ ] IDL + program id published with frontend
- [ ] No admin / pause / withdraw instructions in IDL

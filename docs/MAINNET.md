# Mainnet — archived reference only

**This project is not being taken to production.** The checklist below is kept only as technical notes for readers of the source. Do **not** treat it as a recommendation to deploy or collect fees.

Operating a fee-taking escrow UI/brand has legal and compliance risk in many jurisdictions. Non-custodial design does not equal legal clearance. See [LEGAL-RISK.md](./LEGAL-RISK.md).

If you fork this for your own experiments:

1. Use **devnet** or a local validator first.
2. Never commit real fee-recipient wallets or private keys.
3. Get independent legal advice before any public deployment or fee collection.
4. Prefer a security audit before mainnet.

Example env placeholders (not real addresses):

```bash
export FEE_BPS=600
export FEE_RECIPIENT=REPLACE_WITH_FEE_MULTISIG_PUBKEY
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
```

Frontend:

```bash
PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
PUBLIC_NETWORK=devnet
PUBLIC_PROGRAM_ID=<your deployed program id>
PUBLIC_FEE_RECIPIENT=
PUBLIC_FEE_BPS=600
```

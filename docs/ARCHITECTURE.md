# Contractor — Smart Contract Architecture (v1)

Non-custodial, immutable Solana escrow. No admin, no pause, no upgrade, no emergency withdraw.

## Stack defaults

| Choice | Decision |
|--------|----------|
| Chain | Solana |
| Framework | Anchor |
| Asset (v1) | Native SOL |
| Fee | Immutable, set at `initialize` only (default **600 bps = 6%**, max **1000 bps**) |
| Release | Both parties `confirm_complete` → auto-release |
| Cancel | Both parties `confirm_cancel` → full refund to payer (no fee) |
| Arbiter | None (would reintroduce control) |

## Accounts

### `Config` (PDA: `["config"]`)
Created exactly once. **No update instruction exists.**

```
fee_bps: u16          // 1..=1000, immutable after init
fee_recipient: Pubkey // deploy-time wallet (prefer multisig / transparent)
bump: u8
```

### `Deal` (PDA: `["deal", creator, deal_id]`)
```
creator: Pubkey
payer: Pubkey
payee: Pubkey
amount: u64                 // lamports expected on deposit
deal_id: u64
terms_hash: [u8; 32]        // optional off-chain terms commitment (blake3/sha256)
status: DealStatus
payer_complete: bool
payee_complete: bool
payer_cancel: bool
payee_cancel: bool
created_at: i64
bump: u8
```

### Vault
Deal PDA owns a system-owned lamport balance (or dedicated vault PDA `["vault", deal]`). Prefer **deal PDA as escrow vault** to minimize accounts: transfer SOL to deal PDA on deposit; CPI transfer out on release/refund.

## Status machine

```
Created  --deposit-->  Funded  --both complete-->  Released
                         |
                         +--both cancel-->  Refunded
```

Terminal states: `Released`, `Refunded`. No transitions out.

## Instructions

1. **`initialize(fee_bps, fee_recipient)`**
   - Creates `Config` PDA once.
   - Assert `1 <= fee_bps <= 1000`.
   - Signer = deployer; after this, discard/burn deployer key. Program has **no** upgrade authority path in docs: `solana program set-upgrade-authority … --final`.

2. **`create_deal(deal_id, payee, amount, terms_hash)`**
   - `creator` = signer; `payer` = creator (v1: creator is payer). Optional later: allow payee to create unpaid invoice.
   - Status = `Created`.
   - `amount > 0`.

3. **`deposit(deal_id)`**
   - Only `payer`. Status must be `Created`.
   - Transfer exactly `amount` lamports into deal PDA. Status → `Funded`.

4. **`confirm_complete(deal_id)`**
   - Signer is `payer` or `payee`. Status = `Funded`.
   - Flip that party's `*_complete` flag (idempotent if already set).
   - If both true: compute `fee = amount * fee_bps / 10_000`, `payout = amount - fee`; transfer payout → payee, fee → `fee_recipient`; status → `Released`.

5. **`confirm_cancel(deal_id)`**
   - Signer is `payer` or `payee`. Status = `Funded` (or `Created` with no funds — just close).
   - Flip `*_cancel`. If both true and Funded: transfer full `amount` back to payer (no fee); status → `Refunded`.
   - If both cancel while `Created`: close deal, no transfers.

## Fee policy (documented)

- Fee taken **only on successful release**.
- Mutual cancel after deposit → **100% refund**, zero fee (incentives: don't punish abandoned deals).
- Integer math: floor fee; remainder stays with payee (`fee = amount * bps / 10_000`).

## Security model

| Threat | Mitigation |
|--------|------------|
| Deployer rug | No admin Ixs; upgrade authority made immutable; deployer key discarded |
| Fee change | No update ix; fee only in `initialize` |
| Unauthorized release | Both parties must confirm; PDA signer checks |
| Partial deposit | Exact `amount` required |
| Reentrancy / double release | Status gate to terminal; Solana account model |
| Frontend censorship | Static IPFS host; contract usable via any Solana client |

## Explicit non-goals (v1)

- SPL tokens (roadmap)
- Timeouts / auto-release
- Third-party dispute resolution
- KYC / identity
- Upgradeable proxy

## Frontend surface (SvelteKit)

- Landing (marketing copy)
- Create deal → wallet tx
- Deal page: status, confirm complete / cancel
- Wallet adapter; program id + RPC via env
- `adapter-static` for IPFS

## Deploy checklist (high level)

1. `anchor build && anchor test`
2. Deploy program
3. `initialize` with fee_bps + fee_recipient (multisig)
4. `solana program set-upgrade-authority <PROGRAM> --final`
5. Discard deployer key material
6. Publish IDL + program id; pin frontend to IPFS; optional SNS domain

## Legal note (ops, not code)

Immutable non-custodial contracts reduce *custody* risk but do **not** eliminate AML / frontend-control risk (see Tornado Cash prosecutions). Geo-blocking is not a legal defense. Obtain counsel in the operating jurisdiction before launch.

## Implementation notes (monorepo)

- Program crate: `programs/contractor`
- Program id (local/dev keypair): `DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k`
- Tests: `tests/contractor.ts` (Anchor + mocha)
- Frontend: `app/` (SvelteKit + adapter-static)
- Deal PDA holds lamports directly (no separate vault account)

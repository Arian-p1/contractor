# Launch checklist

## Phase 0 — Local / CI

- [ ] `anchor build --no-idl` succeeds (see BUILD-NOTES)
- [ ] `anchor test --skip-build` — 14 passing
- [ ] `cd app && npm run build` — static `build/`
- [ ] IDL + types committed or regenerated

## Phase 1 — Devnet demo

- [ ] Deploy program to devnet
- [ ] Initialize config (`FEE_BPS`, multisig or throwaway fee recipient OK on devnet)
- [ ] Point `app/.env` at devnet RPC + program id
- [ ] Record demo GIF / 30–60s Phantom walkthrough
- [ ] Soft social posts + Superteam/Discord **as builders**, not as licensed product
- [ ] GitHub Discussions open for feedback

## Phase 2 — Hardening

- [ ] Independent security audit; fix critical/high
- [ ] External counsel on fee collection + marketing claims (LEGAL-RISK)
- [ ] Fee recipient → transparent **multisig**; publish address
- [ ] Threat-model review: stranded funds UX copy in UI
- [ ] Optional bug bounty / responsible disclosure contact

## Phase 3 — Mainnet

- [ ] Redeploy or migrate to mainnet program id; update declare_id / env
- [ ] Initialize with final fee_bps + multisig recipient
- [ ] `solana program set-upgrade-authority <ID> --final`
- [ ] Discard deployer key
- [ ] Pin frontend to IPFS; publish CID; optional SNS
- [ ] Launch thread (social-thread.md); keep claims honest
- [ ] Monitor first deals; no custody of user funds

## Explicit non-goals for v1 launch claims

- SPL token escrow  
- Timeouts / auto-refund  
- Dispute arbitration  
- KYC / geo-compliance guarantees  

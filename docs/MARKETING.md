# Marketing — Contractor (go-to-market pack)

> Positioning: minimal **non-custodial SOL escrow** primitive. Not a marketplace. Not custody. Not legal advice.

Full social drafts: [marketing/social-thread.md](./marketing/social-thread.md)  
Launch sequence: [marketing/launch-checklist.md](./marketing/launch-checklist.md)

## One-liner

**Contractor** is non-custodial SOL escrow on Solana: deposit, dual-confirm release, or mutual cancel with a full refund.

## Elevator (30s)

Hire or get hired without trusting a marketplace wallet. Contractor locks SOL in an on-chain deal PDA. Money moves only when both sides say “done,” or both say “cancel.” There’s no KYC, no arbiter, and no admin key that can seize funds. Protocol fee only on successful release (default 6%).

## Value props

| Audience | Message |
|----------|---------|
| Freelancers | Get paid in SOL without invoice platforms skimming custody |
| Clients | Funds stay escrowed until you confirm delivery |
| Privacy-minded | No accounts, no KYC — just wallets and a deal id |
| Builders | Immutable fee, open source, IPFS-hostable UI |

## Taglines

- Escrow without the escrow company
- Both confirm. Or both cancel.
- Fee only on success
- No pause. No upgrade. No rug admin.

## Positioning

Not a freelance marketplace. Not a custody product. A minimal settlement primitive: **deal → fund → complete | cancel**.

---

## Landing page copy blocks

### Hero

**Eyebrow:** Non-custodial · No KYC · Solana  

**H1:** Escrow without the escrow company.  

**Sub:** Contractor locks native SOL in an on-chain deal PDA. Funds release only when both parties confirm complete. Mutual cancel refunds the payer 100% — protocol fee only on success.  

**CTAs:** Create a deal · How it works  

**Fee line:** Default protocol fee 6% (max 10%), immutable after initialize. No admin pause, upgrade, or emergency withdraw.

### How it works

1. Payer creates a deal with payee address, amount, and optional terms hash.  
2. Payer deposits the exact SOL amount into the deal PDA.  
3. Both confirm complete → payee receives payout minus protocol fee.  
4. Or both confirm cancel → full refund to payer, no fee.

### Feature cards

- **Non-custodial** — Deal PDA holds lamports. Your wallet signs; no marketplace custody backend.  
- **Dual confirmation** — Release requires both payer and payee.  
- **Fair cancel** — Mutual cancel after deposit → 100% to payer.  
- **Immutable fee** — Fee bps + recipient set once; no update ix.

### FAQ (short)

**Who holds the funds?** The deal PDA. No admin seize path.  

**What if we disagree?** No on-chain arbiter; funds can remain locked if neither path is dual-confirmed. Disclose before depositing.  

**When is the fee charged?** Only on successful release.  

**Anonymous / legal?** No KYC account; chain is public. Non-custodial ≠ legal clearance.

### Footer disclaimer

Non-custodial SOL escrow. No KYC. No admin keys. Fee only on successful release.  
Not legal, tax, or financial advice. Smart contracts can have bugs; dual-confirm can strand funds on dispute. See LEGAL-RISK.md. Use at your own risk.

*(These blocks are wired into `app/src/routes/+page.svelte` and the layout footer.)*

---

## Channels

- Dev Twitter / Warpcast: demo GIF of create → deposit → dual complete  
- Solana ecosystem lists / Superteam  
- GitHub README + Discussions + IPFS mirror  
- Short demo video (30–60s) with Phantom  

## Community strategy

### Superteam / Solana Discord

- Share **devnet demos** and open-source links in builder channels; follow each server’s promo rules.  
- Lead with the state machine and “no admin,” not “anonymous money.”  
- Offer to answer technical questions; avoid shill-only posts.

### GitHub Discussions

- Use Discussions for Q&A, deal-flow questions, and roadmap (SPL tokens, timeouts as **explicit future** non-goals of v1).  
- Keep security reports to private disclosure / advisory process when available.

### What NOT to claim

- Do **not** claim legal authorization to operate, money-transmitter licensing, or compliance.  
- Do **not** promise anonymity against chain analysis.  
- Do **not** promise that terms_hash is court-enforceable.  
- Do **not** imply an arbiter or customer-support refund path.  
- Do **not** guarantee audit = bug-free.

## Do / Don’t

**Do:** emphasize immutability, dual confirmation, cancel fairness, fee-only-on-success.  
**Don’t:** promise legal enforceability of off-chain terms, anonymity against chain analysis, or regulatory compliance.

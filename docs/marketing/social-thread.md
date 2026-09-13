# Social drafts — Contractor

Replace `https://contractor.example` / CID / program id before posting. Soft-launch on **devnet** first.

## X / Twitter — launch thread (10 tweets)

1/ Contractor is live (devnet): non-custodial SOL escrow on Solana.  
No marketplace wallet. No KYC account. No admin key that can seize the deal PDA.

2/ Flow is boring on purpose:  
create deal → deposit exact SOL → both confirm complete (release + fee)  
OR both confirm cancel (100% refund, no fee).

3/ Why dual confirm?  
Neither payer nor payee can move escrowed funds alone. That’s the whole product.

4/ Fee only on success.  
Default 6% (max 10%), set once at initialize — no update instruction. Cancel is fee-free.

5/ Non-custodial means the program PDA holds lamports.  
We don’t run a custody backend. Your wallet signs every action.

6/ Tradeoff you should know:  
There is **no on-chain arbiter**. If you disagree and refuse cancel, funds can stay locked. Disclose that to counterparties.

7/ Stack: Anchor program + static SvelteKit UI (IPFS-ready).  
Open source. Intended deploy path: `set-upgrade-authority --final`, discard deployer key.

8/ Demo: [link to GIF / 30s video]  
Try on devnet: [app URL] · Program: `DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k`

9/ Not legal advice. Non-custodial ≠ “legal to operate everywhere.”  
Read LEGAL-RISK before mainnet fees. Audit + counsel still ahead for production.

10/ Builders: star/fork, file issues, join Discussions.  
Superteam folks: happy to walk through the state machine.  
Escrow without the escrow company.

## X / Twitter — 5 short posts

1. Both confirm. Or both cancel. Fee only on success. Contractor = minimal SOL escrow PDA.  
2. No pause. No upgrade. No emergency withdraw. Non-custodial by construction.  
3. Freelancers: get paid in SOL without handing custody to a marketplace.  
4. Clients: SOL sits in a deal PDA until you confirm delivery — or you both cancel for a full refund.  
5. Devnet demo up. Mainnet only after audit + counsel. Links in bio / thread.

## Warpcast / Farcaster blurb

**Contractor** — non-custodial native SOL escrow on Solana. Dual-confirm release or mutual cancel (100% refund). Fee only on success. No KYC, no admin seize path. Devnet demo + open source; mainnet after audit/counsel. Not legal advice.

Cast CTA: try the static UI, drop feedback, RT the state diagram.

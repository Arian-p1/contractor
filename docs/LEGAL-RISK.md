# Legal & risk notes (not legal advice)

**This document is informational only.** Obtain counsel in every jurisdiction where you operate, market, or take fees before mainnet launch.

## What the protocol is

Contractor is open-source software that facilitates peer-to-peer escrow of native SOL via an immutable Solana program. The operators of any frontend or fee-recipient wallet are **not** intended to take custody of user funds in the deal PDA.

## Residual risks (non-exhaustive)

| Risk | Notes |
|------|-------|
| AML / sanctions | Non-custodial design reduces *custody* exposure but does **not** eliminate AML, sanctions, or money-transmission questions for fee recipients or frontend operators. Tornado Cash–related prosecutions show that “code only” / “geo-block” narratives are not a reliable defense. |
| Securities / payments | Fee collection + marketing as a payments product can attract money-transmitter or other licensing analysis depending on jurisdiction. |
| Consumer protection | Dual-confirm escrow can strand funds if parties disagree and refuse cancel — disclose this clearly. |
| Tax | Users and fee recipients may have taxable events on release / fee receipt. |
| Frontend control | Hosting the UI, RPC endpoints, or domain can create operational and legal exposure even if the program is immutable. |
| Chain transparency | Solana transactions are public; “anonymous” means no KYC account, not unlinkability. |

## Explicit non-promises

- No KYC does **not** mean lawful in your location.
- Immutable contracts do **not** equal legal immunity.
- Terms hash on-chain is a commitment aid, **not** a court-enforceable contract by itself.
- IPFS hosting does **not** remove operator liability.

## Recommended operational posture

1. Independent legal review before taking mainnet fees.
2. Transparent fee-recipient multisig; publish addresses.
3. Clear UI disclaimers (stranded funds on dispute; no arbiter).
4. Avoid marketing that implies guaranteed anonymity or regulatory compliance.
5. Consider geographies / entity structure with counsel — not DIY geo-blocks as a legal strategy.

## Disclaimer for users

Use at your own risk. Smart contracts may contain bugs. Audits (if any) are not guarantees. You can lose funds through user error, bugs, or counterparty refusal to confirm.

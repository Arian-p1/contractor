<script lang="ts">
</script>

<div class="container">
  <section class="hero">
    <p class="eyebrow muted">Non-custodial · No KYC · Solana</p>
    <h1>Escrow without the escrow company.</h1>
    <p>
      Contractor locks native SOL in an on-chain deal PDA. Funds
      <strong>release only when both parties confirm</strong> complete.
      Mutual cancel refunds the payer <strong>100%</strong> — protocol fee only on success.
    </p>
    <div class="cta-row">
      <a class="btn primary" href="/create">Create a deal</a>
      <a class="btn" href="#how">How it works</a>
    </div>
    <p class="muted fee-note">
      Default protocol fee <strong>2.5%</strong> (max 10%), immutable after initialize.
      No admin pause, upgrade, or emergency withdraw in the program.
    </p>
  </section>

  <div class="grid">
    <div class="card">
      <h3>Non-custodial</h3>
      <p class="muted">Deal PDA holds lamports. Your wallet signs; no marketplace custody backend.</p>
    </div>
    <div class="card">
      <h3>Dual confirmation</h3>
      <p class="muted">Release requires both payer and payee. Neither can move funds alone.</p>
    </div>
    <div class="card">
      <h3>Fair cancel</h3>
      <p class="muted">If both cancel after deposit, payer gets 100% back — fee only on success.</p>
    </div>
    <div class="card">
      <h3>Immutable fee</h3>
      <p class="muted">Fee bps + recipient set once at initialize. No update instruction.</p>
    </div>
  </div>

  <div id="how" class="card" style="margin-top:2rem">
    <h3>How it works</h3>
    <ol class="muted">
      <li>Payer creates a deal with payee address, amount, and optional terms hash.</li>
      <li>Payer deposits the exact SOL amount into the deal PDA.</li>
      <li>Both confirm complete → payee receives payout minus protocol fee.</li>
      <li>Or both confirm cancel → full refund to payer, no fee.</li>
    </ol>
  </div>

  <div class="card" style="margin-top:1.25rem">
    <h3>FAQ</h3>
    <details>
      <summary>Who holds the funds?</summary>
      <p class="muted">The deal program-derived address (PDA). There is no custody backend or admin key that can seize escrowed SOL.</p>
    </details>
    <details>
      <summary>What if we disagree?</summary>
      <p class="muted">There is no on-chain arbiter. If parties refuse to both confirm complete or cancel, funds can remain locked. Disclose this to counterparties before depositing.</p>
    </details>
    <details>
      <summary>When is the fee charged?</summary>
      <p class="muted">Only on successful dual-confirm release. Mutual cancel refunds 100% to the payer.</p>
    </details>
    <details>
      <summary>Is this anonymous / legal everywhere?</summary>
      <p class="muted">No KYC account — wallets only. Transactions are public on Solana. Non-custodial design does not equal legal clearance; read LEGAL-RISK and consult counsel before mainnet fees.</p>
    </details>
  </div>

  <div class="cta-bottom card" style="margin-top:1.25rem; text-align:center">
    <h3>Ready to settle in SOL?</h3>
    <p class="muted">Connect Phantom or Solflare, create a deal, share the deal link with your counterparty.</p>
    <a class="btn primary" href="/create">Start a deal</a>
  </div>
</div>

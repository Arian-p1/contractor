<script lang="ts">
</script>

<div class="container">
  <section class="hero">
    <h1>Anonymous SOL escrow.<br />No middleman.</h1>
    <p>
      Payer deposits native SOL into an immutable on-chain deal.
      Funds release only when <strong>both</strong> parties confirm complete.
      Mutual cancel refunds the payer with <strong>zero fee</strong>.
    </p>
    <a class="btn primary" href="/create">Create a deal</a>
  </section>

  <div class="grid">
    <div class="card">
      <h3>Non-custodial</h3>
      <p class="muted">Deal PDA holds lamports. No admin, pause, upgrade, or emergency withdraw.</p>
    </div>
    <div class="card">
      <h3>Dual confirmation</h3>
      <p class="muted">Release requires both payer and payee. Neither can rug alone.</p>
    </div>
    <div class="card">
      <h3>Fair cancel</h3>
      <p class="muted">If both cancel after deposit, payer gets 100% back — fee only on success.</p>
    </div>
    <div class="card">
      <h3>Immutable fee</h3>
      <p class="muted">Default 2.5% (max 10%), set once at initialize. No update instruction.</p>
    </div>
  </div>

  <div class="card" style="margin-top:2rem">
    <h3>How it works</h3>
    <ol class="muted">
      <li>Payer creates a deal with payee address, amount, and optional terms hash.</li>
      <li>Payer deposits the exact SOL amount into the deal PDA.</li>
      <li>Both confirm complete → payee receives payout; protocol takes fee.</li>
      <li>Or both confirm cancel → full refund to payer, no fee.</li>
    </ol>
  </div>
</div>

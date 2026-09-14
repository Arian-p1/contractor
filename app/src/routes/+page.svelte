<script lang="ts">
</script>

<div class="container">
  <section class="hero">
    <p class="eyebrow">Settlement desk · Solana</p>
    <h1>Lock the SOL. Release only when both say done.</h1>
    <p class="lede">
      Contractor holds native SOL in a deal PDA — not a marketplace wallet.
      <strong>Both parties must confirm</strong> to release. Mutual cancel returns
      <strong>100%</strong> to the payer. Protocol fee only on success.
    </p>
    <div class="cta-row">
      <a class="btn primary" href="/create">Create a deal</a>
      <a class="btn ghost" href="#how">How it works</a>
    </div>
    <p class="fee-note">
      Protocol fee <strong>6%</strong> (max 10%), set once at initialize — no update instruction,
      no admin pause, no emergency withdraw.
    </p>
  </section>

  <div class="trust-strip" aria-label="Trust points">
    <div class="trust-item">
      <div class="k">Fee</div>
      <div class="v">6% on release</div>
      <div class="d">Zero on mutual cancel</div>
    </div>
    <div class="trust-item">
      <div class="k">Control</div>
      <div class="v">Dual confirm</div>
      <div class="d">Neither side moves funds alone</div>
    </div>
    <div class="trust-item">
      <div class="k">Authority</div>
      <div class="v">No admin</div>
      <div class="d">No KYC · no seize key</div>
    </div>
  </div>

  <div class="section-head" id="how">
    <h2>How a deal moves</h2>
    <p>Four steps. No arbiter in the middle.</p>
  </div>

  <div class="how-strip">
    <div class="how-step">
      <div class="num">01</div>
      <h3>Open</h3>
      <p>Payer sets payee, amount, and optional terms hash. Deal PDA is created.</p>
    </div>
    <div class="how-step">
      <div class="num">02</div>
      <h3>Fund</h3>
      <p>Payer deposits the exact SOL into the deal. Lamports sit on-chain.</p>
    </div>
    <div class="how-step">
      <div class="num">03</div>
      <h3>Confirm</h3>
      <p>Both click complete → payee gets payout minus the 6% protocol fee.</p>
    </div>
    <div class="how-step">
      <div class="num">04</div>
      <h3>Or unwind</h3>
      <p>Both confirm cancel → full refund to payer. Fee stays at zero.</p>
    </div>
  </div>

  <div class="section-head">
    <h2>Straight answers</h2>
    <p>What people ask before they deposit.</p>
  </div>

  <div class="faq">
    <details>
      <summary>Who holds the funds?</summary>
      <p>
        The deal program-derived address (PDA). There is no custody backend and no admin key that can
        seize escrowed SOL.
      </p>
    </details>
    <details>
      <summary>What if we disagree?</summary>
      <p>
        There is no on-chain arbiter. If parties refuse to both confirm complete or cancel, funds can
        remain locked. Say that out loud before anyone deposits.
      </p>
    </details>
    <details>
      <summary>When is the 6% fee charged?</summary>
      <p>
        Only on successful dual-confirm release. Mutual cancel refunds 100% to the payer — no
        protocol cut.
      </p>
    </details>
    <details>
      <summary>Is this anonymous / legal everywhere?</summary>
      <p>
        No KYC account — wallets only. Transactions are public on Solana. Non-custodial design is not
        legal clearance; read LEGAL-RISK and talk to counsel before mainnet fees.
      </p>
    </details>
  </div>

</div>

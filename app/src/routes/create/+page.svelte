<script lang="ts">
  import { wallet } from '$lib/wallet';
  import {
    buildCreateDealIx,
    buildDepositIx,
    dealPda,
    getConnection,
    hashTerms,
    sendIx,
    solToLamports
  } from '$lib/program';
  import { PublicKey } from '@solana/web3.js';

  const FEE_PCT = 6;
  let payee = '';
  let amountSol = 0.1;
  let dealId = String(Date.now() % 1_000_000_000);
  let terms = '';
  let depositNow = true;
  let status = '';
  let error = '';
  let dealLink = '';
  let busy = false;

  $: amountNum = Number(amountSol) || 0;
  $: feeSol = amountNum * (FEE_PCT / 100);
  $: payoutSol = Math.max(0, amountNum - feeSol);

  async function submit() {
    error = '';
    status = '';
    dealLink = '';
    if (!$wallet.connected || !$wallet.publicKey) {
      error = 'Connect a wallet first.';
      return;
    }
    busy = true;
    try {
      const payeePk = new PublicKey(payee.trim());
      const id = BigInt(dealId);
      const amount = solToLamports(amountSol);
      if (amount <= 0n) throw new Error('Amount must be > 0');
      const termsHash = await hashTerms(terms || `deal:${dealId}`);
      const connection = getConnection();
      const creator = $wallet.publicKey;

      status = 'Creating deal…';
      const createIx = await buildCreateDealIx(creator, id, payeePk, amount, termsHash);
      await sendIx(connection, createIx, creator, (tx) => wallet.signTransaction(tx));

      if (depositNow) {
        status = 'Depositing SOL…';
        const depIx = await buildDepositIx(creator, creator, id);
        await sendIx(connection, depIx, creator, (tx) => wallet.signTransaction(tx));
      }

      const pda = dealPda(creator, id);
      dealLink = `/deal/${creator.toBase58()}-${id.toString()}`;
      status = `Done. Deal PDA: ${pda.toBase58()}`;
    } catch (e: any) {
      error = e?.message || String(e);
      status = '';
    } finally {
      busy = false;
    }
  }
</script>

<div class="container">
  <div class="page-intro">
    <h1>Create deal</h1>
    <p>You are the payer. Funds stay in the deal PDA until both sides confirm.</p>
    <p class="fee-note">
      Fee disclosure: protocol fee (default <strong>6%</strong>) is taken only on successful
      dual-confirm release. Mutual cancel refunds 100%. No KYC; no custody backend.
    </p>
  </div>

  <div class="form-layout">
    <div class="panel">
      <div class="field">
        <label for="payee">Payee wallet</label>
        <span class="hint">Base58 address that receives payout on release</span>
        <input id="payee" bind:value={payee} placeholder="Base58 pubkey" class="mono" />
      </div>

      <div class="field">
        <label for="amount">Amount (SOL)</label>
        <span class="hint">Exact deposit required after create</span>
        <input id="amount" type="number" step="0.001" min="0.001" bind:value={amountSol} />
      </div>

      <div class="field">
        <label for="dealId">Deal ID</label>
        <span class="hint">u64, unique per creator wallet</span>
        <input id="dealId" bind:value={dealId} class="mono" />
      </div>

      <div class="field">
        <label for="terms">Terms</label>
        <span class="hint">Hashed on-chain; optional plaintext for your records</span>
        <textarea id="terms" rows="3" bind:value={terms} placeholder="Scope, milestones, delivery notes…"
        ></textarea>
      </div>

      <label class="field-check">
        <input type="checkbox" bind:checked={depositNow} />
        <span>Deposit immediately after create</span>
      </label>

      <div class="btn-row">
        <button class="btn primary" type="button" on:click={submit} disabled={busy || !$wallet.connected}>
          {busy ? 'Submitting…' : depositNow ? 'Create & deposit' : 'Create deal'}
        </button>
      </div>

      {#if !$wallet.connected}
        <p class="muted" style="margin-top:0.85rem;font-size:0.88rem">
          Connect a wallet in the nav before submitting.
        </p>
      {/if}

      {#if status}<div class="alert ok mono">{status}</div>{/if}
      {#if error}<div class="alert error">{error}</div>{/if}
      {#if dealLink}
        <p style="margin-top:0.75rem">
          <a href={dealLink}>Open deal page →</a>
        </p>
      {/if}
    </div>

    <aside class="summary-card" aria-label="Deal summary">
      <h3>Settlement summary</h3>
      <div class="summary-row">
        <span>Deposit</span>
        <span class="val">{amountNum.toFixed(4)} SOL</span>
      </div>
      <div class="summary-row accent">
        <span>Protocol fee ({FEE_PCT}%)</span>
        <span class="val">{feeSol.toFixed(4)} SOL</span>
      </div>
      <div class="summary-row">
        <span>Payee on release</span>
        <span class="val">{payoutSol.toFixed(4)} SOL</span>
      </div>
      <div class="summary-row">
        <span>On cancel</span>
        <span class="val">100% refund</span>
      </div>
      <button
        class="btn primary"
        type="button"
        on:click={submit}
        disabled={busy || !$wallet.connected}
      >
        {busy ? 'Submitting…' : depositNow ? 'Create & deposit' : 'Create deal'}
      </button>
      <p class="muted" style="font-size:0.75rem;margin:0.75rem 0 0">
        Fee is illustrative from the default 6%. On-chain bps come from config PDA.
      </p>
    </aside>
  </div>
</div>

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

  let payee = '';
  let amountSol = 0.1;
  let dealId = String(Date.now() % 1_000_000_000);
  let terms = '';
  let depositNow = true;
  let status = '';
  let error = '';
  let dealLink = '';
  let busy = false;

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
  <h1>Create deal</h1>
  <p class="muted">You are the payer. Funds stay in the deal PDA until dual confirmation.</p>
  <p class="muted fee-note">Fee disclosure: protocol fee (default 6%) is taken only on successful dual-confirm release. Mutual cancel refunds 100%. No KYC; no custody backend.</p>

  <div class="card">
    <label for="payee">Payee wallet address</label>
    <input id="payee" bind:value={payee} placeholder="Base58 pubkey" class="mono" />

    <label for="amount">Amount (SOL)</label>
    <input id="amount" type="number" step="0.001" min="0.001" bind:value={amountSol} />

    <label for="dealId">Deal ID (u64, unique per creator)</label>
    <input id="dealId" bind:value={dealId} class="mono" />

    <label for="terms">Terms (hashed on-chain; optional plaintext)</label>
    <textarea id="terms" rows="3" bind:value={terms} placeholder="Scope, milestones, delivery notes…"></textarea>

    <label>
      <input type="checkbox" bind:checked={depositNow} /> Deposit immediately after create
    </label>

    <div style="margin-top:1rem">
      <button class="btn primary" on:click={submit} disabled={busy || !$wallet.connected}>
        {busy ? 'Submitting…' : depositNow ? 'Create & deposit' : 'Create deal'}
      </button>
    </div>

    {#if status}<p class="ok mono">{status}</p>{/if}
    {#if error}<p class="error">{error}</p>{/if}
    {#if dealLink}<p><a href={dealLink}>Open deal page →</a></p>{/if}
  </div>
</div>

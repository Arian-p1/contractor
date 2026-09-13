<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { PublicKey } from '@solana/web3.js';
  import { wallet } from '$lib/wallet';
  import {
    buildConfirmCancelIx,
    buildConfirmCompleteIx,
    buildDepositIx,
    fetchConfig,
    fetchDeal,
    getConnection,
    lamportsToSol,
    sendIx,
    type DealAccount
  } from '$lib/program';

  let deal: DealAccount | null = null;
  let feeBps = 0;
  let feeRecipient: PublicKey | null = null;
  let error = '';
  let status = '';
  let busy = false;
  let creatorPk: PublicKey | null = null;
  let dealId = 0n;

  function parseRoute(id: string) {
    // format: <creatorBase58>-<dealId>
    const idx = id.lastIndexOf('-');
    if (idx <= 0) throw new Error('Invalid deal URL. Use /deal/<creator>-<dealId>');
    creatorPk = new PublicKey(id.slice(0, idx));
    dealId = BigInt(id.slice(idx + 1));
  }

  async function reload() {
    if (!creatorPk) return;
    const connection = getConnection();
    deal = await fetchDeal(connection, creatorPk, dealId);
    const cfg = await fetchConfig(connection);
    if (cfg) {
      feeBps = cfg.feeBps;
      feeRecipient = cfg.feeRecipient;
    }
  }

  onMount(async () => {
    try {
      parseRoute($page.params.id);
      await reload();
    } catch (e: any) {
      error = e?.message || String(e);
    }
  });

  async function deposit() {
    if (!$wallet.publicKey || !creatorPk || !deal) return;
    busy = true;
    error = '';
    try {
      const connection = getConnection();
      const ix = await buildDepositIx($wallet.publicKey, creatorPk, dealId);
      status = 'Depositing…';
      await sendIx(connection, ix, $wallet.publicKey, (tx) => wallet.signTransaction(tx));
      status = 'Deposited.';
      await reload();
    } catch (e: any) {
      error = e?.message || String(e);
    } finally {
      busy = false;
    }
  }

  async function confirmComplete() {
    if (!$wallet.publicKey || !creatorPk || !deal || !feeRecipient) return;
    busy = true;
    error = '';
    try {
      const connection = getConnection();
      const ix = await buildConfirmCompleteIx(
        $wallet.publicKey,
        creatorPk,
        dealId,
        deal.payee,
        feeRecipient
      );
      status = 'Confirming complete…';
      await sendIx(connection, ix, $wallet.publicKey, (tx) => wallet.signTransaction(tx));
      status = 'Confirmed.';
      await reload();
    } catch (e: any) {
      error = e?.message || String(e);
    } finally {
      busy = false;
    }
  }

  async function confirmCancel() {
    if (!$wallet.publicKey || !creatorPk || !deal) return;
    busy = true;
    error = '';
    try {
      const connection = getConnection();
      const ix = await buildConfirmCancelIx(
        $wallet.publicKey,
        creatorPk,
        dealId,
        deal.payer
      );
      status = 'Confirming cancel…';
      await sendIx(connection, ix, $wallet.publicKey, (tx) => wallet.signTransaction(tx));
      status = 'Cancel confirmed.';
      await reload();
    } catch (e: any) {
      error = e?.message || String(e);
    } finally {
      busy = false;
    }
  }

  $: badgeClass =
    deal?.status === 'Funded'
      ? 'funded'
      : deal?.status === 'Released'
        ? 'released'
        : deal?.status === 'Refunded'
          ? 'refunded'
          : '';
</script>

<div class="container">
  <h1>Deal</h1>
  {#if error}<p class="error">{error}</p>{/if}

  {#if !deal && !error}
    <p class="muted">Loading…</p>
  {:else if deal}
    <div class="card">
      <p>
        Status: <span class="badge {badgeClass}">{deal.status}</span>
        · Fee: {(feeBps / 100).toFixed(2)}%
      </p>
      <p class="mono muted">Deal ID: {deal.dealId.toString()}</p>
      <p class="mono muted">Amount: {lamportsToSol(deal.amount)} SOL</p>
      <p class="mono muted">Payer: {deal.payer.toBase58()}</p>
      <p class="mono muted">Payee: {deal.payee.toBase58()}</p>
      <p class="muted">
        Complete: payer={deal.payerComplete ? '✓' : '·'} payee={deal.payeeComplete ? '✓' : '·'}
        · Cancel: payer={deal.payerCancel ? '✓' : '·'} payee={deal.payeeCancel ? '✓' : '·'}
      </p>
    </div>

    <div class="card">
      {#if deal.status === 'Created'}
        <button class="btn primary" on:click={deposit} disabled={busy || !$wallet.connected}>
          Deposit
        </button>
        <button class="btn danger" on:click={confirmCancel} disabled={busy || !$wallet.connected}>
          Confirm cancel
        </button>
      {:else if deal.status === 'Funded'}
        <button class="btn primary" on:click={confirmComplete} disabled={busy || !$wallet.connected}>
          Confirm complete
        </button>
        <button class="btn danger" on:click={confirmCancel} disabled={busy || !$wallet.connected}>
          Confirm cancel
        </button>
      {:else}
        <p class="muted">Deal is terminal ({deal.status}).</p>
      {/if}
      {#if status}<p class="ok">{status}</p>{/if}
    </div>
  {/if}
</div>

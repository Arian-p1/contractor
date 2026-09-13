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
  let copied = '';

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
      const id = $page.params.id;
      if (!id) throw new Error('Missing deal id in URL');
      parseRoute(id);
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

  function truncate(addr: string): string {
    if (addr.length <= 12) return addr;
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }

  async function copyAddr(addr: string, key: string) {
    try {
      await navigator.clipboard.writeText(addr);
      copied = key;
      setTimeout(() => {
        if (copied === key) copied = '';
      }, 1400);
    } catch {
      /* ignore */
    }
  }

  $: badgeClass =
    deal?.status === 'Created'
      ? 'created'
      : deal?.status === 'Funded'
        ? 'funded'
        : deal?.status === 'Released'
          ? 'released'
          : deal?.status === 'Refunded'
            ? 'refunded'
            : '';

  $: stepCreated =
    deal?.status === 'Created' ? 'active' : deal ? 'done' : '';
  $: stepFunded =
    deal?.status === 'Funded'
      ? 'active'
      : deal?.status === 'Released' || deal?.status === 'Refunded'
        ? 'done'
        : '';
  $: stepTerminal =
    deal?.status === 'Released'
      ? 'done'
      : deal?.status === 'Refunded'
        ? 'terminal-bad'
        : '';
  $: terminalLabel =
    deal?.status === 'Refunded' ? 'Refunded' : 'Released';
</script>

<div class="container">
  <div class="deal-header">
    <h1>Deal</h1>
    {#if deal}
      <span class="badge {badgeClass}">{deal.status}</span>
    {/if}
  </div>

  {#if error}<div class="alert error">{error}</div>{/if}

  {#if !deal && !error}
    <p class="muted">Loading deal…</p>
  {:else if deal}
    <div class="stepper" aria-label="Deal status">
      <div class="step {stepCreated}">
        <div class="label">Step 1</div>
        <div class="name">Created</div>
      </div>
      <div class="step {stepFunded}">
        <div class="label">Step 2</div>
        <div class="name">Funded</div>
      </div>
      <div class="step {stepTerminal}">
        <div class="label">Step 3</div>
        <div class="name">{terminalLabel}</div>
      </div>
    </div>

    <div class="panel">
      <div class="meta-grid">
        <div class="meta-item">
          <div class="k">Amount</div>
          <div class="v">{lamportsToSol(deal.amount)} SOL</div>
        </div>
        <div class="meta-item">
          <div class="k">Protocol fee</div>
          <div class="v">{(feeBps / 100).toFixed(2)}%</div>
        </div>
        <div class="meta-item">
          <div class="k">Deal ID</div>
          <div class="v">{deal.dealId.toString()}</div>
        </div>
        <div class="meta-item">
          <div class="k">Status</div>
          <div class="v">{deal.status}</div>
        </div>
      </div>

      <div class="party-list">
        <div class="party-row">
          <span class="role">Payer</span>
          <span class="addr" title={deal.payer.toBase58()}>{truncate(deal.payer.toBase58())}</span>
          <button
            class="copy"
            type="button"
            on:click={() => deal && copyAddr(deal.payer.toBase58(), 'payer')}
          >
            {copied === 'payer' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div class="party-row">
          <span class="role">Payee</span>
          <span class="addr" title={deal.payee.toBase58()}>{truncate(deal.payee.toBase58())}</span>
          <button
            class="copy"
            type="button"
            on:click={() => deal && copyAddr(deal.payee.toBase58(), 'payee')}
          >
            {copied === 'payee' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div class="flags" aria-label="Confirmations">
        <span class="flag" class:on={deal.payerComplete}>Payer complete {deal.payerComplete ? '✓' : '·'}</span>
        <span class="flag" class:on={deal.payeeComplete}>Payee complete {deal.payeeComplete ? '✓' : '·'}</span>
        <span class="flag" class:on={deal.payerCancel}>Payer cancel {deal.payerCancel ? '✓' : '·'}</span>
        <span class="flag" class:on={deal.payeeCancel}>Payee cancel {deal.payeeCancel ? '✓' : '·'}</span>
      </div>
    </div>

    <div class="panel actions-card">
      <h3>Actions</h3>
      <div class="btn-row">
        {#if deal.status === 'Created'}
          <button class="btn primary" type="button" on:click={deposit} disabled={busy || !$wallet.connected}>
            Deposit
          </button>
          <button class="btn danger" type="button" on:click={confirmCancel} disabled={busy || !$wallet.connected}>
            Confirm cancel
          </button>
        {:else if deal.status === 'Funded'}
          <button
            class="btn good"
            type="button"
            on:click={confirmComplete}
            disabled={busy || !$wallet.connected}
          >
            Confirm complete
          </button>
          <button class="btn danger" type="button" on:click={confirmCancel} disabled={busy || !$wallet.connected}>
            Confirm cancel
          </button>
        {:else}
          <p class="muted" style="margin:0">Deal is terminal ({deal.status}). No further actions.</p>
        {/if}
      </div>
      {#if !$wallet.connected && (deal.status === 'Created' || deal.status === 'Funded')}
        <p class="muted" style="margin-top:0.75rem;font-size:0.88rem">
          Connect a wallet to act on this deal.
        </p>
      {/if}
      {#if status}<div class="alert ok">{status}</div>{/if}
    </div>
  {/if}
</div>

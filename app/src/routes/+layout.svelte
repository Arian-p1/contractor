<script lang="ts">
  import '../lib/styles.css';
  import { wallet, shortAddress } from '$lib/wallet';
</script>

<nav class="nav">
  <a class="logo" href="/"><span class="logo-mark" aria-hidden="true"></span>Contractor</a>
  <div class="nav-links">
    <a class="nav-link" href="/">Home</a>
    <a class="nav-link" href="/create">Create deal</a>
    {#if $wallet.connected}
      <span class="wallet-chip">
        <span class="dot" aria-hidden="true"></span>
        <span class="mono">{$shortAddress}</span>
      </span>
      <button class="btn ghost" type="button" on:click={() => wallet.disconnect()}>Disconnect</button>
    {:else}
      <button
        class="btn primary"
        type="button"
        on:click={() => wallet.connect()}
        disabled={$wallet.connecting}
      >
        {$wallet.connecting ? 'Connecting…' : 'Connect wallet'}
      </button>
    {/if}
  </div>
</nav>

{#if $wallet.error}
  <div class="container" style="padding-bottom:0">
    <div class="alert error">{$wallet.error}</div>
  </div>
{/if}

<slot />

<footer>
  <p>
    Non-custodial SOL escrow. No KYC. No admin keys. Fee only on successful release.
    <a href="https://github.com/Arian-p1/contractor">Source</a>
  </p>
  <p class="muted">
    Not legal, tax, or financial advice. Smart contracts can have bugs; dual-confirm can strand funds
    on dispute. See docs/LEGAL-RISK.md. Use at your own risk.
  </p>
</footer>

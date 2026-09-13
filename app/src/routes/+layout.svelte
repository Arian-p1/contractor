<script lang="ts">
  import '../lib/styles.css';
  import { wallet, shortAddress } from '$lib/wallet';
</script>

<nav class="nav">
  <a class="logo" href="/">Contractor</a>
  <div class="nav-links">
    <a href="/">Home</a>
    <a href="/create">Create deal</a>
    {#if $wallet.connected}
      <span class="mono muted">{$shortAddress}</span>
      <button class="btn" on:click={() => wallet.disconnect()}>Disconnect</button>
    {:else}
      <button class="btn primary" on:click={() => wallet.connect()} disabled={$wallet.connecting}>
        {$wallet.connecting ? 'Connecting…' : 'Connect wallet'}
      </button>
    {/if}
  </div>
</nav>

<slot />

<footer>
  <p>
    Non-custodial SOL escrow. No KYC. No admin keys. Fee only on successful release.
    <a href="https://github.com/Arian-p1/contractor">Source</a>
  </p>
  <p class="muted">
    Not legal, tax, or financial advice. Smart contracts can have bugs; dual-confirm can strand funds on dispute.
    See docs/LEGAL-RISK.md. Use at your own risk.
  </p>
</footer>

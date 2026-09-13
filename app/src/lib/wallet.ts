import { writable, derived, get } from 'svelte/store';
import { PublicKey, Transaction, Connection } from '@solana/web3.js';
import { RPC_URL } from './program';

export interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  error: string | null;
}

function createWallet() {
  const { subscribe, set, update } = writable<WalletState>({
    connected: false,
    publicKey: null,
    connecting: false,
    error: null
  });

  function getProvider(): any | null {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    return w.solana?.isPhantom ? w.solana : w.solflare ?? w.solana ?? null;
  }

  return {
    subscribe,
    async connect() {
      update((s) => ({ ...s, connecting: true, error: null }));
      try {
        const provider = getProvider();
        if (!provider) {
          throw new Error('No Solana wallet found. Install Phantom or Solflare.');
        }
        const resp = await provider.connect();
        const pk = new PublicKey(resp.publicKey.toString());
        set({ connected: true, publicKey: pk, connecting: false, error: null });
      } catch (e: any) {
        set({
          connected: false,
          publicKey: null,
          connecting: false,
          error: e?.message || String(e)
        });
      }
    },
    async disconnect() {
      try {
        const provider = getProvider();
        if (provider?.disconnect) await provider.disconnect();
      } catch {
        /* ignore */
      }
      set({ connected: false, publicKey: null, connecting: false, error: null });
    },
    async signTransaction(tx: Transaction): Promise<Transaction> {
      const provider = getProvider();
      if (!provider) throw new Error('Wallet not connected');
      return provider.signTransaction(tx);
    },
    getConnection(): Connection {
      return new Connection(RPC_URL, 'confirmed');
    }
  };
}

export const wallet = createWallet();
export const shortAddress = derived(wallet, ($w) => {
  if (!$w.publicKey) return '';
  const s = $w.publicKey.toBase58();
  return `${s.slice(0, 4)}…${s.slice(-4)}`;
});

import { writable, derived, get } from 'svelte/store';
import { Keypair, PublicKey, Transaction, Connection } from '@solana/web3.js';
import { RPC_URL } from './program';
import { env } from '$env/dynamic/public';
import bs58 from 'bs58';

export type WalletMode = 'none' | 'injected' | 'local';

export interface WalletState {
  connected: boolean;
  publicKey: PublicKey | null;
  connecting: boolean;
  error: string | null;
  mode: WalletMode;
}

const LOCAL_STORAGE_KEY = 'contractor.localDemoSecret';

function isLocalNetwork(): boolean {
  const net = (env.PUBLIC_NETWORK || '').toLowerCase();
  const rpc = (env.PUBLIC_SOLANA_RPC || RPC_URL || '').toLowerCase();
  return (
    net === 'localnet' ||
    net === 'local' ||
    rpc.includes('127.0.0.1') ||
    rpc.includes('localhost')
  );
}

export const isLocalnet = isLocalNetwork();

function loadOrCreateLocalKeypair(): Keypair {
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (existing) {
        return Keypair.fromSecretKey(bs58.decode(existing));
      }
    } catch {
      /* fall through and mint a fresh one */
    }
  }
  const kp = Keypair.generate();
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, bs58.encode(kp.secretKey));
  }
  return kp;
}

function createWallet() {
  const store = writable<WalletState>({
    connected: false,
    publicKey: null,
    connecting: false,
    error: null,
    mode: 'none'
  });

  let localKeypair: Keypair | null = null;

  function getProvider(): any | null {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    return w.solana?.isPhantom ? w.solana : w.solflare ?? w.solana ?? null;
  }

  return {
    subscribe: store.subscribe,
    /** Connect Phantom / Solflare (or other injected wallet). */
    async connect() {
      store.update((s) => ({ ...s, connecting: true, error: null }));
      try {
        const provider = getProvider();
        if (!provider) {
          throw new Error('No Solana wallet found. Install Phantom or Solflare.');
        }
        const resp = await provider.connect();
        const pk = new PublicKey(resp.publicKey.toString());
        localKeypair = null;
        store.set({
          connected: true,
          publicKey: pk,
          connecting: false,
          error: null,
          mode: 'injected'
        });
      } catch (e: any) {
        store.set({
          connected: false,
          publicKey: null,
          connecting: false,
          error: e?.message || String(e),
          mode: 'none'
        });
      }
    },
    /** In-browser localnet demo wallet (no extension). Only available when PUBLIC_NETWORK is localnet. */
    async connectLocal() {
      if (!isLocalNetwork()) {
        store.update((s) => ({
          ...s,
          connecting: false,
          error: 'Local demo wallet is only available on localnet.'
        }));
        return;
      }
      store.update((s) => ({ ...s, connecting: true, error: null }));
      try {
        localKeypair = loadOrCreateLocalKeypair();
        store.set({
          connected: true,
          publicKey: localKeypair.publicKey,
          connecting: false,
          error: null,
          mode: 'local'
        });
      } catch (e: any) {
        localKeypair = null;
        store.set({
          connected: false,
          publicKey: null,
          connecting: false,
          error: e?.message || String(e),
          mode: 'none'
        });
      }
    },
    async disconnect() {
      const mode = get(store).mode;
      try {
        if (mode === 'injected') {
          const provider = getProvider();
          if (provider?.disconnect) await provider.disconnect();
        }
      } catch {
        /* ignore */
      }
      localKeypair = null;
      store.set({
        connected: false,
        publicKey: null,
        connecting: false,
        error: null,
        mode: 'none'
      });
    },
    async signTransaction(tx: Transaction): Promise<Transaction> {
      const state = get(store);
      if (state.mode === 'local') {
        if (!localKeypair) {
          localKeypair = loadOrCreateLocalKeypair();
        }
        tx.partialSign(localKeypair);
        return tx;
      }
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

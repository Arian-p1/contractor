import { PublicKey, SystemProgram, Connection, Transaction, type TransactionInstruction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { env } from '$env/dynamic/public';

export const PROGRAM_ID = new PublicKey(
  env.PUBLIC_PROGRAM_ID || 'DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k'
);

export const RPC_URL = env.PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';

export function getConnection(): Connection {
  return new Connection(RPC_URL, 'confirmed');
}

export function configPda(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID);
  return pda;
}

export function dealPda(creator: PublicKey, dealId: bigint): PublicKey {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(dealId);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('deal'), creator.toBuffer(), buf],
    PROGRAM_ID
  );
  return pda;
}

/** Anchor discriminator = first 8 bytes of sha256("global:<ix_name>") */
async function discriminator(name: string): Promise<Buffer> {
  const data = new TextEncoder().encode(`global:${name}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Buffer.from(hash).slice(0, 8);
}

function u16le(n: number): Buffer {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
}

function u64le(n: bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(n);
  return b;
}

export async function buildCreateDealIx(
  creator: PublicKey,
  dealId: bigint,
  payee: PublicKey,
  amount: bigint,
  termsHash: Uint8Array
): Promise<TransactionInstruction> {
  const disc = await discriminator('create_deal');
  const data = Buffer.concat([
    disc,
    u64le(dealId),
    payee.toBuffer(),
    u64le(amount),
    Buffer.from(termsHash)
  ]);
  const deal = dealPda(creator, dealId);
  return {
    keys: [
      { pubkey: creator, isSigner: true, isWritable: true },
      { pubkey: deal, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  };
}

export async function buildDepositIx(
  payer: PublicKey,
  creator: PublicKey,
  dealId: bigint
): Promise<TransactionInstruction> {
  const disc = await discriminator('deposit');
  const deal = dealPda(creator, dealId);
  return {
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: deal, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data: disc
  };
}

export async function buildConfirmCompleteIx(
  signer: PublicKey,
  creator: PublicKey,
  dealId: bigint,
  payee: PublicKey,
  feeRecipient: PublicKey
): Promise<TransactionInstruction> {
  const disc = await discriminator('confirm_complete');
  const deal = dealPda(creator, dealId);
  return {
    keys: [
      { pubkey: signer, isSigner: true, isWritable: false },
      { pubkey: configPda(), isSigner: false, isWritable: false },
      { pubkey: deal, isSigner: false, isWritable: true },
      { pubkey: payee, isSigner: false, isWritable: true },
      { pubkey: feeRecipient, isSigner: false, isWritable: true }
    ],
    programId: PROGRAM_ID,
    data: disc
  };
}

export async function buildConfirmCancelIx(
  signer: PublicKey,
  creator: PublicKey,
  dealId: bigint,
  payer: PublicKey
): Promise<TransactionInstruction> {
  const disc = await discriminator('confirm_cancel');
  const deal = dealPda(creator, dealId);
  return {
    keys: [
      { pubkey: signer, isSigner: true, isWritable: false },
      { pubkey: deal, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: false, isWritable: true }
    ],
    programId: PROGRAM_ID,
    data: disc
  };
}

export type DealStatus = 'Created' | 'Funded' | 'Released' | 'Refunded' | 'Unknown';

export interface DealAccount {
  creator: PublicKey;
  payer: PublicKey;
  payee: PublicKey;
  amount: bigint;
  dealId: bigint;
  termsHash: Uint8Array;
  status: DealStatus;
  payerComplete: boolean;
  payeeComplete: boolean;
  payerCancel: boolean;
  payeeCancel: boolean;
  createdAt: bigint;
  bump: number;
}

const STATUS_MAP: DealStatus[] = ['Created', 'Funded', 'Released', 'Refunded'];

export function parseDeal(data: Buffer): DealAccount {
  // Skip 8-byte Anchor discriminator
  let o = 8;
  const readPk = () => {
    const pk = new PublicKey(data.subarray(o, o + 32));
    o += 32;
    return pk;
  };
  const readU64 = () => {
    const v = data.readBigUInt64LE(o);
    o += 8;
    return v;
  };
  const readI64 = () => {
    const v = data.readBigInt64LE(o);
    o += 8;
    return v;
  };
  const creator = readPk();
  const payer = readPk();
  const payee = readPk();
  const amount = readU64();
  const dealId = readU64();
  const termsHash = data.subarray(o, o + 32);
  o += 32;
  const statusByte = data[o++];
  const payerComplete = data[o++] === 1;
  const payeeComplete = data[o++] === 1;
  const payerCancel = data[o++] === 1;
  const payeeCancel = data[o++] === 1;
  const createdAt = readI64();
  const bump = data[o++];
  return {
    creator,
    payer,
    payee,
    amount,
    dealId,
    termsHash,
    status: STATUS_MAP[statusByte] ?? 'Unknown',
    payerComplete,
    payeeComplete,
    payerCancel,
    payeeCancel,
    createdAt,
    bump
  };
}

export async function fetchDeal(
  connection: Connection,
  creator: PublicKey,
  dealId: bigint
): Promise<DealAccount | null> {
  const pda = dealPda(creator, dealId);
  const info = await connection.getAccountInfo(pda);
  if (!info) return null;
  return parseDeal(Buffer.from(info.data));
}

export async function fetchConfig(connection: Connection): Promise<{
  feeBps: number;
  feeRecipient: PublicKey;
} | null> {
  const info = await connection.getAccountInfo(configPda());
  if (!info) return null;
  const data = Buffer.from(info.data);
  // disc(8) + fee_bps(u16) + fee_recipient(32) + bump(1)
  const feeBps = data.readUInt16LE(8);
  const feeRecipient = new PublicKey(data.subarray(10, 42));
  return { feeBps, feeRecipient };
}

export async function sendIx(
  connection: Connection,
  ix: TransactionInstruction,
  feePayer: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const tx = new Transaction().add(ix);
  tx.feePayer = feePayer;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  const signed = await signTransaction(tx);
  const sig = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(sig, 'confirmed');
  return sig;
}

export function lamportsToSol(lamports: bigint | number): string {
  return (Number(lamports) / 1e9).toFixed(4);
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * 1e9));
}

export async function hashTerms(text: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hash);
}

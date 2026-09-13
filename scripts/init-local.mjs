import {
  Connection, Keypair, PublicKey, SystemProgram, Transaction,
  TransactionInstruction, sendAndConfirmTransaction
} from "@solana/web3.js";
import fs from "fs";

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const secret = JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json", "utf8"));
const wallet = Keypair.fromSecretKey(Uint8Array.from(secret));
const programId = new PublicKey("DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k");
const feeBps = 600;
const feeRecipient = new PublicKey("6E1Ex6LpamiwVEPej6yYStL9hytarsefzwv8mnfG1R8s");
const [configPda] = PublicKey.findProgramAddressSync([Buffer.from("config")], programId);

const existing = await connection.getAccountInfo(configPda);
if (existing) {
  console.log("already initialized", configPda.toBase58());
  process.exit(0);
}

const disc = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);
const data = Buffer.alloc(8 + 2 + 32);
disc.copy(data, 0);
data.writeUInt16LE(feeBps, 8);
feeRecipient.toBytes().forEach((b, i) => data[10 + i] = b);

const ix = new TransactionInstruction({
  programId,
  keys: [
    { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
    { pubkey: configPda, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ],
  data,
});

const sig = await sendAndConfirmTransaction(connection, new Transaction().add(ix), [wallet]);
console.log({
  program: programId.toBase58(),
  config: configPda.toBase58(),
  feeBps,
  feeRecipient: feeRecipient.toBase58(),
  initializeTx: sig,
});

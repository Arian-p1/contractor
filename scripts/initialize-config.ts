/**
 * One-shot config initialize. Non-custodial: no backend keys stored here.
 *
 * Usage:
 *   FEE_BPS=600 FEE_RECIPIENT=<pubkey> ANCHOR_PROVIDER_URL=... ANCHOR_WALLET=... \
 *     npx ts-node --esm scripts/initialize-config.ts
 * or after `anchor build`:
 *   anchor run initialize   # if wired; else:
 *   npx ts-mocha -p ./tsconfig.json -t 100000 scripts/initialize-config.ts
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import type { Contractor } from "../target/types/contractor";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Contractor as Program<Contractor>;

  const feeBps = Number(process.env.FEE_BPS || "600");
  const feeRecipientStr = process.env.FEE_RECIPIENT;
  if (!feeRecipientStr || feeRecipientStr.startsWith("REPLACE")) {
    throw new Error("Set FEE_RECIPIENT to a real pubkey (prefer multisig).");
  }
  if (feeBps < 1 || feeBps > 1000) {
    throw new Error("FEE_BPS must be 1..=1000");
  }

  const feeRecipient = new PublicKey(feeRecipientStr);
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  );

  console.log("program", program.programId.toBase58());
  console.log("config", configPda.toBase58());
  console.log("fee_bps", feeBps, "fee_recipient", feeRecipient.toBase58());

  const existing = await provider.connection.getAccountInfo(configPda);
  if (existing) {
    console.log("Config already initialized — aborting.");
    return;
  }

  const sig = await program.methods
    .initialize(feeBps, feeRecipient)
    .accounts({
      authority: provider.wallet.publicKey,
      config: configPda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("initialize tx", sig);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

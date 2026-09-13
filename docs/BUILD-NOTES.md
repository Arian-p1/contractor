# Build notes (box / CI)

Anchor **0.30.1** + Solana **1.18** `cargo-build-sbf` (rustc 1.75) rejects crates that require `edition2024`.

If `anchor build` fails on `toml_parser` / `zeroize_derive` / similar:

```bash
cargo +1.79.0 update -p proc-macro-crate@3.5.0 --precise 3.1.0
cargo +1.79.0 update -p zeroize_derive --precise 1.4.2
# regenerate until no edition2024 crates remain in Cargo.lock
anchor build
anchor test
```

Frontend:

```bash
cd app && npm install && npm run build
```

Program id (dev keypair): `DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k`

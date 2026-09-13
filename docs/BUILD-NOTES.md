# Build notes (box / CI)

## Verified combo (2026-09)

| Piece | Version / note |
|-------|----------------|
| Anchor CLI | **0.30.1** |
| Solana CLI | **1.18.17** |
| Host rustc (optional) | stable / 1.79+ |
| SBF platform-tools | **v1.48** (rustc **1.84.1**) — symlink over default v1.41 if needed |
| `Cargo.lock` | **version = 3**, transitive crates pinned away from `edition2024` |

### platform-tools

Solana 1.18’s default `cargo-build-sbf` reports tools **v1.41** (rustc 1.75), which rejects many current crates. On this box we point the SDK cache at **v1.48**:

```bash
# if v1.48 already cached:
mv ~/.cache/solana/v1.41/platform-tools ~/.cache/solana/v1.41/platform-tools-1.75.bak
ln -s ~/.cache/solana/v1.48/platform-tools ~/.cache/solana/v1.41/platform-tools
# similarly under $SOLANA_INSTALL/bin/sdk/sbf/dependencies/platform-tools if present
rustup toolchain link solana ~/.cache/solana/v1.48/platform-tools/rust
```

Or: `cargo-build-sbf --tools-version v1.48 …`

### Cargo.lock pins (anti-edition2024 / MSRV)

If resolution pulls `edition2024` crates or lockfile **v4**, regenerate with cargo stable then force v3 + pin:

```bash
cargo +stable update -p blake3 --precise 1.5.5
cargo +stable update -p jobserver --precise 0.1.32
cargo +stable update -p toml@0.8.23 --precise 0.8.19
cargo +stable update -p toml_edit@0.22.27 --precise 0.22.20
cargo +stable update -p indexmap --precise 2.2.6
# …plus other high-MSRV bumps as needed (serde, thiserror, cc, libc, …)
# Keep lockfile version = 3 (SBF cargo cannot read v4):
python3 -c "from pathlib import Path; p=Path('Cargo.lock'); t=p.read_text(); p.write_text(t.replace('version = 4\n','version = 3\n',1))"
```

Also pin `proc-macro-crate` / `zeroize_derive` if they float:

```bash
cargo +stable update -p proc-macro-crate@3.5.0 --precise 3.1.0
cargo +stable update -p zeroize_derive --precise 1.4.2
```

### Build & test

```bash
# Program binary (SBF) — succeeds
anchor build --no-idl

# IDL: host rustc 1.98 + anchor-syn 0.30.1 disagree on Span::source_file.
# Hand-maintained IDL + TS types live under target/idl and target/types
# (regenerate TS with: anchor idl type target/idl/contractor.json -o target/types/contractor.ts)
# Optional: try `RUSTUP_TOOLCHAIN=1.79.0 anchor idl build` after aligning proc-macro2.

anchor test --skip-build   # after build + IDL present
# Or full: ensure Anchor.toml test script uses npx ts-mocha
```

**Status:** `anchor build --no-idl` ✅ · `anchor test --skip-build` ✅ (14 passing) · automated `anchor build` IDL step ❌ on rustc 1.98 (use committed/hand IDL).

### Frontend

```bash
cd app && npm install && npm run build
```

Program id (dev keypair): `DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k`

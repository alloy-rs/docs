---
description: Complete reference guide for migrating from ethers-rs to Alloy with crate and type mappings
---

## Reference

[ethers-rs](https://github.com/gakonst/ethers-rs/) has been deprecated in favor of [Alloy](https://github.com/alloy-rs/) and [Foundry](https://github.com/foundry-rs/).

The following is a reference guide for finding the migration path for your specific crate, dependency or information source.

### Documentation

- Book: [`ethers-rs/book`](https://github.com/gakonst/ethers-rs/tree/master/book) `->` [`alloy-rs/book`](https://github.com/alloy-rs/book)

### Examples

- Examples: [`ethers-rs/examples`](https://github.com/gakonst/ethers-rs/tree/master/examples) `->` [`alloy-rs/examples`](https://github.com/alloy-rs/examples)

### Crates

- Meta-crate: [`ethers`](https://github.com/gakonst/ethers-rs/tree/master/ethers) `->` [`alloy`](https://github.com/alloy-rs/alloy/tree/main/crates/alloy)
- Address book: [`ethers::addressbook`](https://github.com/gakonst/ethers-rs/tree/master/ethers-addressbook) `->` Not planned
- Compilers: [`ethers::solc`](https://github.com/gakonst/ethers-rs/tree/master/ethers-solc) `->` [`foundry-compilers`](https://github.com/foundry-rs/compilers)
- Contract: [`ethers::contract`](https://github.com/gakonst/ethers-rs/tree/master/ethers-contract) `->` [`alloy::contract`](https://github.com/alloy-rs/alloy/tree/main/crates/contract)
- Core: [`ethers::core`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core) `->` [`alloy::core`](https://github.com/alloy-rs/core)
  - Types: [`ethers::core::types::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types) `->` See [Types](/migrating-from-ethers/reference#types) section
- Etherscan: [`ethers::etherscan`](https://github.com/gakonst/ethers-rs/tree/master/ethers-etherscan) `->` [`foundry-block-explorers`](https://github.com/foundry-rs/block-explorers)
- Middleware: [`ethers::middleware`](https://github.com/gakonst/ethers-rs/tree/master/ethers-middleware) `->` Fillers [`alloy::provider::{fillers, layers}`](https://github.com/alloy-rs/alloy/tree/main/crates/provider/src)
  - Gas oracle: [`ethers::middleware::GasOracleMiddleware`](https://github.com/gakonst/ethers-rs/tree/master/ethers-middleware/src/gas_oracle/middleware.rs) `->` Gas filler [`alloy::provider::GasFiller`](https://github.com/alloy-rs/examples/tree/main/examples/fillers/examples/gas_filler.rs)
  - Gas escalator: [`ethers::middleware::GasEscalatorMiddleware`](https://github.com/gakonst/ethers-rs/tree/master/ethers-middleware/src/gas_escalator) `->` Not planned
  - Transformer: [`ethers::middleware::TransformerMiddleware`](https://github.com/gakonst/ethers-rs/tree/master/ethers-middleware/src/transformer) `->` Not planned
  - Policy: [`ethers::middleware::policy::*`](https://github.com/gakonst/ethers-rs/blob/master/ethers-middleware/src/policy.rs) `->` Not planned
  - Timelag: [`ethers::middleware::timelag::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-middleware/src/timelag) `->` Not planned
  - Nonce manager: [`ethers::middleware::NonceManagerMiddleware`](https://github.com/gakonst/ethers-rs/tree/master/ethers-middleware/src/nonce_manager.rs) `->` Nonce filler [`alloy::provider::NonceFiller`](https://github.com/alloy-rs/alloy/tree/main/crates/provider/src/fillers/nonce.rs)
  - Signer: [`ethers::middleware::Signer`](https://github.com/gakonst/ethers-rs/tree/master/ethers-middleware/src/signer.rs) `->` Wallet filler [`alloy::provider::WalletFiller`](https://github.com/alloy-rs/alloy/tree/main/crates/provider/src/fillers/wallet.rs)
- Providers: [`ethers::providers`](https://github.com/gakonst/ethers-rs/tree/master/ethers-providers) `->` Provider [`alloy::providers`](https://github.com/alloy-rs/alloy/tree/main/crates/provider)
- Transports: [`ethers::providers::transports`](https://github.com/gakonst/ethers-rs/tree/master/ethers-providers/src/rpc/transports) `->` [`alloy::transports`](https://github.com/alloy-rs/alloy/tree/main/crates/transport)
  - HTTP: [`ethers::providers::Http`](https://github.com/gakonst/ethers-rs/tree/master/ethers-providers/src/rpc/transports/http.rs) `->` [`alloy::transports::http`](https://github.com/alloy-rs/alloy/tree/main/crates/transport-http)
  - IPC: [`ethers::providers::Ipc`](https://github.com/gakonst/ethers-rs/tree/master/ethers-providers/src/rpc/transports/ipc.rs) `->` [`alloy::transports::ipc`](https://github.com/alloy-rs/alloy/tree/main/crates/transport-ipc)
  - WS: [`ethers::providers::Ws`](https://github.com/gakonst/ethers-rs/tree/master/ethers-providers/src/rpc/transports/ws) `->` [`alloy::transports::ws`](https://github.com/alloy-rs/alloy/tree/main/crates/transport-ws)
- Signers: [`ethers::signers`](https://github.com/gakonst/ethers-rs/tree/master/ethers-signers) `->` Signer [`alloy::signers`](https://github.com/alloy-rs/alloy/tree/main/crates/signer)
  - AWS: [`ethers::signers::aws::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-signers/src/aws) `->` [`alloy::signers::aws`](https://github.com/alloy-rs/alloy/tree/main/crates/signer-aws)
  - Ledger: [`ethers::signers::ledger::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-signers/src/ledger) `->` [`alloy::signers::ledger`](https://github.com/alloy-rs/alloy/tree/main/crates/signer-ledger)
  - Trezor: [`ethers::signers::trezor::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-signers/src/trezor) `->` [`alloy::signer::trezor`](https://github.com/alloy-rs/alloy/tree/main/crates/signer-trezor)
  - Wallet: [`ethers::signers::wallet::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-signers/src/wallet) `->` [`alloy::signer::local`](https://github.com/alloy-rs/alloy/tree/main/crates/signer-local)

### Types

#### Primitives

- Address: [`ethers::types::Address`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::Address`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- U64: [`ethers::types::U64`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::U64`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- U128: [`ethers::types::U128`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::U128`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- U256: [`ethers::types::U256`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::U256`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- U512: [`ethers::types::U512`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::U512`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- H32: [`ethers::types::H32`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::aliases::B32`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- H64: [`ethers::types::H64`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::B64`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- H128: [`ethers::types::H128`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::B128`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- H160: [`ethers::types::H160`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::B160`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- H256: [`ethers::types::H256`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::B256`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- H512: [`ethers::types::H512`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::B512`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- Bloom: [`ethers::types::Bloom`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::Bloom`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- TxHash: [`ethers::types::TxHash`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) `->` [`alloy::primitives::TxHash`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)

Due to a [limitation](https://github.com/alloy-rs/core/issues/554#issuecomment-1978620017) in `ruint`, BigEndianHash [`ethers::types::BigEndianHash`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/mod.rs) can be expressed as follows:

```rust
use alloy_primitives::{U256, B256};
// `U256` => `B256`
let x = B256::from(u256);

// `B256` => `U256`
let x: U256 = b256.into();
let x = U256::from_be_bytes(b256.into())
```

Due to [Rust issue #50133](https://github.com/rust-lang/rust/issues/50133), the native `TryFrom` trait is not supported for `Uint`s. Instead, use [`UintTryFrom`](https://docs.rs/alloy/latest/alloy/primitives/ruint/trait.UintTryFrom.html) as follows:

```rust
use alloy_primitives::ruint::UintTryFrom;

let x: U512 = uint!(1234_U512);
let y: U256 = U256::uint_try_from(x).unwrap();

let num = U16::from(300);
// Wraps around the U16 value to fit it in the u8 type.
let x = num.wrapping_to::<u8>();
assert_eq!(x, 44);

// Saturates the expected type and returns the maximum value if the number is too large.
let y = num.saturating_to::<u8>();
assert_eq!(y, 255);

// Attempts to convert and panics if number is too large for the expected type.
let z = num.to::<u8>();
```

#### RPC

- Bytes: [`ethers::types::bytes::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/bytes.rs) `->` [`alloy::primitives::Bytes`](https://github.com/alloy-rs/core/tree/main/crates/primitives/src/lib.rs)
- Chains: [`ethers::types::Chain`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/chain.rs) `->` [`alloy-rs/chains`](https://github.com/alloy-rs/chains)
- ENS: [`ethers::types::ens`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/ens.rs) `->` [`alloy-ens`](https://github.com/alloy-rs/alloy/blob/main/crates/ens/src/lib.rs)
- Trace: [`ethers::types::trace::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/trace) `->` [`alloy::rpc::types::trace`](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-trace)
- {Block, Fee, Filter, Log, Syncing, Transaction, TxPool}: [`ethers::types::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types) `->` [`alloy::rpc::types::eth::*`](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-eth/src/lib.rs)
- Proof: [`ethers::types::proof::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/proof.rs) `->` Account [`alloy::rpc::types::eth::account::*`](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-eth/src/lib.rs)
- Signature: [`ethers::types::signature::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/signature.rs) `->` [`alloy::primitives::Signature*`](https://github.com/alloy-rs/core/blob/main/crates/primitives/src/signature/mod.rs)
- Withdrawal [`ethers::types::withdrawal::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/withdrawal.rs) `->` EIP4895 [`alloy::eips::eip4895`](https://github.com/alloy-rs/alloy/tree/main/crates/eips/src/eip4895.rs)
- Opcode: [`ethers::types::opcode::*`](https://github.com/gakonst/ethers-rs/tree/master/ethers-core/src/types/opcode.rs) `->` [`syn-solidity`](https://github.com/alloy-rs/core/tree/main/crates/syn-solidity)

### ABI

- Bindings: [`abigen!`](https://github.com/gakonst/ethers-rs/tree/51fe937f6515689b17a3a83b74a05984ad3a7f11/ethers-contract/ethers-contract-abigen) `->` [`sol!`](https://github.com/alloy-rs/core/tree/main/crates/sol-types), available on [`alloy::sol`](https://github.com/alloy-rs/alloy/blob/aea7e07b4b335a3a35e3870a6c277d397d0f3932/crates/alloy/src/lib.rs#L52-L64).

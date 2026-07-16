---
title: Installation
description: Install Alloy with cargo and configure the necessary feature flags for your blockchain development needs
---

## Installation

[Alloy](https://github.com/alloy-rs/alloy) consists of a number of crates that provide a range of functionality essential for interfacing with any Ethereum-based blockchain.

The easiest way to get started is to add the `alloy` crate from the command-line using Cargo:

```sh
cargo add alloy
```

Alternatively, you can add the following to your `Cargo.toml` file:

```toml
// [!include ~/snippets/installation/alloy.toml]
```

For a more fine-grained control over the features you wish to include, you can add the individual crates to your `Cargo.toml` file, or use the `alloy` crate with the features you need.

After `alloy` is added as a dependency you can now import `alloy` as follows:

```rust
use alloy::{
    network::EthereumWallet,
    node_bindings::Anvil,
    primitives::U256,
    providers::ProviderBuilder,
    signers::local::PrivateKeySigner,
    sol,
};
```

### Features

The [`alloy`](https://github.com/alloy-rs/alloy/tree/main/crates/alloy) meta-crate defines a number of [feature flags](https://github.com/alloy-rs/alloy/blob/main/crates/alloy/Cargo.toml):

Default

- `std`
- `reqwest`
- `alloy-core/default`
- `essentials`

Essentials

- `essentials`:
  - `contract`
  - `provider-http`
  - `rpc-types`
  - `signer-local`

Full, a set of the most commonly used flags to get started with `alloy`.

- `full`:
  - `consensus`
  - `eips`
  - `essentials`
  - `k256`
  - `kzg`
  - `network`
  - `provider-ws`
  - `provider-ipc`
  - `provider-trace-api`
  - `provider-txpool-api`
  - `provider-debug-api`
  - `provider-anvil-api`
  - `pubsub`

By default `alloy` uses [`reqwest`](https://crates.io/crates/reqwest) as HTTP client. Alternatively one can switch to [`hyper`](https://crates.io/crates/hyper).
The `reqwest` and `hyper` feature flags are mutually exclusive.

A complete list of available features can be found on [docs.rs](https://docs.rs/crate/alloy/latest/features) or in the [`alloy` crate's `Cargo.toml`](https://github.com/alloy-rs/alloy/blob/main/crates/alloy/Cargo.toml).

The feature flags largely correspond with and enable features from the following individual crates.

### Crates

`alloy` consists out of the following crates:

- [alloy](https://github.com/alloy-rs/alloy/tree/main/crates/alloy) - Meta-crate for the entire project, including [`alloy-core`](https://docs.rs/alloy-core)
- [alloy-consensus](https://github.com/alloy-rs/alloy/tree/main/crates/consensus) - Ethereum consensus interface
- [alloy-contract](https://github.com/alloy-rs/alloy/tree/main/crates/contract) - Interact with on-chain contracts
- [alloy-eips](https://github.com/alloy-rs/alloy/tree/main/crates/eips) - Ethereum Improvement Proposal (EIP) implementations
- [alloy-genesis](https://github.com/alloy-rs/alloy/tree/main/crates/genesis) - Ethereum genesis file definitions
- [alloy-json-rpc](https://github.com/alloy-rs/alloy/tree/main/crates/json-rpc) - Core data types for JSON-RPC 2.0 clients
- [alloy-network](https://github.com/alloy-rs/alloy/tree/main/crates/network) - Network abstraction for RPC types
  - [alloy-network-primitives](https://github.com/alloy-rs/alloy/tree/main/crates/network-primitives) - Primitive types for the network abstraction
- [alloy-node-bindings](https://github.com/alloy-rs/alloy/tree/main/crates/node-bindings) - Ethereum execution-layer client bindings
- [alloy-provider](https://github.com/alloy-rs/alloy/tree/main/crates/provider) - Interface with an Ethereum blockchain
- [alloy-pubsub](https://github.com/alloy-rs/alloy/tree/main/crates/pubsub) - Ethereum JSON-RPC [publish-subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) tower service and type definitions
- [alloy-rpc-client](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-client) - Low-level Ethereum JSON-RPC client implementation
- [alloy-rpc-types](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types) - Meta-crate for all Ethereum JSON-RPC types
  - [alloy-rpc-types-admin](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-admin) - Types for the `admin` Ethereum JSON-RPC namespace
  - [alloy-rpc-types-anvil](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-anvil) - Types for the [Anvil](https://github.com/foundry-rs/foundry) development node's Ethereum JSON-RPC namespace
  - [alloy-rpc-types-beacon](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-beacon) - Types for the [Ethereum Beacon Node API](https://ethereum.github.io/beacon-APIs)
  - [alloy-rpc-types-debug](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-debug) - Types for the `debug` Ethereum JSON-RPC namespace
  - [alloy-rpc-types-engine](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-engine) - Types for the `engine` Ethereum JSON-RPC namespace
  - [alloy-rpc-types-eth](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-eth) - Types for the `eth` Ethereum JSON-RPC namespace
  - [alloy-rpc-types-mev](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-mev) - Types for the MEV bundle JSON-RPC namespace.
  - [alloy-rpc-types-trace](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-trace) - Types for the `trace` Ethereum JSON-RPC namespace
  - [alloy-rpc-types-txpool](https://github.com/alloy-rs/alloy/tree/main/crates/rpc-types-txpool) - Types for the `txpool` Ethereum JSON-RPC namespace
- [alloy-serde](https://github.com/alloy-rs/alloy/tree/main/crates/serde) - [Serde](https://serde.rs)-related utilities
- [alloy-signer](https://github.com/alloy-rs/alloy/tree/main/crates/signer) - Ethereum signer abstraction
  - [alloy-signer-aws](https://github.com/alloy-rs/alloy/tree/main/crates/signer-aws) - [AWS KMS](https://aws.amazon.com/kms) signer implementation
  - [alloy-signer-gcp](https://github.com/alloy-rs/alloy/tree/main/crates/signer-gcp) - [GCP KMS](https://cloud.google.com/kms) signer implementation
  - [alloy-signer-ledger](https://github.com/alloy-rs/alloy/tree/main/crates/signer-ledger) - [Ledger](https://www.ledger.com) signer implementation
  - [alloy-signer-local](https://github.com/alloy-rs/alloy/tree/main/crates/signer-local) - Local (private key, keystore, mnemonic, YubiHSM) signer implementations
  - [alloy-signer-trezor](https://github.com/alloy-rs/alloy/tree/main/crates/signer-trezor) - [Trezor](https://trezor.io) signer implementation
- [alloy-transport](https://github.com/alloy-rs/alloy/tree/main/crates/transport) - Low-level Ethereum JSON-RPC transport abstraction
  - [alloy-transport-http](https://github.com/alloy-rs/alloy/tree/main/crates/transport-http) - HTTP transport implementation
  - [alloy-transport-ipc](https://github.com/alloy-rs/alloy/tree/main/crates/transport-ipc) - IPC transport implementation
  - [alloy-transport-ws](https://github.com/alloy-rs/alloy/tree/main/crates/transport-ws) - WS transport implementation

`alloy-core` consists out of the following crates:

- [alloy-core](https://github.com/alloy-rs/core/tree/main/crates/core) - Meta-crate for the entire project
- [alloy-dyn-abi](https://github.com/alloy-rs/core/tree/main/crates/dyn-abi) - Run-time [ABI](https://docs.soliditylang.org/en/latest/abi-spec.html) and [EIP-712](https://eips.ethereum.org/EIPS/eip-712) implementations
- [alloy-json-abi](https://github.com/alloy-rs/core/tree/main/crates/json-abi) - Full Ethereum [JSON-ABI](https://docs.soliditylang.org/en/latest/abi-spec.html#json) implementation
- [alloy-primitives](https://github.com/alloy-rs/core/tree/main/crates/primitives) - Primitive integer and byte types
- [alloy-sol-macro-expander](https://github.com/alloy-rs/core/tree/main/crates/sol-macro-expander) - Expander used in the Solidity to Rust procedural macro
- [alloy-sol-macro-input](https://github.com/alloy-rs/core/tree/main/crates/sol-macro-input) - Input types for [`sol!`](https://docs.rs/alloy-sol-macro/latest/alloy_sol_macro/macro.sol.html)-like macros
- [alloy-sol-macro](https://github.com/alloy-rs/core/tree/main/crates/sol-macro) - The [`sol!`](https://docs.rs/alloy-sol-macro/latest/alloy_sol_macro/macro.sol.html) procedural macro
- [alloy-sol-type-parser](https://github.com/alloy-rs/core/tree/main/crates/sol-type-parser) - A simple parser for Solidity type strings
- [alloy-sol-types](https://github.com/alloy-rs/core/tree/main/crates/sol-types) - Compile-time [ABI](https://docs.soliditylang.org/en/latest/abi-spec.html) and [EIP-712](https://eips.ethereum.org/EIPS/eip-712) implementations
- [syn-solidity](https://github.com/alloy-rs/core/tree/main/crates/syn-solidity) - [`syn`](https://github.com/dtolnay/syn)-powered Solidity parser

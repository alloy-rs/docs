---
title: How Alloy Fits Together
description: Understand Alloy's crates and layers before choosing APIs and feature flags
---

# How Alloy fits together

Alloy is a collection of focused crates behind one convenience crate named `alloy`. Most
applications should start with the `alloy` crate. Depending on individual crates is useful when a
library needs a small public dependency surface, a constrained feature set, or a specific layer of
the stack.

```text
Application
├── contract bindings and calls       alloy-contract
├── providers and middleware          alloy-provider
├── wallets and signers               alloy-signer-*
└── network-specific behavior         alloy-network
        │
        ├── RPC methods and types      alloy-rpc-client, alloy-rpc-types-*
        ├── HTTP, WebSocket, IPC       alloy-transport-*
        └── blocks, txs, EIPs, tries   alloy-consensus, alloy-eips, alloy-trie

Shared values and ABI tooling         alloy-core
                                       ├── alloy-primitives
                                       ├── alloy-sol-types / sol!
                                       ├── alloy-dyn-abi
                                       └── alloy-json-abi
```

The `alloy` meta-crate re-exports these APIs under stable task-oriented modules such as
`alloy::providers`, `alloy::network`, `alloy::signers`, `alloy::rpc`, and `alloy::primitives`.
Feature flags decide which re-exports and implementations are compiled.

## The layers

### Core values and ABI

[`alloy-core`](https://docs.rs/alloy-core/latest/alloy_core/) supplies addresses, byte strings,
fixed-width integers, hashes, ABI codecs, JSON ABI types, and the [`sol!` macro](https://docs.rs/alloy/latest/alloy/macro.sol.html).
These pieces can be used without a provider.

### Consensus and networks

[`alloy-consensus`](https://docs.rs/alloy-consensus/latest/alloy_consensus/) defines Ethereum block,
transaction, receipt, and envelope behavior. [`alloy-network`](https://docs.rs/alloy-network/latest/alloy_network/)
connects those types to provider behavior. APIs are commonly generic over a `Network`; the default
is Ethereum. Other ecosystems can provide their own network implementation without replacing the
provider stack.

### RPC types, client, and transports

RPC is split deliberately:

- `alloy-rpc-types-*` models request and response data for namespaces such as `eth`, `debug`,
  `trace`, `txpool`, `engine`, and `anvil`.
- `alloy-rpc-client` sends JSON-RPC requests over a transport.
- `alloy-transport-http`, `alloy-transport-ws`, and `alloy-transport-ipc` implement the connection.

Use these lower layers directly only when building infrastructure or a custom provider. Application
code normally uses a provider.

### Providers, fillers, and layers

[`alloy-provider`](https://docs.rs/alloy-provider/latest/alloy_provider/) is the application-facing
RPC interface. A provider exposes typed methods, while fillers populate transaction fields such as
chain ID, nonce, gas, and wallet signatures. Tower layers wrap transport behavior for concerns such
as retries, rate limiting, fallback, or logging.

See [RPC providers](/rpc-providers/introduction), [fillers](/rpc-providers/understanding-fillers),
and [transport layers](/guides/layers).

### Signers and wallets

A signer produces a signature. An `EthereumWallet` selects among signers and supplies the network
wallet behavior used by transaction fillers. Local keys, mnemonics, keystores, hardware wallets,
cloud KMS services, and Turnkey are separate implementations so applications compile only the
integration they use.

See [signers vs. Ethereum wallet](/guides/signers-vs-ethereum-wallet) and the
[signer examples](/examples/wallets/README).

### Contract bindings

`sol!` creates strongly typed Rust bindings from Solidity declarations or JSON ABI. `alloy-contract`
uses those bindings with a provider to deploy contracts, call functions, send transactions, and
query events. See [contract interactions](/contract-interactions/using-sol!).

## Local nodes and tests

`alloy-node-bindings` starts supported execution clients as child processes; it does not install the
client binary. The `provider-anvil-node` feature adds `ProviderBuilder` helpers for Anvil and also
enables the required node bindings. The `full` feature does **not** enable node bindings.

For unit tests that should not start a process or use a network, use a mocked provider. Compare the
[mock provider](/examples/providers/mocking) and [node-binding examples](/examples/node-bindings/README).

## Choosing the dependency boundary

- **Application:** begin with `alloy` and enable the task-specific features you need.
- **Reusable library:** prefer the narrow crate that owns the types in your public API.
- **Core-only or constrained target:** depend on `alloy-core` crates directly and inspect their
  `std` support.
- **Custom infrastructure:** compose RPC client, transport, provider, and network crates explicitly.

Continue with [feature flags](/reference/feature-flags) for concrete dependency recipes.

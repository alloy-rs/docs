---
title: Feature Flags
description: Choose Alloy meta-crate features for providers, transports, signers, RPC namespaces, and constrained builds
---

# Feature flags

The `alloy` meta-crate uses feature flags to expose focused crates and select implementations. Start
with the default features for a typical HTTP application, then add only the capabilities your code
uses.

The exact feature graph can change between releases. For the version in your `Cargo.lock`, verify
the [docs.rs feature list](https://docs.rs/crate/alloy/latest/features) or the
[`alloy` Cargo manifest](https://github.com/alloy-rs/alloy/blob/main/crates/alloy/Cargo.toml).

## Recommended starting points

### Default: HTTP application

```toml
// [!include ~/snippets/installation/alloy.toml]
```

The defaults enable `std`, the Reqwest HTTP client with rustls, Alloy Core defaults, and
`essentials`. The `essentials` group includes contracts, an HTTP provider, standard Ethereum RPC
types, and local signers.

### Broad application support

```toml
// [!include ~/snippets/installation/alloy-full.toml]
```

`full` adds commonly used consensus and EIP types, WebSocket and IPC providers, pubsub, KZG, RLP,
and the trace, txpool, debug, and Anvil RPC APIs. Despite its name, it is not every optional
integration: node binaries, cloud and hardware signers, and several RPC namespaces remain opt-in.

### No default features

```toml
// [!include ~/snippets/installation/alloy-minimal.toml]
```

Use this pattern only when you intend to assemble a minimal surface. Disabling defaults removes the
HTTP provider, contracts, local signer, and `std` choices supplied by the default set. Feature
requirements are additive, so compile every intended target after changing them.

## Task-to-feature map

| Capability | Feature(s) to consider | Notes |
| --- | --- | --- |
| HTTP provider | `provider-http` | Included by `essentials` and the defaults |
| WebSocket provider and subscriptions | `provider-ws` | Enables pubsub and the default WebSocket TLS backend |
| WebSocket with ring or native TLS | `provider-ws-ring`, `provider-ws-native-tls` | Choose the backend required by your platform |
| IPC provider | `provider-ipc` | Enables pubsub |
| Contract calls and bindings | `contract` | Pulls in providers and ABI features |
| Local private keys | `signer-local` | Included by `essentials` |
| Mnemonics or keystores | `signer-mnemonic`, `signer-keystore` | Add to `signer-local` behavior |
| AWS KMS, GCP KMS, or Turnkey | `signer-aws`, `signer-gcp`, `signer-turnkey` | Each integration is independent |
| Ledger or Trezor | `signer-ledger`, `signer-trezor` | Ledger also has browser and Node variants |
| Anvil process helpers | `provider-anvil-node` | Includes provider Anvil RPC and node bindings; not in `full` |
| Standalone node bindings | `node-bindings` | Re-exports process bindings without provider helpers |
| `debug_*` RPC methods | `provider-debug-api` | Also enables debug and trace RPC types |
| `trace_*` RPC methods | `provider-trace-api` | Enables trace RPC types |
| `txpool_*` RPC methods | `provider-txpool-api` | Enables txpool RPC types |
| Admin, Engine, MEV, or Net methods | `provider-admin-api`, `provider-engine-api`, `provider-mev-api`, `provider-net-api` | These namespaces are not included as a group by `full` |
| Rate-limited transport | `transport-throttle` | Low-level transport capability |
| Dynamic or JSON ABI | `dyn-abi`, `json-abi` | `contract` already enables both |
| EIP-712 signing | `eip712` | Enables support across compatible configured signers |

## HTTP implementation and TLS

The defaults select Reqwest with rustls. Advanced users can choose from `reqwest-rustls-tls`,
`reqwest-native-tls`, `reqwest-default-tls`, or the `hyper` HTTP implementation. Disable default
features before replacing the default combination, and test the target platforms you support.

WebSocket TLS choices are expressed through the provider features listed above. Avoid enabling
multiple TLS backends unless a dependency requires them.

## `std`, WebAssembly, and `no_std`

The networking-focused meta-crate is designed primarily for `std`. The `wasm-bindgen` feature adapts
supported transport behavior for WebAssembly; it does not make every Alloy crate available in every
browser environment.

For a `no_std` or otherwise constrained library, depend directly on the core or protocol crate you
need, disable its default features, and verify its own feature list. Do not assume that disabling
`std` on the `alloy` meta-crate makes provider, signer, or transport integrations `no_std`.

## Diagnose a missing feature

If an import or method is unavailable:

1. Open the item on [docs.rs](https://docs.rs/alloy/latest/alloy/) and check its **Available on
   crate feature** annotation.
2. Inspect `cargo tree -e features -i alloy` to see which features are active.
3. Add the smallest owning feature and run `cargo check --all-targets`.
4. If the item belongs to an individual crate, check that crate's features rather than assuming the
   meta-crate uses the same flag name.

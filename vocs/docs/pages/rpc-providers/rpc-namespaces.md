---
title: RPC Namespaces
description: Use Alloy provider extension traits for debug, trace, txpool, engine, admin, Anvil, MEV, and other RPC APIs
---

# RPC namespaces

The base `Provider` trait exposes the standard Ethereum `eth_*` API. Optional extension traits add
client-specific and operational namespaces. Enabling Rust types does not enable a method on the
node: the connected client or hosted service must expose that namespace.

## Enable and import an extension

For the `alloy` meta-crate, add the provider feature and import its trait:

```sh
cargo add alloy --features provider-debug-api
```

```rust
use alloy::providers::{ext::DebugApi, ProviderBuilder};

# async fn run() -> Result<(), Box<dyn std::error::Error>> {
let rpc_url = std::env::var("RPC_URL")?;
let provider = ProviderBuilder::new().connect(&rpc_url).await?;

// Methods from DebugApi are now available on the provider.
let _ = provider;
# Ok(())
# }
```

If Rust reports that a method is missing, verify both the feature and the trait import.

## Namespace map

| RPC namespace | Provider extension trait | `alloy` feature | Typical use |
| --- | --- | --- | --- |
| `admin_*` | `AdminApi` | `provider-admin-api` | peers and node information |
| Anvil methods | `AnvilApi` | `provider-anvil-api` | account impersonation and test-node controls |
| `debug_*` | `DebugApi` | `provider-debug-api` | Geth-style traces and debug operations |
| `engine_*` | `EngineApi`, `TestingApi` | `provider-engine-api` | consensus/execution Engine API integration |
| MEV and Flashbots methods | `MevApi` | `provider-mev-api` | bundles and private transactions |
| `net_*` | `NetApi` | `provider-net-api` | peer count, network ID, listening status |
| `trace_*` | `TraceApi` | `provider-trace-api` | OpenEthereum-style traces |
| `txpool_*` | `TxPoolApi` | `provider-txpool-api` | pending and queued transaction inspection |

The `full` feature includes Anvil, debug, trace, and txpool provider APIs. It does not include admin,
engine, MEV, or net APIs. See the [feature flag reference](/reference/feature-flags).

## Direct `alloy-provider` features

The provider crate also exposes extensions that the `alloy` meta-crate does not currently map to a
same-named top-level feature:

| `alloy-provider` feature | Extension |
| --- | --- |
| `rpc-api` | `RpcApi` for `rpc_modules` |
| `erc4337-api` | `Erc4337Api` for bundler operations |
| `tenderly-api` | `TenderlyApi` |
| `tenderly-admin-api` | `TenderlyAdminApi` |

Depend on `alloy-provider` directly when one of these is required, and align its version with the
rest of the Alloy dependency graph.

## Node compatibility and security

Namespace behavior varies by execution client and configuration. Before using an extension:

1. Check the node's enabled modules and authentication requirements.
2. Confirm that the exact method and version are supported by that client release.
3. Keep privileged namespaces such as `admin`, `engine`, `debug`, and test-node controls off public
   interfaces.
4. Use the concrete types and method documentation in the
   [`alloy_provider::ext` module](https://docs.rs/alloy-provider/latest/alloy_provider/ext/).

Trace APIs are not interchangeable: `debug_*` and `trace_*` use different method families and
response types. Engine API methods are fork-versioned and normally require authenticated JWT
access. Anvil operations are for controlled development nodes, not general production endpoints.

## Raw JSON-RPC escape hatch

When a server method is not modeled by an extension, send a typed request through the provider's
RPC client:

```rust
use alloy::providers::{Provider, ProviderBuilder};

# async fn run() -> Result<(), Box<dyn std::error::Error>> {
let rpc_url = std::env::var("RPC_URL")?;
let provider = ProviderBuilder::new().connect(&rpc_url).await?;

let chain_name: String = provider
    .client()
    .request_noparams("custom_chainName")
    .await?;
# let _ = chain_name;
# Ok(())
# }
```

Prefer a local request/response type over unstructured `serde_json::Value`, and isolate the custom
method behind an application trait. If it becomes broadly useful, contribute a typed extension to
Alloy.

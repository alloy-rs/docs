---
description: Connect to Ethereum RPC endpoints using HTTP transport for synchronous and asynchronous operations
---

## HTTP Provider

The `Http` provider establishes an HTTP connection with a node, allowing you to send JSON-RPC requests to the node to fetch data, simulate calls, send transactions and much more.

### Initializing an Http Provider

The recommended way of initializing a `Http` provider is by using the [`connect_http`](https://docs.rs/alloy/latest/alloy/providers/struct.ProviderBuilder.html#method.connect_http) method on the [`ProviderBuilder`](https://docs.rs/alloy/latest/alloy/providers/struct.ProviderBuilder.html).

```rust
//! Example of creating an HTTP provider using the `connect_http` method on the `ProviderBuilder`.

use alloy::providers::{Provider, ProviderBuilder}; // [!code focus]
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Set up the HTTP transport which is consumed by the RPC client.
    let rpc_url = std::env::var("RPC_URL")?.parse()?;

    // Create a provider with the HTTP transport using the `reqwest` crate.
    let provider = ProviderBuilder::new().connect_http(rpc_url); // [!code focus]

    Ok(())
}
```

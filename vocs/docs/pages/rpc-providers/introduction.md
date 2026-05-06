---
description: Connect to Ethereum networks using the Provider
---

## RPC Provider

A [`Provider`](https://docs.rs/alloy/latest/alloy/providers/trait.Provider.html) is an abstraction of a connection to the Ethereum network, providing a concise, consistent interface to standard Ethereum node functionality.

### Provider Builder Pattern

The correct way of creating a [`Provider`](https://docs.rs/alloy/latest/alloy/providers/trait.Provider.html) is through the [`ProviderBuilder`](https://docs.rs/alloy/latest/alloy/providers/struct.ProviderBuilder.html), a [builder](https://rust-unofficial.github.io/patterns/patterns/creational/builder.html).

Alloy provides concrete transport implementations for [`HTTP`](/rpc-providers/http-provider), [`WS` (WebSockets)](/rpc-providers/ws-provider) and [`IPC` (Inter-Process Communication)](/rpc-providers/ipc-provider.md), as well as higher level transports which wrap a single or multiple transports.

The [`connect`](https://docs.rs/alloy/latest/alloy/providers/struct.ProviderBuilder.html#method.connect) method on the [`ProviderBuilder`](https://docs.rs/alloy/latest/alloy/providers/struct.ProviderBuilder.html) will automatically determine the connection type (`Http`, `Ws` or `Ipc`) depending on the format of the URL.

```rust showLineNumbers
//! Example of setting up a provider using the `.connect` method.

use alloy::providers::{Provider, ProviderBuilder}; // [!code focus]
use std::error::Error;

const RPC_URL: &str = "https://ethereum.reth.rs/rpc";
#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {

    // Instanties a provider using a string.
    let provider = ProviderBuilder::new().connect(RPC_URL).await?; // [!code focus]

    Ok(())
}
```

In order to instantiate a provider in synchronous settings use [`connect_http`](/rpc-providers/http-provider).

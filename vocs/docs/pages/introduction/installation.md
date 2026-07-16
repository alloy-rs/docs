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

For a more fine-grained dependency, use the `alloy` crate with task-specific features or depend on
the individual crate that owns the API. See [how Alloy fits together](/introduction/architecture)
and the [feature flag reference](/reference/feature-flags) before disabling defaults.

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

### Next steps

- [Choose a task-oriented path](/introduction/choose-a-path).
- [Understand Alloy's crate and runtime layers](/introduction/architecture).
- [Select feature flags](/reference/feature-flags).
- [Build the first provider and contract calls](/introduction/getting-started).

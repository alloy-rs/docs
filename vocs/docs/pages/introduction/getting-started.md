---
description: Get started with Alloy, the high-performance Rust toolkit for Ethereum and EVM-based blockchains
---

# Getting Started [The simplest, fastest Rust toolkit to interact with any EVM chain]

## Overview

Alloy is a high-performance Rust toolkit for Ethereum and EVM-based blockchains providing developers with:

- **High Performance**: Optimized primitives with up to 60% faster U256 operations and 10x faster ABI encoding
- **Developer Experience**: Intuitive API for interacting with Smart contracts via the `sol!` macro
- **Chain-Agnostic Type System**: Multi-chain support without feature flags or type casting
- **Extensibility**: Customizable provider architecture with layers and fillers

## Installation

Install alloy to any cargo project using the command line. See [Installation](/introduction/installation#features) for more details on the various features flags.

```bash [cargo]
cargo add alloy
```

## Quick Start

### 1. Sending Transactions

This example shows how to send 100 ETH using the [`TransactionBuilder`](/transactions/using-the-transaction-builder) on a local anvil node

```rust
use alloy::{
    network::TransactionBuilder,
    primitives::{
        address,
        utils::{format_ether, Unit},
        U256,
    },
    providers::{Provider, ProviderBuilder},
    rpc::types::TransactionRequest,
    signers::local::PrivateKeySigner,
};
use std::error::Error;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Initialize a signer with a private key
    let signer: PrivateKeySigner =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80".parse()?;

    // Instantiate a provider with the signer and a local anvil node
    let provider = ProviderBuilder::new() // [!code focus]
        .wallet(signer) // [!code focus]
        .connect("http://127.0.0.1:8545") // [!code focus]
        .await?;

    // Prepare a transaction request to send 100 ETH to Alice
    let alice = address!("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"); // [!code focus]
    let value = Unit::ETHER.wei().saturating_mul(U256::from(100)); // [!code focus]
    let tx = TransactionRequest::default() // [!code focus]
        .with_to(alice) // [!code focus]
        .with_value(value); // [!code focus]

    // Send the transaction and wait for the broadcast
    let pending_tx = provider.send_transaction(tx).await?; // [!code focus]
    println!("Pending transaction... {}", pending_tx.tx_hash());

    // Wait for the transaction to be included and get the receipt
    let receipt = pending_tx.get_receipt().await?; // [!code focus]
    println!(
        "Transaction included in block {}",
        receipt.block_number.expect("Failed to get block number")
    );

    println!("Transferred {:.5} ETH to {alice}", format_ether(value));

    Ok(())
}
```

### 2. Interacting with Smart Contracts

Alloy's `sol!` macro makes working with smart contracts intuitive by letting you write Solidity directly in Rust:

```rust
use alloy::{
    primitives::{
        address,
        utils::{format_ether, Unit},
        U256,
    },
    providers::ProviderBuilder,
    signers::local::PrivateKeySigner,
    sol,
};
use std::error::Error;

// Generate bindings for the WETH9 contract
sol! { // [!code focus]
    #[sol(rpc)] // [!code focus]
    contract WETH9 { // [!code focus]
        function deposit() public payable; // [!code focus]
        function balanceOf(address) public view returns (uint256); // [!code focus]
        function withdraw(uint amount) public; // [!code focus]
    } // [!code focus]
} // [!code focus]

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Initialize a signer with a private key and get address from it
    let signer: PrivateKeySigner =
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80".parse()?;
    let from_address = signer.address();

    // Instantiate a provider with the signer
    let provider = ProviderBuilder::new() // [!code focus]
        .wallet(signer) // [!code focus]
        .connect_anvil_with_config(|a| a.fork("https://reth-ethereum.ithaca.xyz/rpc"));

    // Setup WETH contract instance
    let weth_address = address!("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2");
    let weth = WETH9::new(weth_address, provider.clone()); // [!code focus]

    // Read initial balance
    let initial_balance = weth.balanceOf(from_address).call().await?; // [!code focus]
    println!("Initial WETH balance: {} WETH", format_ether(initial_balance));

    // Write: Deposit ETH to get WETH
    let deposit_amount = Unit::ETHER.wei().saturating_mul(U256::from(10));
    let deposit_tx = weth.deposit().value(deposit_amount).send().await?; // [!code focus]
    let deposit_receipt = deposit_tx.get_receipt().await?; // [!code focus]
    println!(
        "Deposited ETH in block {}",
        deposit_receipt.block_number.expect("Failed to get block number")
    );

    // Read: Check updated balance after deposit
    let new_balance = weth.balanceOf(from_address).call().await?;
    println!("New WETH balance: {} WETH", format_ether(new_balance));

    // Write: Withdraw some WETH back to ETH
    let withdraw_amount = Unit::ETHER.wei().saturating_mul(U256::from(5));
    let withdraw_tx = weth.withdraw(withdraw_amount).send().await?; // [!code focus]
    let withdraw_receipt = withdraw_tx.get_receipt().await?; // [!code focus]
    println!(
        "Withdrew ETH in block {}",
        withdraw_receipt.block_number.expect("Failed to get block number")
    );

    // Read: Final balance check
    let final_balance = weth.balanceOf(from_address).call().await?; // [!code focus]
    println!("Final WETH balance: {} WETH", format_ether(final_balance));

    Ok(())
}
```

### 3. Monitoring Blockchain Activity

This example shows how to monitor blocks and track the [WETH](https://etherscan.io/token/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2) balance of a [Uniswap V3 WETH-USDC](https://etherscan.io/address/0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8) contract in real-time:

:::code-group

```rust [subscribe_blocks.rs]
use alloy::{
    primitives::{address, utils::format_ether},
    providers::{Provider, ProviderBuilder, WsConnect},
    sol,
};
use futures_util::StreamExt;

sol! { // [!code focus]
    #[sol(rpc)] // [!code focus]
    contract WETH { // [!code focus]
        function balanceOf(address) external view returns (uint256); // [!code focus]
    } // [!code focus]
} // [!code focus]

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Connect to an Ethereum node via WebSocket
    let ws = WsConnect::new("wss://reth-ethereum.ithaca.xyz/ws"); // [!code focus]
    let provider = ProviderBuilder::new().connect_ws(ws).await?; // [!code focus]

    // Uniswap V3 WETH-USDC Pool address
    let uniswap_pool = address!("0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8"); // [!code focus]

    // Setup the WETH contract instance
    let weth_addr = address!("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
    let weth = WETH::new(weth_addr, &provider); // [!code focus]

    // Subscribe to new blocks
    let mut block_stream = provider.subscribe_blocks().await?.into_stream(); // [!code focus]
    println!("🔄 Monitoring for new blocks...");

    // Process each new block as it arrives
    while let Some(block) = block_stream.next().await { // [!code focus]
        println!("🧱 Block #{}: {}", block.number, block.hash);
        // Get contract balance at this block
        let balance = weth.balanceOf(uniswap_pool).block(block.number.into()).call().await?; // [!code focus]
        // Format the balance in ETH
        println!("💰 Uniswap V3 WETH-USDC pool balance: {} WETH", format_ether(balance));
    }

    Ok(())
}
```

```sh [output]
🔄 Monitoring for new blocks...
🧱 Block #22445374: 0x8a75355b6efd4890789f60d1d7cb7b6c32c1ce9b0651db779c145217346d2219
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445375: 0xbb6265e4d4e81adfa73afd759d65804756fb83c5a72065b50343f7b10e1dfc47
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445376: 0xb82d720ea7e4b7019e8573d5a01865bbcecb7b8aae3a03d4dae58af1dc7ec026
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445377: 0x7d21a4f3dd376888df8a1ead3c7f0a9c9f7107b0a627795ec2584eeb92f13ce7
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445378: 0xd552c7595c9b2e77b1a9def6d818376ab6eac4c10dfc9d610a91b23894b54fa7
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445379: 0x89190317a8181eedecdddd4551bc9db0267750e659d78aca53f293c774b343b6
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445380: 0xb68a9c344233b598e43c81b14691ff73453d8ad39491a1a0120bed12d8086d11
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445381: 0x547b15a475d5e5316ddac707c37b5275568872531ca17d3022c9130b37fe0b21
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445382: 0xdd3dcf55908e6ae7cc33949952c9383afc91cf7827d5ada715baaf1a018ce050
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445383: 0x4d3a5565b18b896fea580ce94d009b11a8f076c800a3a738b66de16a91d4cd3c
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
🧱 Block #22445384: 0xc29957a5d4d981dfb02416e7bec45546678914b3e9660fcb7635d0a679bce635
💰 Uniswap V3 ETH-USDC Pool balance: 7496.034522333161564023 ETH
```

:::

## Crate Features

Alloy can be consumed in multiple ways with numerous combinations of features for different use cases.

### Meta crate

The [alloy](https://crates.io/crates/alloy) meta crate is useful when you want to quickly get started without dealing with multiple installations or features.

It comes with the following features as default:

```toml [Cargo.toml]
default = ["std", "reqwest", "alloy-core/default", "essentials"]

# std
std = [
    "alloy-core/std",
    "alloy-eips?/std",
    "alloy-genesis?/std",
    "alloy-serde?/std",
    "alloy-consensus?/std",
]
# enable basic network interactions out of the box.
essentials = ["contract", "provider-http", "rpc-types", "signer-local"]
```

Find the full feature list [here](https://github.com/alloy-rs/alloy/blob/main/crates/alloy/Cargo.toml).

### Individual crates

Alloy is a collection of modular crates that can be used independently.

Meta-crates can lead to dependencies bloat increasing compile-time. For large projects where compile time can be an issue, we recommend using crates independently as in when required.

```toml [Cargo.toml]
[dependencies]
alloy-primitives = { version = "1.0", default-features = false, features = ["rand", "serde", "map-foldhash"] }
alloy-provider = { version = "0.15", default-features = false, features = ["ipc"] }
# ..snip..
```

This allows you to have granular control over the dependencies and features you use in your project.

Find the full list of the crates [here](/introduction/installation#crates).

### `no_std` crates

Most of the crates in Alloy are not `no_std` as they are primarily network-focused. Having said that we do support `no_std` implementation for crucial crates such as:

1.  [alloy-eips](https://crates.io/crates/alloy-eips): Consists of Ethereum's current and future EIP types and spec implementations.

2.  [alloy-genesis](https://crates.io/crates/alloy-genesis): The Ethereum genesis file definitions.

3.  [alloy-serde](https://crates.io/crates/alloy-serde): Serialization and deserialization of helpers for alloy.

4.  [alloy-consensus](https://crates.io/crates/alloy-consensus): The Ethereum consensus interface. It contains constants, types, and functions for implementing Ethereum EL consensus and communication. This includes headers, blocks, transactions, EIP-2718 envelopes, EIP-2930, EIP-4844, and more.

## Guides

Check out our Guides to see more practical use cases, including:

- [Building MEV bots with Alloy primitives](/guides/speed-up-using-u256)
- [Seamless contract interaction with the sol! macro](/guides/static-dynamic-abi-in-alloy)
- [Creating custom transaction fillers for setting priority fees](/guides/fillers)
- [Using multicall for aggregating RPC requests](/guides/multicall)

---
description: Use the Network trait to seamlessly interact with different blockchain networks and handle varying RPC types
---

# Interacting with multiple networks

The provider trait is generic over the network type, `Provider<N: Network = Ethereum>`, with the default network set to `Ethereum`.

The `Network` generic helps the provider to accomodate various network types with different transaction and RPC response types seamlessly.

## The Network trait

This removes the need for implementing the `Provider` trait for each network type you want to interact with. Instead, we just need to implement the `Network` trait.

Following is the [`Ethereum` network implementation](https://github.com/alloy-rs/alloy/blob/main/crates/network/src/ethereum/mod.rs) which defines the structure of the network and its RPC types.

```rust [ethereum.rs]
impl Network for Ethereum {
    type TxType = alloy_consensus::TxType;

    type TxEnvelope = alloy_consensus::TxEnvelope;

    type UnsignedTx = alloy_consensus::TypedTransaction;

    type ReceiptEnvelope = alloy_consensus::ReceiptEnvelope;

    type Header = alloy_consensus::Header;

    type TransactionRequest = alloy_rpc_types_eth::transaction::TransactionRequest;

    type TransactionResponse = alloy_rpc_types_eth::Transaction;

    type ReceiptResponse = alloy_rpc_types_eth::TransactionReceipt;

    type HeaderResponse = alloy_rpc_types_eth::Header;

    type BlockResponse = alloy_rpc_types_eth::Block;
}
```

Choosing the wrong network type can lead to unexpected deserialization errors due to differences in RPC types. For example, the using an `Ethereum` network provider to get a full block with transactions can result in the following error:

```rust [base_block.rs]
let rpc_url = std::env::var("RPC_URL")?;
let provider = ProviderBuilder::new()
        .network::<Ethereum>()
        .connect(&rpc_url)
        .await?;

// Yields: Error: deserialization error: data did not match any variant of untagged enum BlockTransactions // [!code hl]
let block_with_txs = provider.get_block(25508329.into()).full().await?;
```

This is due to the `Deposit` transaction type which is not supported by `Ethereum` network. This can be fixed in two ways either by using the catch-all `AnyNetwork` type or by using the dedicated `Optimism` network implementation from [op-alloy-network](https://crates.io/crates/op-alloy-network).

## Catch-all network: `AnyNetwork`

The `Provider` defaults to the ethereum network type, but one can easily switch to another network while building the provider like so:

```rust
let provider = ProviderBuilder::new()
    .network::<AnyNetwork>() // [!code hl]
    .connect_http("http://localhost:8545");
```

The [`AnyNetwork` type](https://github.com/alloy-rs/alloy/blob/main/crates/network/src/any/mod.rs) is a catch-all network allowing you to interact with any network type, in case you don't want to roll your own network type.

## Custom Network: `Optimism`

The [`Optimism` network](https://github.com/alloy-rs/op-alloy/blob/main/crates/network/src/lib.rs) type has been created to interact with OP-stack chains such as Base.

```rust [optimism.rs]
impl Network for Optimism {
    type TxType = OpTxType;

    type TxEnvelope = op_alloy_consensus::OpTxEnvelope;

    type UnsignedTx = op_alloy_consensus::OpTypedTransaction;

    type ReceiptEnvelope = op_alloy_consensus::OpReceiptEnvelope;

    type Header = alloy_consensus::Header;

    type TransactionRequest = op_alloy_rpc_types::OpTransactionRequest;

    type TransactionResponse = op_alloy_rpc_types::Transaction;

    type ReceiptResponse = op_alloy_rpc_types::OpTransactionReceipt;

    type HeaderResponse = alloy_rpc_types_eth::Header;

    type BlockResponse =
        alloy_rpc_types_eth::Block<Self::TransactionResponse, Self::HeaderResponse>;
}
```

```rust
let provider = ProviderBuilder::new()
    .network::<op_alloy_network::Optimism>() // [!code hl]
    .connect_http("http://localhost:8545");
```

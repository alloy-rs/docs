---
description: Understand how transactions flow through Alloy's filler system from creation to network dispatch
---

## The transaction lifecycle

This article will walk you through the process of defining a transaction to send `100 wei` from `Alice` to `Bob`, signing the transaction and broadcasting the signed transaction to the Ethereum network.

Let's express our intent in the form of a [`TransactionRequest`](https://docs.rs/alloy/latest/alloy/rpc/types/eth/struct.TransactionRequest.html):

```rust
// Build a transaction to send 100 wei from Alice to Bob.
let tx = TransactionRequest::default()
    .with_from(alice)
    .with_to(bob)
    .with_nonce(nonce)
    .with_chain_id(chain_id)
    .with_value(U256::from(100))
    .with_gas_price(gas_price)
    .with_gas_limit(gas_limit);
```

### Setup

First we will set up our environment:

We start by defining the RPC URL of our local Ethereum node [Anvil](https://github.com/foundry-rs/foundry/tree/master/crates/anvil) node.
If you do not have `Anvil` installed see the [Foundry](https://github.com/foundry-rs/foundry) [installation instructions](https://book.getfoundry.sh/getting-started/installation).

```rust
// Spin up a local Anvil node.
// Ensure `anvil` is available in $PATH.
let anvil = Anvil::new().try_spawn()?;

// Get the RPC URL.
let rpc_url = anvil.endpoint().parse()?;
```

```rust
// Alternatively, use a caller-supplied endpoint.
let rpc_url = std::env::var("RPC_URL")?.parse()?;
```

Next let's define a `signer` for Alice. By default `Anvil` defines a mnemonic phrase: `"test test test test test test test test test test test junk"`. Make sure to not use this mnemonic phrase outside of testing environments. We add a signer to the `Provider` using the `.wallet` method which is responsible for signing the transactions.s

Derive the first key of the mnemonic phrase for `Alice`:

```rust
// Set up signer from the first default Anvil account (Alice).
let signer: PrivateKeySigner = anvil.keys()[0].clone().into();
```

Next lets grab the address of our users `Alice` and `Bob`:

```rust
// Create two users, Alice and Bob.
let alice = anvil.addresses()[0];
let bob = anvil.addresses()[1];
```

Next we can build the [`Provider`](https://docs.rs/alloy/latest/alloy/providers/trait.Provider.html) using the [`ProviderBuilder`](https://docs.rs/alloy/latest/alloy/providers/struct.ProviderBuilder.html).

```rust
// Create a provider with the signer.
// `ProviderBuilder::new` initializes the recommended fillers.
let provider = ProviderBuilder::new()
    .wallet(signer)
    // Previously, on_http
    .connect_http(rpc_url);
```

Note that the [ProviderBuilder](/rpc-providers/introduction) constructor `new` initializes the [RecommendedFillers](/rpc-providers/understanding-fillers).

Let's modify our original `TransactionRequest` to make use of the [RecommendedFiller](https://docs.rs/alloy/latest/alloy/providers/fillers/type.RecommendedFiller.html) installed on the `Provider` to automatically fill out transaction details.

The `RecommendedFillers` includes the following fillers:

- [GasFiller](https://docs.rs/alloy/latest/alloy/providers/fillers/struct.GasFiller.html)
- [BlobGasFiller](https://docs.rs/alloy-provider/latest/alloy_provider/fillers/struct.BlobGasFiller.html)
- [NonceFiller](https://docs.rs/alloy/latest/alloy/providers/fillers/struct.NonceFiller.html)
- [ChainIdFiller](https://docs.rs/alloy/latest/alloy/providers/fillers/struct.ChainIdFiller.html)

Because we are using `RecommendedFillers` for filling the `TransactionRequest` we only need a subset of the original fields:

```diff showLineNumbers
// Build a transaction to send 100 wei from Alice to Bob.
let tx = TransactionRequest::default()
-   .with_from(alice)
    .with_to(bob)
-   .with_nonce(nonce)
-   .with_chain_id(chain_id)
    .with_value(U256::from(100))
-   .with_gas_price(gas_price)
-   .with_gas_limit(gas_limit);
```

Changes to:

```rust showLineNumbers
// Build a transaction to send 100 wei from Alice to Bob.
// The `from` field is automatically filled to the first signer's address (Alice).
let tx = TransactionRequest::default()
    .with_to(bob)
    .with_value(U256::from(100));
```

Much better!

### Signing and broadcasting the transaction

Given that we have configured a signer on our `Provider` we can sign the transaction locally and broadcast in a single line:

There are three ways to listen for transaction inclusion after broadcasting the transaction, depending on your requirements:

```rust
// Send the transaction and listen for the transaction to be broadcasted.
let pending_tx = provider.send_transaction(tx).await?.register().await?;
```

```rust
// Send the transaction and listen for the transaction to be included.
let tx_hash = provider.send_transaction(tx).await?.watch().await?;
```

```rust
// Send the transaction and fetch the receipt after the transaction was included.
let tx_receipt = provider.send_transaction(tx).await?.get_receipt().await?;
```

Let's dive deeper into what we just did.

By calling:

```rust
let tx_builder = provider.send_transaction(tx).await?;
```

The [`Provider::send_transaction`](https://docs.rs/alloy/latest/alloy/providers/trait.Provider.html#method.send_transaction) method returns a [`PendingTransactionBuilder`](https://docs.rs/alloy/latest/alloy/providers/struct.PendingTransactionBuilder.html) for configuring the pending transaction watcher.

On it we can for example, set the [`required_confirmations`](https://docs.rs/alloy/latest/alloy/providers/struct.PendingTransactionBuilder.html#method.set_required_confirmations) or set a [`timeout`](https://docs.rs/alloy/latest/alloy/providers/struct.PendingTransactionBuilder.html#method.set_timeout):

```rust
// Configure the pending transaction.
let pending_tx_builder = provider.send_transaction(tx)
    .await?
    .with_required_confirmations(2)
    .with_timeout(Some(std::time::Duration::from_secs(60)));
```

By passing the `TransactionRequest`, we populate any missing fields. This involves filling in details such as the nonce, chain ID, gas price, and gas limit:

```diff
// Build a transaction to send 100 wei from Alice to Bob.
let tx = TransactionRequest::default()
+   .with_from(alice)
    .with_to(bob)
+   .with_nonce(nonce)
+   .with_chain_id(chain_id)
    .with_value(U256::from(100))
+   .with_gas_price(gas_price)
+   .with_gas_limit(gas_limit);
```

As part [Wallet's `fill` method](https://docs.rs/alloy/latest/alloy/providers/fillers/trait.TxFiller.html#tymethod.fill), registered on the `Provider`, we build a signed transaction from the populated `TransactionRequest` using our signer, Alice.

At this point, the `TransactionRequest` becomes a `TransactionEnvelope`, ready to send across the network. By calling either [`register`](https://docs.rs/alloy/latest/alloy/providers/struct.PendingTransactionBuilder.html#method.register), [`watch`](https://docs.rs/alloy/latest/alloy/providers/struct.PendingTransactionBuilder.html#method.watch) or [`get_receipt`](https://docs.rs/alloy/latest/alloy/providers/struct.PendingTransactionBuilder.html#method.get_receipt) we can broadcast the transaction and track the status of the transaction.

For instance:

```rust
// Send the transaction and fetch the receipt after the transaction was included.
let tx_receipt = provider.send_transaction(tx).await?.get_receipt().await?;
```

The [`TransactionReceipt`](https://docs.rs/alloy/latest/alloy/rpc/types/struct.TransactionReceipt.html) provides a comprehensive record of the transaction's journey and outcome, including the transaction hash, block details, gas used, and addresses involved.

```rust
pub struct TransactionReceipt {
    // ...

    /// Transaction Hash.
    pub transaction_hash: TxHash,

    /// Index within the block.
    pub transaction_index: Option<TxIndex>,

    /// Hash of the block this transaction was included within.
    pub block_hash: Option<BlockHash>,

    /// Number of the block this transaction was included within.
    pub block_number: Option<BlockNumber>,

    /// Gas used by this transaction alone.
    pub gas_used: u128,

    /// Address of the sender.
    pub from: Address,

    /// Address of the receiver. None when its a contract creation transaction.
    pub to: Option<Address>,

    /// Contract address created, or None if not a deployment.
    pub contract_address: Option<Address>,

    // ...
}
```

This completes the journey of broadcasting a signed transaction. Once the transaction is included in a block, it becomes an immutable part of the Ethereum blockchain, ensuring that the transfer of `100 wei` from `Alice` to `Bob` is recorded permanently.

## Putting it all together

```rust
// [!include ~/snippets/transactions/examples/transfer_eth.rs]
```

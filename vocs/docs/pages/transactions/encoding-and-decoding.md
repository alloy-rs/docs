---
title: Encode and Decode EIP-2718 Envelopes
description: Encode, decode, hash, and recover signers from Ethereum TxEnvelope and ReceiptEnvelope values for legacy, EIP-2930, EIP-1559, EIP-4844, and EIP-7702 data
---

# Encode and decode EIP-2718 envelopes

The examples use the `alloy` meta-crate's default features. With `default-features = false`, select
`consensus` and `eips` for envelope codecs, `k256` and `signer-local` for recovery and local
signing, and the relevant `rpc-types` and provider features for RPC access. See
[feature flags](/reference/feature-flags).

Ethereum transaction bytes are not ABI-encoded and are not the JSON returned by an RPC node. Signed
execution transactions and receipts use [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718)
envelopes; EIP-4844 additionally defines a pooled sidecar wrapper for submission and gossip. In
Alloy, use [`TxEnvelope`](https://docs.rs/alloy/latest/alloy/consensus/type.TxEnvelope.html) for
signed Ethereum transactions and
[`ReceiptEnvelope`](https://docs.rs/alloy/latest/alloy/consensus/enum.ReceiptEnvelope.html) for
execution receipts.

Do not encode `TxLegacy`, `TxEip2930`, `TxEip1559`, `TxEip4844`, or `TxEip7702` directly when you
need canonical transaction bytes. Sign the concrete transaction and convert it into `TxEnvelope`
first. The envelope preserves the signature and variant, including the type byte for typed
transactions and its absence for legacy transactions.

## Choose the representation at the boundary

| Data at the boundary | Alloy representation | Encoding |
| --- | --- | --- |
| Unsigned transaction being constructed | `TransactionRequest` or a concrete `TxEip*` type | Signing payload, not broadcast bytes |
| Signed execution transaction for blocks or storage | `TxEnvelope` with any EIP-4844 sidecar stripped | EIP-2718 execution envelope |
| Signed transaction for submission or pooled gossip | Network's signed envelope; EIP-4844 includes a sidecar | EIP-2718, with the pooled EIP-4844 wrapper when applicable |
| Ethereum JSON-RPC transaction response | `rpc::types::Transaction` wrapping a `TxEnvelope` and node-reported sender | JSON-RPC |
| Consensus execution receipt | `ReceiptEnvelope` | EIP-2718 |
| Solidity arguments, return values, events, and errors | `SolValue` and `SolType` implementations | Solidity ABI |

See [protocol and RPC types](/reference/protocol-and-rpc-types) for the wider type hierarchy.

## Understand the type byte

Legacy transactions and receipts are RLP lists without an EIP-2718 type byte. Newer variants begin
with one byte followed by that type's encoded payload:

| Variant | Type byte |
| --- | --- |
| Legacy | none |
| EIP-2930 access-list | `0x01` |
| EIP-1559 dynamic-fee | `0x02` |
| EIP-4844 blob | `0x03` |
| EIP-7702 authorization-list | `0x04` |

EIP-7594 changes the blob sidecar format; it does not introduce another execution transaction type.
The transaction envelope remains EIP-4844 type `0x03`.

These variants describe the bytes Alloy can represent, not whether a particular chain has activated
the type or whether the transaction is statefully valid. For example, a submit-ready EIP-4844
transaction needs at least one blob and its sidecar, while EIP-7702 requires a non-empty list of
signed authorizations.

## Encode a signed transaction

Import `Encodable2718` to use the allocating convenience method or write into a reusable buffer:

```rust
use alloy::{
    consensus::TxEnvelope,
    eips::eip2718::Encodable2718,
};

fn encode(envelope: &TxEnvelope) -> Vec<u8> {
    // Convenience form.
    let encoded = envelope.encoded_2718();

    // Equivalent form for a caller-owned, preallocated buffer.
    let mut buffer = Vec::with_capacity(envelope.encode_2718_len());
    envelope.encode_2718(&mut buffer);
    assert_eq!(encoded, buffer);

    // `encode_2718` appends, so clear the buffer before encoding into it again.
    buffer.clear();
    envelope.encode_2718(&mut buffer);
    assert_eq!(encoded, buffer);

    encoded
}
```

When manually constructing a concrete transaction, sign its `signature_hash()` and then convert the
signed value:

```rust
use alloy::{
    consensus::{SignableTransaction, TxEnvelope},
    signers::{local::PrivateKeySigner, SignerSync},
};

# fn example(
#     transaction: alloy::consensus::TxEip1559,
#     signer: &PrivateKeySigner,
# ) -> eyre::Result<TxEnvelope> {
let signature = signer.sign_hash_sync(&transaction.signature_hash())?;
let envelope: TxEnvelope = transaction.into_signed(signature).into();
# Ok(envelope)
# }
```

For application code, the transaction builder and wallet filler usually build the signed envelope
for you. [`Provider::send_tx_envelope`](https://docs.rs/alloy/latest/alloy/providers/trait.Provider.html#method.send_tx_envelope)
accepts it directly.

## Decode exactly one transaction

Use `decode_2718_exact` when a byte slice must contain exactly one envelope:

```rust
use alloy::{
    consensus::TxEnvelope,
    eips::eip2718::Decodable2718,
};

# fn example(raw: &[u8]) -> eyre::Result<TxEnvelope> {
let envelope = TxEnvelope::decode_2718_exact(raw)?;
# Ok(envelope)
# }
```

`decode_2718(&mut input)` advances a mutable slice and deliberately permits trailing bytes. Use it
when parsing a larger stream. Prefer the exact decoder for standalone, untrusted input so appended
data is rejected.

For typed envelopes, `network_encode` and `network_decode` add or consume the outer RLP string
wrapper used by Ethereum's peer-to-peer protocol; the legacy RLP list is unchanged. These methods
are not substitutes for EIP-2718 bytes passed to `eth_sendRawTransaction`.

## Convert an RPC transaction response

The default Ethereum RPC transaction response wraps a consensus envelope with the `from` address
reported by the node. Consume the concrete response with `into_inner()` instead of serializing
through JSON. If the response is untrusted, verify the reported sender and hash against the signed
bytes:

```rust
use alloy::{
    consensus::{transaction::SignerRecoverable, TxEnvelope},
    eips::eip2718::{Decodable2718, Encodable2718},
    providers::Provider,
};

# async fn example(
#     provider: &impl Provider,
#     hash: alloy::primitives::B256,
# ) -> eyre::Result<()> {
let response = provider
    .get_transaction_by_hash(hash)
    .await?
    .ok_or_else(|| eyre::eyre!("transaction not found"))?;

let rpc_from = response.inner.signer();
let reported_hash = *response.inner.tx_hash();
let envelope = response.into_inner();

assert_eq!(envelope.recover_signer()?, rpc_from);
let raw = envelope.encoded_2718();
let decoded = TxEnvelope::decode_2718_exact(&raw)?;
assert_eq!(decoded.recover_signer()?, rpc_from);
assert_eq!(*decoded.tx_hash(), reported_hash);
# Ok(())
# }
```

Use `into_recovered()` instead when you want to retain the sender alongside the envelope.
Network-generic code should use the envelope and response types associated with its `Network`;
rollup and custom networks can define variants that Ethereum's `TxEnvelope` does not. `AnyNetwork`
can preserve unknown variants at the JSON-RPC boundary, but its catch-all unknown envelopes cannot
be EIP-2718 encoded or decoded; use a concrete network envelope for binary round trips.

## Distinguish the hashes

- `signature_hash()` is the hash of the unsigned signing payload. A signer signs this value.
- `tx_hash()` is the identifier of the signed transaction envelope.
- `recover_signer()` recovers the sender from the signed payload and signature.

For EIP-7702, `recover_signer()` recovers the outer transaction sender. Each authorization has a
separate signature and authority, available through `SignedAuthorization::recover_authority()`.

Do not calculate a transaction hash from the JSON text. For a trusted response, preserve or extract
the embedded envelope and use `tx_hash()`. To verify an untrusted node's reported hash, decode the
canonical bytes into a fresh envelope as shown above.

## Encode and decode receipts

Receipt envelopes use the same legacy-versus-typed distinction and the same EIP-2718 traits:

```rust
use alloy::{
    consensus::ReceiptEnvelope,
    eips::eip2718::{Decodable2718, Encodable2718},
};

# fn example(receipt: ReceiptEnvelope) -> eyre::Result<()> {
let encoded = receipt.encoded_2718();
let decoded = ReceiptEnvelope::decode_2718_exact(&encoded)?;
assert_eq!(decoded, receipt);
# Ok(())
# }
```

An RPC `TransactionReceipt` contains RPC metadata and logs with block context. Convert those logs to
primitive consensus logs before persisting canonical receipt bytes:

```rust
# async fn example(
#     receipt: alloy::rpc::types::TransactionReceipt,
# ) -> eyre::Result<()> {
use alloy::eips::eip2718::Encodable2718;

let consensus_receipt = receipt.into_primitives_receipt().into_inner();
let encoded = consensus_receipt.encoded_2718();
# let _ = encoded;
# Ok(())
# }
```

The receipt envelope does not contain the transaction hash, per-transaction gas used, block number,
or RPC log indices. Its consensus payload contains status or post-state, cumulative gas used, logs
bloom, and logs.

## EIP-4844 sidecars

An EIP-4844 transaction appears without a sidecar in execution blocks and body retrieval, but
submission and transaction-pool gossip require the pooled representation with a sidecar. The
transaction hash commits to the EIP-4844 payload and blob versioned hashes, not the blob bodies.
Convert a default `TxEnvelope` into `EthereumTxEnvelope<TxEip4844>` to strip any sidecar before
encoding the execution/block form. On that sidecar-free envelope,
`try_into_pooled_eip4844(sidecar)` attaches a sidecar for submission. More general `map_eip4844`
and `try_map_eip4844` conversions can replace the EIP-4844 representation inside an envelope.

## Runnable examples

- [Encode and decode transaction envelopes](/examples/transactions/encode_decode_transaction_envelopes)
  covers all current Ethereum variants, signer recovery, hashes, reusable buffers, and conversion
  from an RPC response.
- [Encode and decode receipt envelopes](/examples/transactions/encode_decode_receipt_envelopes)
  round-trips every current Ethereum receipt variant.
- [Consensus and RPC type unification](/examples/providers/embed_consensus_rpc) shows how blocks,
  transactions, and receipts embed their consensus counterparts.

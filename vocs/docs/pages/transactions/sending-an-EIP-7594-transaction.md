---
title: Sending an EIP-7594 Blob Sidecar
description: Convert and send an EIP-4844 blob transaction with an EIP-7594 PeerDAS cell-proof sidecar
---

# Sending an EIP-7594 blob sidecar

[EIP-7594](https://eips.ethereum.org/EIPS/eip-7594) introduces PeerDAS cell proofs for blob data.
It does not add a new execution-layer transaction type: the transaction remains an EIP-4844 blob
transaction (`TxType = 3`), while its pooled sidecar uses the EIP-7594 representation.

The workflow is:

1. Build an EIP-4844 transaction and blob sidecar.
2. Let the provider fill and sign the transaction.
3. Convert the pooled EIP-4844 sidecar to `BlobTransactionSidecarEip7594` using the intended KZG
   settings.
4. Encode the envelope and submit it with `send_raw_transaction`.

```rust
// [!include ~/snippets/transactions/examples/send_eip7594_transaction.rs]
```

The connected node must support the fork and pooled transaction format. The runnable example starts
Anvil with the Osaka hardfork; it requires a recent compatible Anvil binary and the
`provider-anvil-node` feature.

Use `EnvKzgSettings::Default` only when its environment-selected settings match the network. KZG
setup and sidecar conversion errors should stop submission rather than falling back to a different
format silently.

For ordinary pre-PeerDAS blob transactions, use the [EIP-4844 guide](/transactions/sending-an-EIP-4844-transaction).

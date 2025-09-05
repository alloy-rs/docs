---
description: Send EIP-7702 transactions with authorization lists for account abstraction features
---

## Sending an EIP-7702 transaction

Send an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) transaction by specifying the `authorization_list` field. This is also known as a set code transaction.

```rust
// [!include ~/snippets/transactions/examples/send_eip7702_transaction.rs]
```

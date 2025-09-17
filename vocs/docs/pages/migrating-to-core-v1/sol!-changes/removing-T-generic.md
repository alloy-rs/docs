---
description: Removal of the transport generic T from contract and RPC codegen
---

## Removing the `T` transport generic

Since [alloy#1859](https://github.com/alloy-rs/alloy/pull/1859) the `Provider` is independent of the `Transport`, making it easier to roll types that wrap the `Provider`. This improvement was reflected in the [`CallBuilder`](https://docs.rs/alloy-contract/latest/alloy_contract/struct.CallBuilder.html) type but not carried to the `sol!` macro bindings.

[core#865](https://github.com/alloy-rs/core/pull/865) removes the `T` transport generic from the `sol!` macro bindings, making the contract and RPC codegen cleaner.

This can be demonstrated using a simple example that wraps an `ERC20Instance` type.

### Before

```rust
struct Erc20<P: Provider> {
    instance: ERC20Instance<(), P>,
}
```

### After

```rust
struct Erc20<P: Provider> {
    instance: ERC20Instance<P>,
}
```

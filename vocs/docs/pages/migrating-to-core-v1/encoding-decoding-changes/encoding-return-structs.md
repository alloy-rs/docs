---
description: Learn about changes to ABI encoding for function return structs in alloy 1.0
---

## Encoding return structs

[core#909](https://github.com/alloy-rs/core/pull/909) improves return type encoding by allowing to pass the return struct directly into `SolCall::abi_encode_returns`.

Consider the following:

```rust
sol! {
    function something() returns (uint256, address);
}
```

### Before

A tuple would need to passed of the fields from return type, `somethingReturn`

```rust
let encoding = somethingCall::abi_encode_returns(&(somethingReturn._0, somethingReturn._1));
```

### After

One can now pass the return struct directly without deconstructing it as a tuple.

```rust
let encoding = somethingCall::abi_encode_returns(&somethingReturn);
```

---
description: Removal of the validate boolean parameter from abi_decode methods in alloy 1.0
---

## Removing the `validate: bool` from the `abi_decode` methods

[core#863](https://github.com/alloy-rs/core/pull/863) removes the `validate: bool` parameter from the `abi_decode_*` methods. The behavior of these `abi_decode_*` methods is now equivalent to passing `validate = false`.

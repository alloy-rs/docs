---
description: Changes to function call bindings from named fields to tuple struct format in alloy 1.0
---

## Changes to function call bindings

With [core#884](https://github.com/alloy-rs/core/pull/884) the form of the generated call type (used for abi-encoding) is now dependent upon two factors:

1. Number of parameters/args does the function take
2. Whether the parameter is named or unnamed in case it has only **one** param

Consider the following:

```rust
sol! {
    // No params/args
    function totalSupply() returns (uint256)
    // Exactly one unnamed param
    function balanceOf(address) returns (uint256);
    // Multiple params - Bindings for this remain unchanged.
    function approve(address spender, uint256 amount) returns (bool);
}
```

### Before

Generated bindings were independent of the number of parameters and names, and the following struct were generated for the above function calls

```rust
// A struct with no fields as there are no parameters.
pub struct totalSupplyCall { };
let encoding = totalSupplyCall { }.abi_encode();

pub struct balanceOfCall { _0: Address };
let encoding = balanceOfCall { _0: Address::ZERO }.abi_encode();
```

### After

```rust
// A unit struct is generated when there are no parameters.
pub struct totalSupplyCall;
let encoding = totalSupplyCall.abi_encode();

// A tuple struct with a single value is generated in case of a SINGLE UNNAMED param.
pub struct balanceOfCall(pub Address);
let encoding = balanceOfCall(Address::ZERO).abi_encode();
```

Now if the parameter in `balanceOf` was named like so:

```rust
sol! {
    function balanceOf(address owner) returns (uint256);
}
```

Then a regular struct would be generated like before:

```rust, ignore
pub struct balanceOfCall { owner: Address };
```

Bindings for function calls with **multiple parameters** are **unchanged**.

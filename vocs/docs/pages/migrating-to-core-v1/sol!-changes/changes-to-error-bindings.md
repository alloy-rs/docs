---
description: Changes to error bindings and how error handling is updated in Alloy v1.0
---

## Changes to error bindings

[core#883](https://github.com/alloy-rs/core/pull/883) makes similar changes to the error bindings that [core#884](https://github.com/alloy-rs/core/pull/884) did to function call bindings in the sense that the form of the generated type is dependent upon two factors:

1. Number of parameters the error has.
2. Whether the parameter is named or unnamed in case it has only **one** param

Consider the following example:

```rust
sol! {
   // No params/args
   error Some();
   // Exactly one unnamed param
   error Another(uint256);
   // Exactly one named param - bindings for this remain unchanged
   error YetAnother(uint256 a);
}
```

## Before

All of the above were generated as regular structs.

```rust
// Empty struct
pub struct SomeError { };

pub struct AnotherError {
    _0: U256
}

pub struct YetAnotherError {
    a: U256
}
```

## After

```rust

// Unit struct for error with no params
pub struct SomeError;

// Tuple struct for SINGLE UNNAMED param
pub struct AnotherError(pub U256);
```

Bindings remain **unchanged** for errors with **multiple params** and **single but named param**.

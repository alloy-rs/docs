---
description: Improvements to function return types by removing the need for _0 field access in Alloy 1.0
---

## Improving function call return types

With the inclusion of [core#855](https://github.com/alloy-rs/core/pull/855) return values of function calls with a _singular_ value is more intuitive and easier to work with.

Consider the following example of reading the balance of an ERC20:

```rust
sol! {
    #[sol(rpc)]
    contract ERC20 {
        // Note: Only a single value is being returned
        function balanceOf(address) returns (uint256);
    }
}
```

## Before

Calling the `balanceOf` fn would return a struct `balanceOfReturn` which encapsulated the actual balance value.

```rust
// .. snip ..
let balance_return: balanceOfReturn = erc20.balanceOf(owner).await?;

let actual_balance = balance_return._0;
```

## After

Calling the `balanceOf` fn would now yield the balance directly instead of a struct wrapping it.

```rust
// .. snip ..
let balance: U256 = erc20.balanceOf(owner).await?;
```

It is important to note that this change only applies to function calls that have a **singular** return value.

Function calls that **return multiple values** have their return types **unchanged**, i.e they still return a struct with values inside it.

```rust
sol! {
    function multiValues() returns (uint256 a, address b, bytes c);
}

// The above function call will have the following return type.

pub struct multiValuesReturn {
    pub a: U256,
    pub b: Address,
    pub c: Bytes,
}
```

---
description: Changes to event bindings in Alloy v1.0
---

## Changes to event bindings

[core#885](https://github.com/alloy-rs/core/pull/885) makes changes to the event bindings in a breaking but very minimal way.
It changes the bindings for **only** events with no parameters

Consider the following event:

```rust
sol! {
    event Incremented();
}
```

### Before

The generated struct was an empty struct like below:

```rust
pub struct Incremented { };
```

### After

A unit struct is generated like below:

```rust
pub struct Incremented;
```

Bindings for events with parameters remain **unchanged**.

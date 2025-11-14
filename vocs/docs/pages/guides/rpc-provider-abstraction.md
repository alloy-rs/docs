---
description: Abstract provider implementations to work seamlessly across different transport layers and connection types
---

# RPC Provider Abstractions

Alloy offers _Provider Wrapping_ as a design pattern that lets you extend or customize the behavior of a Provider by encapsulating it inside another object.

There are several reasons why you would want create your own RPC provider abstractions, for example to simplify complex workflows, or build more intuitive interfaces for particular use cases (like deployment, data indexing, or trading).

Let's dive into an example: Imagine you have multiple contracts that need to be deployed and monitored. Rather than repeating the same boilerplate code throughout your application, you can create specialized abstractions that wrap the Provider. Your `Deployer` struct ingests the `Provider` and the bytecode to deploy contracts and interact with them. More on this in the example snippets below.

There are two ways to ways to implement provider wrapping, both offer different trade-offs depending on your use case:

1. Using Generics (`P: Provider`): Preserves type information and enables static dispatch
2. Using Type Erasure (`DynProvider`): Simplifies types at the cost of some runtime overhead

## 1. Using generics `P: Provider`

The ideal way is by using the `P: Provider` generic on the encapsulating type. This approach Preserves full type information and static dispatch, though can lead to complex type signatures and handling generics.

This is depicted by the following [example](/examples/providers/wrapped_provider). Use generics when you need maximum performance and type safety, especially in library code.

```rust [wrapped_provider.rs]
// [!include ~/snippets/providers/examples/wrapped_provider.rs]
```

During this approach the compiler creates a unique `Deployer` struct for each Provider type you use static dispatch with slightly better runtime overhead.
Use this approach when performance is critical, type information is valuable e.g. when creating library code or working with embedded systems.
Type information is valuable: You need to know the exact Provider type for specialized behavior

## 2. Using Type Erasure `DynProvider`

Use DynProvider when you prioritize simplicity and flexibility, such as in application code where the performance difference is negligible.

[`DynProvider`](/examples/providers/dyn_provider) erases the type of a provider while maintaining its core functionality.

```rust [dyn_provider.rs]
// [!include ~/snippets/providers/examples/dyn_provider.rs]
```

With `DynProvider` we use dynamic dispatch, accept a slightly slower runtime overhead but can avoid dealing with generics.
Use this approach when you prefer simplicity over speed speed, minimise compile and binary size or want to create heterogeneous collections.

## `Provider` does not require `Arc`

You might be tempted to wrap a `Provider` in `Arc` to enable sharing and cloning:

```rust
#[derive(Clone)]
struct MyProvider<P: Provider> {
    inner: Arc<P>, // Unnecssary
}
```

This is actually unnecessary because Alloy's Providers already implement internal reference counting. Instead, simply add the `Clone` bound when needed:

```rust

```

This eliminates common boilerplate and prevents potential performance issues from double Arc-ing.

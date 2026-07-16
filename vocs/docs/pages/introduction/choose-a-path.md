---
title: Choose a Path
description: Find the shortest Alloy documentation path for a specific Ethereum development task
---

# Choose a path

Start with the row that matches what you are building. Each path points to an explanation first and
then to runnable code where one exists.

| Goal | Read first | Runnable examples |
| --- | --- | --- |
| Connect to a node and make RPC calls | [Getting started](/introduction/getting-started), then [RPC providers](/rpc-providers/introduction) | [Providers](/examples/providers/README) |
| Read or write a smart contract | [Contract interactions](/contract-interactions/using-sol!), then [reading](/contract-interactions/read-contract) or [writing](/contract-interactions/write-contract) | [Contracts](/examples/contracts/README) |
| Build, sign, and send a transaction | [Transaction lifecycle](/transactions/transaction-lifecycle), then [transaction builder](/transactions/using-the-transaction-builder) | [Transactions](/examples/transactions/README) |
| Subscribe to blocks, logs, or pending transactions | [WebSocket provider](/rpc-providers/ws-provider) | [Subscriptions](/examples/subscriptions/README) |
| Choose a signer or wallet | [Signers vs. Ethereum wallet](/guides/signers-vs-ethereum-wallet) | [Wallets and signers](/examples/wallets/README) |
| Work with more than one chain or custom network types | [Interacting with multiple networks](/guides/interacting-with-multiple-networks) | [Any network](/examples/advanced/any_network) |
| Add retries, rate limits, fallbacks, or observability | [Transport layers](/guides/layers) | [Layers](/examples/layers/README) |
| Test with mocks, Anvil, Geth, Reth, or a fork | [Testing Alloy applications](/guides/testing) | [Mock provider](/examples/providers/mocking) and [node bindings](/examples/node-bindings/README) |
| Decode ABI data, logs, or transaction input | [Using `sol!`](/contract-interactions/using-sol!) | [`sol!` examples](/examples/sol-macro/README) and [transaction decoding](/examples/transactions/decode_input) |
| Select a smaller dependency set | [Feature flags](/reference/feature-flags) | [Alloy features on docs.rs](https://docs.rs/crate/alloy/latest/features) |
| Migrate from ethers-rs | [Migration reference](/migrating-from-ethers/reference) | [Conversions](/migrating-from-ethers/conversions) |

## When a guide does not cover the API

Use the documentation layers in this order:

1. This site for concepts and supported workflows.
2. The [examples repository](https://github.com/alloy-rs/examples) for complete programs.
3. [docs.rs](https://docs.rs/alloy/latest/alloy/) for exact types, traits, methods, and feature gates.
4. The [Alloy source](https://github.com/alloy-rs/alloy) when behavior or version history matters.

The [agent guide](/introduction/prompting) gives the same retrieval order in a compact form for
coding agents.

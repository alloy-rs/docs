---
title: Using Alloy documentation with coding agents
description: Give coding agents current, focused Alloy context and require compilable Rust output
---

# Using Alloy documentation with coding agents

Alloy publishes machine-readable documentation for coding agents. Give an agent the smallest relevant context instead of copying the entire manual into every prompt.

## Recommended retrieval order

1. Query [`agent-index.json`](https://alloy.rs/agent-index.json) when the client can read JSON. It
   maps task vocabulary, features, environment variables, guides, and examples.
2. Otherwise start with [`llms.txt`](https://alloy.rs/llms.txt) to discover the canonical page.
3. Load the smallest relevant page through its `markdown_url` field when present. Fall back to its
   HTML `url`, then follow the runnable examples it links to.
4. Use [docs.rs](https://docs.rs/alloy/latest/alloy/) for exact types, traits, methods, and feature gates.
5. Use [`llms-full.txt`](https://alloy.rs/llms-full.txt) only when the agent cannot retrieve pages individually.

The Alloy version displayed in this site's navigation is the version targeted by hand-written documentation. Generated example pages identify the exact examples commit they were copied from.

All URLs in the published agent inventories are absolute. Cache them with the documented Alloy
version and invalidate the cache when that version changes.

## Starter prompt

Use this as a short foundation, then append the task, target chain, transport, signer, and runtime constraints.

```text
You are implementing a Rust application with Alloy.

Use the supplied alloy.rs documentation and linked docs.rs API pages as the
source of truth. Prefer the current stable Alloy APIs shown by those sources.

Requirements:
- Name every required crate and feature flag.
- Produce complete, runnable Rust rather than disconnected fragments.
- Import the traits needed for extension methods.
- Use ProviderBuilder for provider construction and sol! for typed contract APIs.
- Distinguish consensus types, RPC types, and network-specific types.
- Explain external prerequisites such as RPC_URL, WebSocket support, credentials,
  hardware devices, Anvil, or a particular RPC namespace.
- Read secrets and RPC URLs from environment variables; do not embed credentials
  or depend on an undocumented shared endpoint.
- Handle transport errors, JSON-RPC errors, contract reverts, transaction timeouts,
  and confirmations when they are relevant to the task.
- Do not invent methods or feature names. Verify exact symbols against docs.rs.
- End with the commands needed to format and compile the result.

Task:
<describe the desired program and constraints>
```

## Context that improves results

Include these details when they matter:

- Ethereum or another `Network` implementation.
- HTTP, WebSocket, IPC, or a custom transport.
- Read-only access or transaction signing.
- Local key, mnemonic, keystore, hardware wallet, or cloud signer.
- Required RPC namespaces such as Debug, Trace, Engine, TxPool, or Anvil.
- Expected confirmation policy and reorg behavior.
- Native, WASM, or `no_std` target.
- Whether a local Anvil instance may be used for tests.

## Verify generated projects

Agents should validate their output with the compiler rather than treating plausible-looking code as complete.

```sh
cargo fmt --check
cargo check --all-targets --all-features
cargo clippy --all-targets --all-features -- -D warnings
```

For a minimal-feature project, also check the exact feature set used in production instead of relying only on `--all-features`.

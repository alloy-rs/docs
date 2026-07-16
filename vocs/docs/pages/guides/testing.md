---
title: Testing Alloy Applications
description: Choose mock transports, local execution nodes, forks, and live RPC tests for Alloy code
---

# Testing Alloy applications

Use the smallest test environment that exercises the behavior you own. Alloy supports deterministic
mocked RPC calls, local execution clients, forked chain state, and explicit live-network tests.

| Test level | Best for | External requirements |
| --- | --- | --- |
| Mock transport | request shape, response handling, error paths | none |
| Local Anvil | transactions, contracts, mining, node controls | `anvil` binary |
| Local Geth or Reth | client-specific and operational APIs | matching client binary |
| Forked node | behavior against existing contracts and state | node binary plus upstream RPC |
| Live RPC | provider compatibility and deployment smoke tests | credentials, network, funded account if writing |

## Mock a provider

`Asserter` supplies a FIFO queue of serialized successes and JSON-RPC failures to a mock transport.
This keeps unit tests offline and makes error cases deterministic.

```rust
use alloy::{
    providers::{Provider, ProviderBuilder},
    transports::mock::Asserter,
};

# async fn run() -> Result<(), Box<dyn std::error::Error>> {
let asserter = Asserter::new();
let provider = ProviderBuilder::new().connect_mocked_client(asserter.clone());

asserter.push_success(&42_u64);
assert_eq!(provider.get_block_number().await?, 42);

asserter.push_failure_msg("rate limited");
let error = provider.get_block_number().await.unwrap_err();
assert_eq!(error.as_error_resp().unwrap().message, "rate limited");
# Ok(())
# }
```

Push responses in the exact order the code will request them. A mock validates your client logic;
it does not prove that a real node accepts the request or returns the same shape. See the runnable
[mock provider example](/examples/providers/mocking).

For application code, accept `impl Provider`, a generic `P: Provider`, or a narrow trait owned by
the application. This allows a mock provider without hiding every call behind dynamic dispatch.

## Start a local Anvil provider

Enable `provider-anvil-node` to use the `ProviderBuilder` helpers. Install Foundry separately and
ensure `anvil` is on `PATH`.

```rust
use alloy::providers::{ext::AnvilApi, ProviderBuilder};

# async fn run() -> Result<(), Box<dyn std::error::Error>> {
let provider = ProviderBuilder::new()
    .connect_anvil_with_config(|anvil| anvil.chain_id(31_337).block_time(1));

let info = provider.anvil_node_info().await?;
assert_eq!(info.environment.chain_id, 31_337);
# Ok(())
# }
```

The node process is stopped when its owning handle or provider state is dropped. Use dynamically
assigned ports for parallel tests and avoid assuming a globally running node.

The [node-binding examples](/examples/node-bindings/README) also cover Anvil deployment and storage
overrides, plus local Geth and Reth processes.

## Fork existing state

Fork tests are useful for integration with deployed contracts, but they are not deterministic by
default. Read the upstream endpoint from `RPC_URL` and pin a block number whenever the test permits:

```rust
use alloy::providers::ProviderBuilder;

# fn provider() -> Result<impl alloy::providers::Provider, Box<dyn std::error::Error>> {
let rpc_url = std::env::var("RPC_URL")?;
let provider = ProviderBuilder::new().connect_anvil_with_config(|anvil| {
    anvil.fork(rpc_url).fork_block_number(20_000_000_u64)
});
# Ok(provider)
# }
```

A pinned height stabilizes state but still depends on upstream availability and archive access. Use
a fixture or mock for unit tests, and reserve forks for cases where real bytecode and storage are
the point of the test.

## Client-specific tests

Use `alloy-node-bindings` to start Geth, Reth, or Anvil when testing an extension namespace or
client-specific behavior. The binding does not install the binary. Pin the client version in CI and
skip with an explicit message when a developer has not installed an optional binary.

Do not treat one client as proof of compatibility with every other client. Run a small matrix for
the JSON-RPC methods your library promises to support.

## Live-network tests

Keep live RPC tests outside the default offline suite. Require explicit environment variables,
avoid shared public endpoints, and fail early with an actionable message when configuration is
missing. Read-only smoke tests should assert stable invariants; write tests should use a dedicated
ephemeral account and bounded funds.

## CI recommendations

- Run mock tests and `cargo check --all-targets` on every change.
- Run deterministic local-node tests when the required binary is provisioned in CI.
- Pin fork block numbers, node versions, dependency versions, and the Rust toolchain.
- Serialize tests that mutate one shared node, or give each test its own node and ports.
- Set timeouts so a missing block, device, or endpoint does not hang the job.
- Mark tests that need credentials, hardware, or paid services and run them in protected jobs.
- Never expose RPC tokens, private keys, or cloud credentials in test output.

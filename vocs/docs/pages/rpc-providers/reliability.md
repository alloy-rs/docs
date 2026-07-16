---
title: Reliability and Retries
description: Configure Alloy connection retries, request backoff, fallbacks, timeouts, and error handling
---

# Reliability and retries

Connection establishment, a JSON-RPC request, and transaction confirmation are different failure
boundaries. Configure them separately so retry behavior is intentional.

## Connection and reconnection

`ConnectionConfig` controls built-in connection settings. For WebSockets, the retry interval is the
base of a capped exponential reconnect backoff.

```rust
use alloy::providers::{ConnectionConfig, ProviderBuilder};
use std::time::Duration;

# async fn run() -> Result<(), Box<dyn std::error::Error>> {
let ws_url = std::env::var("WS_URL")?;
let config = ConnectionConfig::new()
    .with_max_retries(8)
    .with_retry_interval(Duration::from_secs(1));

let provider = ProviderBuilder::new()
    .connect_with_config(&ws_url, config)
    .await?;
# let _ = provider;
# Ok(())
# }
```

The same configuration can carry an `Authorization` header. Prefer environment-based credentials
and never put provider tokens in source or committed URLs.

Connection retries do not retry every failed RPC response. Apply a request layer for that.

## Request retries and rate limits

`RetryBackoffLayer` wraps the RPC transport. Its default policy retries responses Alloy recognizes
as transient, including common rate-limit and temporary-unavailability responses, while honoring a
server backoff hint when one is present.

```rust
use alloy::{
    providers::ProviderBuilder,
    rpc::client::RpcClient,
    transports::layers::RetryBackoffLayer,
};

# fn build(rpc_url: alloy::transports::http::reqwest::Url) {
let max_retries = 6;
let initial_backoff_ms = 250;
let compute_units_per_second = 100;

let retry = RetryBackoffLayer::new(
    max_retries,
    initial_backoff_ms,
    compute_units_per_second,
);
let client = RpcClient::builder().layer(retry).http(rpc_url);
let provider = ProviderBuilder::new().connect_client(client);
# let _ = provider;
# }
```

The compute-unit setting spaces retries to avoid immediately exceeding the service limit again. Tune
it to the provider plan; it is not a universal requests-per-second value.

For application-specific errors, implement `RetryPolicy` or extend `RateLimitRetryPolicy`. Be
conservative with state-changing or non-standard methods: retry only when duplicate submission is
safe and the failure is known to be transient.

See the runnable [retry layer example](/examples/layers/retry_layer).

## Multiple endpoints

`FallbackLayer` ranks a collection of transports and can route around an unhealthy endpoint. Use it
when endpoints are equivalent for the operation. Reads from nodes at different heads can return
different data, and transaction submission to multiple nodes can have provider-specific effects.

See the runnable [fallback layer example](/examples/layers/fallback_layer). The example endpoint
list should come from application configuration rather than source code.

## Timeouts

Alloy does not impose one application-wide timeout. Wrap individual calls with the async runtime
timeout appropriate to the operation:

```rust
use alloy::providers::Provider;
use std::time::Duration;

# async fn run(provider: impl Provider) -> Result<(), Box<dyn std::error::Error>> {
let block_number = tokio::time::timeout(
    Duration::from_secs(10),
    provider.get_block_number(),
)
.await??;
# let _ = block_number;
# Ok(())
# }
```

Pending transactions have a separate confirmation timeout:

```rust
# use std::time::Duration;
# async fn run<N: alloy::network::Network>(pending: alloy::providers::PendingTransactionBuilder<N>) -> Result<(), Box<dyn std::error::Error>> {
let receipt = pending
    .with_required_confirmations(2)
    .with_timeout(Some(Duration::from_secs(60)))
    .get_receipt()
    .await?;
# let _ = receipt;
# Ok(())
# }
```

Timeouts cancel the caller's wait, not the on-chain transaction. Store the transaction hash before
waiting so another process can resume receipt tracking.

## Error handling

Provider calls return `TransportError`, an RPC error whose variants distinguish:

- an error response returned by the JSON-RPC server;
- request serialization or response deserialization;
- an absent or null response;
- HTTP and lower-level transport failures;
- a lost backend or unavailable pubsub service.

Log the RPC method, endpoint identity, chain ID, request ID, and transaction hash where applicable.
Do not log authorization headers, private keys, signed secrets, or full provider URLs containing
tokens. Match only the variants the application can recover from; propagate unexpected errors with
their source chain intact.

## Production checklist

- Set explicit connection, request, and confirmation timeouts.
- Bound retries and add jitter or provider-aware backoff where appropriate.
- Persist progress before processing long-running block or log streams.
- Treat reorgs, duplicate delivery, and endpoint head skew as normal distributed-system behavior.
- Record retry counts, latency, error class, and endpoint health.
- Test rate limits, disconnects, stale endpoints, and shutdown behavior before deployment.

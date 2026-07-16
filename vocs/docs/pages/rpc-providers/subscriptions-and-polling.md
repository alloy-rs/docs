---
title: Subscriptions and Polling
description: Choose Alloy WebSocket subscriptions, JSON-RPC filters, or resumable block and log streams
---

# Subscriptions and polling

Alloy offers three event-streaming patterns. Choose based on transport support and whether the
consumer must resume from a known block.

| Pattern | Transport | Starts from history | Reorg handling |
| --- | --- | --- | --- |
| `subscribe_*` | WebSocket or IPC | No | Delivers what the node publishes |
| `watch_*` | HTTP, WebSocket, or IPC | No | Follows the node filter |
| `watch_*_from` | HTTP, WebSocket, or IPC | Yes | Ordered or canonical variants |

The node must support the corresponding JSON-RPC method. Hosted providers sometimes disable
filters or individual subscription kinds.

## Live subscriptions

Subscriptions use `eth_subscribe` and require a pubsub transport. Enable `provider-ws` or
`provider-ipc` when using the `alloy` meta-crate.

```rust
use alloy::providers::{Provider, ProviderBuilder, WsConnect};
use futures_util::StreamExt;

# async fn run() -> Result<(), Box<dyn std::error::Error>> {
let ws_url = std::env::var("WS_URL")?;
let provider = ProviderBuilder::new()
    .connect_ws(WsConnect::new(ws_url))
    .await?;

let subscription = provider.subscribe_blocks().await?;
let mut blocks = subscription.into_stream();

while let Some(header) = blocks.next().await {
    println!("new block: {}", header.number);
}
# Ok(())
# }
```

Provider methods include `subscribe_blocks`, `subscribe_full_blocks`, `subscribe_logs`, and
pending-transaction subscriptions. Use `.channel_size(n)` on a subscription builder when the
default channel capacity does not fit the workload. A larger channel absorbs bursts but also keeps
more data in memory; it does not replace timely processing.

See the runnable [block](/examples/subscriptions/subscribe_blocks),
[log](/examples/subscriptions/subscribe_logs), and
[pending transaction](/examples/subscriptions/subscribe_pending_transactions) examples.

## JSON-RPC filter polling

The `watch_*` methods create a node-side filter and repeatedly call `eth_getFilterChanges`. This is
the portable choice for HTTP:

```rust
use alloy::providers::Provider;
use futures_util::{stream, StreamExt};

# async fn run(provider: impl Provider) -> Result<(), Box<dyn std::error::Error>> {
let poller = provider.watch_blocks().await?;
let mut hashes = poller.into_stream().flat_map(stream::iter);

while let Some(hash) = hashes.next().await {
    println!("new block: {hash}");
}
# Ok(())
# }
```

Polling consumes an RPC request on every interval even when nothing changes. Configure the poller
interval for the chain and provider limits, and avoid creating many overlapping filters.

## Resumable historical streams

An indexer should persist its last processed block and resume with `watch_blocks_from` or
`watch_logs_from`. These streams fetch each height in order, catch up to the head, and continue
polling.

- `watch_blocks_from` and `watch_logs_from` never emit the same height twice, but do not reconcile
  a later reorg.
- `watch_canonical_blocks_from` and `watch_canonical_logs_from` emit canonical added and removed
  events so a consumer can roll state backward and forward.
- Configure the block tag, poll interval, RPC concurrency, and maximum reorg depth on the returned
  builder as the workload requires.

Use a finalized or safe block tag when latency is less important than reorg risk. If downstream
state must follow the chain head, store both block number and hash and implement the removed-event
path.

## Reconnection is not replay

Alloy pubsub transports reconnect and restore subscriptions after retryable connection failures.
Events produced while the connection is unavailable can still be absent from the live stream.
Applications that require gap-free processing should track progress and backfill the missing block
range before returning to the live head.

Configure WebSocket connection retry count and base interval with
[`ConnectionConfig`](/rpc-providers/reliability#connection-and-reconnection). Handle the stream
ending as an application event: reconnect, backfill, and resubscribe rather than silently waiting.

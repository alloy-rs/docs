---
title: Protocol and RPC Types
description: Choose Alloy primitives, consensus envelopes, EIP helpers, RPC responses, genesis, trie, and serialization types
---

# Protocol and RPC types

Alloy models the same chain data at several boundaries. Choosing the type that belongs to the
boundary avoids manual conversion and preserves network-specific fields.

| Boundary | Primary crates or modules | Examples |
| --- | --- | --- |
| Values and ABI | `alloy-primitives`, `alloy-sol-types`, `alloy-dyn-abi`, `alloy-json-abi` | address, `U256`, bytes, Solidity bindings |
| Execution consensus | `alloy-consensus` | transaction envelopes, blocks, receipts, headers |
| Protocol extensions | `alloy-eips` | block identifiers and implemented EIP data structures |
| Network behavior | `alloy-network`, `alloy-network-primitives` | associated request, response, envelope, and receipt types |
| JSON-RPC wire data | `alloy-rpc-types-*` | `TransactionRequest`, RPC block and receipt responses |
| Chain configuration | `alloy-genesis` | execution genesis files and allocations |
| State proofs | `alloy-trie` | trie roots, proofs, and prefix-sorted updates |
| Representation helpers | `alloy-serde` | quantity, bytes, and compatibility serializers |

The `alloy` meta-crate re-exports enabled families as `alloy::primitives`, `alloy::consensus`,
`alloy::eips`, `alloy::network`, and `alloy::rpc::types`.

## Primitives and ABI types

Use primitives for chain-independent values: `Address`, `B256`, `Bytes`, fixed bytes, signed and
unsigned integers, hashes, and maps. The `sol!` macro and Solidity type traits provide static ABI
encoding, event and error decoding, and EIP-712 definitions. Dynamic ABI and JSON ABI types are for
interfaces discovered at runtime.

See [primitive types](/using-primitive-types/introduction), [`sol!`](/contract-interactions/using-sol!),
and [static vs. dynamic ABI](/guides/static-dynamic-abi-in-alloy).

## Consensus types

Consensus types represent execution-layer objects independently of their JSON-RPC metadata:

- signed and unsigned transaction variants and EIP-2718 envelopes;
- headers and blocks;
- receipts, logs, withdrawals, and blob sidecars;
- recovered transactions that pair an envelope with its signer.

Enable the `consensus` feature when using these through the meta-crate. Add `rlp`, `k256`, `kzg`, or
`consensus-secp256k1` only when the operation needs that codec or cryptographic implementation.

Use consensus types for database storage, networking, hashing, roots, signing payloads, and
protocol-level transformations. Use the network's RPC types at the provider boundary.

## RPC types wrap consensus data

Ethereum RPC responses embed consensus values and add fields supplied by the node. For example, an
RPC transaction includes block placement metadata while containing a recovered consensus envelope;
an RPC receipt includes transaction and block metadata around the consensus receipt.

Common conversion and access patterns include:

- `block.into_consensus()` to discard RPC-only metadata and obtain a consensus block;
- `transaction.into_recovered()` for the recovered consensus transaction;
- `.inner` or `.into_inner()` on wrapper types;
- `map_*` and `try_map_*` methods when replacing an embedded header or transaction type.

See the runnable [consensus and RPC embedding example](/examples/providers/embed_consensus_rpc).
Avoid re-serializing through JSON just to convert between these representations.

## Network-associated types

`Provider<N>` is generic over a `Network`. The network chooses the transaction type, envelope,
receipt, header, request, and RPC response types used by provider methods. Ethereum is the default.

Use:

- `Ethereum` for Ethereum execution-layer responses;
- a chain-specific implementation such as `op-alloy` for a supported ecosystem with extra
  transaction or receipt variants;
- `AnyNetwork` when consuming heterogeneous responses and the catch-all representation is
  acceptable;
- a custom `Network` implementation when a library owns a distinct typed protocol surface.

Choosing `Ethereum` for a chain with extra transaction variants can fail deserialization. See
[interacting with multiple networks](/guides/interacting-with-multiple-networks) and the
[`AnyNetwork` example](/examples/advanced/any_network).

## EIP modules

`alloy-eips` collects protocol structures and behavior that are shared across consensus, provider,
and RPC crates. Support for a type does not imply that the connected chain has activated that EIP.
Fork activation and RPC availability remain network and node concerns.

Examples include block identifiers and tags, typed envelope encodings, access lists,
authorizations, blob sidecars, requests, and hardfork-related structures. Consult the
[`alloy-eips` module list](https://docs.rs/alloy-eips/latest/alloy_eips/) for the exact release.

## Genesis and trie data

Use `alloy-genesis` for execution genesis configuration and account allocations. Genesis formats
can contain client extensions, so preserve unknown or chain-specific fields when round-tripping a
configuration.

Use `alloy-trie` for Merkle-Patricia Trie roots and proofs. Trie APIs generally require keys and
updates in the documented order; incorrect ordering can produce a different root rather than a
helpful RPC error. Treat proof verification input as untrusted data and validate the expected root.

These families are optional `genesis` and `trie` features on the meta-crate and are also available
as direct dependencies for infrastructure libraries.

## Serialization

Ethereum JSON-RPC quantities, fixed bytes, byte strings, and nullability do not follow ordinary
human-readable JSON conventions. Prefer the provided RPC and serde helper types over custom
hex-string logic.

Enable `serde` for serde implementations and helpers. Compatibility formats such as
`serde-bincode-compat` are opt-in; use the documented compatibility wrapper rather than assuming a
type's normal serde representation is stable for non-self-describing storage.

For persistent data:

1. Choose whether the stored form is consensus, RPC-enriched, or application-specific.
2. Version the schema independently of the Rust type name.
3. Test round trips across dependency upgrades.
4. Do not use debug output as a data format.

## Constrained and `no_std` users

The network-facing meta-crate primarily targets `std`. Some core and protocol crates support
`no_std` with default features disabled. Depend on the narrow crate directly, inspect its own
feature list, and compile the exact target. See [feature flags](/reference/feature-flags).

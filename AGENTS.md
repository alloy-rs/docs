# Alloy documentation agent guide

## Scope and source of truth

- Hand-written pages live in `vocs/docs/pages`; primary navigation lives in `vocs/sidebar.ts`.
- `vocs/versions.ts` is the single version source for hand-written dependency snippets.
- Generated example pages and snippets come from `alloy-rs/examples`. Do not edit files carrying a
  `DO NOT EDIT` header; update the source example or template and run `scripts/update.sh`.
- Set `EXAMPLES_SOURCE` to an absolute local examples checkout when validating a stacked examples
  change before it lands on the default branch.
- Verify exact Alloy symbols and feature gates against the matching release on docs.rs or the
  `alloy-rs/alloy` source. The website is explanatory documentation, not the API definition.

## Content rules

- Use task-oriented titles and frontmatter descriptions containing the terms a reader will search.
- State required Cargo features, environment variables, node capabilities, and external binaries.
- Use `RPC_URL`, `WS_URL`, and `IPC_PATH` instead of shared endpoints or credentials.
- Link concepts to a runnable example and exact API documentation where possible.
- Distinguish primitives, consensus types, RPC types, and network-associated types.
- Keep internal links root-relative; use absolute URLs for other repositories and sites.

## Validation

Run from the repository root:

```sh
bun scripts/check-versions.ts
bun scripts/check-docs.ts
actionlint
shellcheck scripts/update.sh
cd vocs && bun install --frozen-lockfile && bun run build
```

The build post-processes `llms.txt`, `llms-full.txt`, and `agent-index.json`. Confirm all three exist
under `vocs/dist/public`. Compile new Rust snippets against the documented Alloy release; rendering
Markdown is not proof that a snippet compiles.

## Agent retrieval artifacts

- `https://alloy.rs/agent-index.json`: versioned page inventory and task-to-page map.
- `https://alloy.rs/llms.txt`: compact page inventory.
- `https://alloy.rs/llms-full.txt`: complete corpus; use only when page retrieval is unavailable.
- `https://github.com/alloy-rs/examples/blob/main/examples-index.json`: runnable example metadata once
  the corresponding examples catalog change is available on the default branch.

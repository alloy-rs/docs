// Consists of the sidebar items for examples
import { SidebarItem } from "vocs";

export const exampleItems: SidebarItem[] = [
  {
    text: 'Advanced', collapsed: true, link: '/examples/advanced/README', items: [
      { text: 'Any Network', link: '/examples/advanced/any_network' },
      { text: 'Decoding JSON ABI', link: '/examples/advanced/decoding_json_abi' },
      { text: 'Encoding Dynamic ABI', link: '/examples/advanced/encoding_dyn_abi' },
      { text: 'Encoding SOL Static', link: '/examples/advanced/encoding_sol_static' },
      { text: 'Foundry Fork DB', link: '/examples/advanced/foundry_fork_db' },
      { text: 'Reth DB Layer', link: '/examples/advanced/reth_db_layer' },
      { text: 'Reth DB Provider', link: '/examples/advanced/reth_db_provider' }
    ]
  },
  {
    text: 'ENS', collapsed: true, link: '/examples/ens/README', items: [
      { text: 'Address Lookup', link: '/examples/ens/address_lookup' },
      { text: 'Name Resolution', link: '/examples/ens/name_resolution' }
    ]
  },

  {
    text: 'Big Numbers', collapsed: true, link: '/examples/big-numbers/README', items: [
      { text: 'Comparison & Equivalence', link: '/examples/big-numbers/comparison_equivalence' },
      { text: 'Conversion', link: '/examples/big-numbers/conversion' },
      { text: 'Create Instances', link: '/examples/big-numbers/create_instances' },
      { text: 'Math Operations', link: '/examples/big-numbers/math_operations' },
      { text: 'Math Utilities', link: '/examples/big-numbers/math_utilities' }
    ]
  },
  {
    text: 'Comparison', collapsed: true, link: '/examples/comparison/README', items: [
      { text: 'Compare New Heads', link: '/examples/comparison/compare_new_heads' },
      { text: 'Compare Pending Transactions', link: '/examples/comparison/compare_pending_txs' }
    ]
  },
  {
    text: 'Contracts', collapsed: true, link: '/examples/contracts/README', items: [
      { text: 'Deploy and Link Library', link: '/examples/contracts/deploy_and_link_library' },
      { text: 'Deploy From Artifact', link: '/examples/contracts/deploy_from_artifact' },
      { text: 'Deploy From Bytecode', link: '/examples/contracts/deploy_from_bytecode' },
      { text: 'Deploy From Contract', link: '/examples/contracts/deploy_from_contract' },
      { text: 'Interact with ABI', link: '/examples/contracts/interact_with_abi' },
      { text: 'Interact with Contract Instance', link: '/examples/contracts/interact_with_contract_instance' },
      { text: 'JSON-RPC Error Decoding', link: '/examples/contracts/jsonrpc_error_decoding' },
      { text: 'Revert Decoding', link: '/examples/contracts/revert_decoding' },
      { text: 'Unknown Return Types', link: '/examples/contracts/unknown_return_types' }
    ]
  },
  {
    text: 'Fillers', collapsed: true, link: '/examples/fillers/README', items: [
      { text: 'Gas Filler', link: '/examples/fillers/gas_filler' },
      { text: 'Nonce Filler', link: '/examples/fillers/nonce_filler' },
      { text: 'Recommended Fillers', link: '/examples/fillers/recommended_fillers' },
      { text: 'Wallet Filler', link: '/examples/fillers/wallet_filler' }
    ]
  },
  {
    text: 'Layers', collapsed: true, link: '/examples/layers/README', items: [
      { text: 'Fallback Layer', link: '/examples/layers/fallback_layer' },
      { text: 'Hyper HTTP Layer', link: '/examples/layers/hyper_http_layer' },
      { text: 'Logging Layer', link: '/examples/layers/logging_layer' },
      { text: 'Retry Layer', link: '/examples/layers/retry_layer' }
    ]
  },
  {
    text: 'Node Bindings', collapsed: true, link: '/examples/node-bindings/README', items: [
      { text: 'Anvil Deploy Contract', link: '/examples/node-bindings/anvil_deploy_contract' },
      { text: 'Anvil Fork Instance', link: '/examples/node-bindings/anvil_fork_instance' },
      { text: 'Anvil Fork Provider', link: '/examples/node-bindings/anvil_fork_provider' },
      { text: 'Anvil Local Instance', link: '/examples/node-bindings/anvil_local_instance' },
      { text: 'Anvil Local Provider', link: '/examples/node-bindings/anvil_local_provider' },
      { text: 'Anvil Set Storage At', link: '/examples/node-bindings/anvil_set_storage_at' },
      { text: 'Geth Local Instance', link: '/examples/node-bindings/geth_local_instance' },
      { text: 'Reth Local Instance', link: '/examples/node-bindings/reth_local_instance' }
    ]
  },
  {
    text: 'Primitives', collapsed: true, link: '/examples/primitives/README', items: [
      { text: 'Bytes and Address Types', link: '/examples/primitives/bytes_and_address_types' },
      { text: 'Hashing Functions', link: '/examples/primitives/hashing_functions' }
    ]
  },
  {
    text: 'Providers', collapsed: true, link: '/examples/providers/README', items: [
      { text: 'Batch RPC', link: '/examples/providers/batch_rpc' },
      { text: 'Builder', link: '/examples/providers/builder' },
      { text: 'Built-in', link: '/examples/providers/builtin' },
      { text: 'Dynamic Provider', link: '/examples/providers/dyn_provider' },
      { text: 'HTTP', link: '/examples/providers/http' },
      { text: 'HTTP with Auth', link: '/examples/providers/http_with_auth' },
      { text: 'IPC', link: '/examples/providers/ipc' },
      { text: 'Mocking', link: '/examples/providers/mocking' },
      { text: 'Multicall', link: '/examples/providers/multicall' },
      { text: 'Multicall Batching', link: '/examples/providers/multicall_batching' },
      { text: 'WebSocket', link: '/examples/providers/ws' },
      { text: 'WebSocket with Auth', link: '/examples/providers/ws_with_auth' },
      { text: 'Wrapped Provider', link: '/examples/providers/wrapped_provider' }
    ]
  },
  {
    text: 'Queries', collapsed: true, link: '/examples/queries/README', items: [
      { text: 'Query Contract Storage', link: '/examples/queries/query_contract_storage' },
      { text: 'Query Deployed Bytecode', link: '/examples/queries/query_deployed_bytecode' },
      { text: 'Query Logs', link: '/examples/queries/query_logs' }
    ]
  },
  {
    text: 'Sol Macro', collapsed: true, link: '/examples/sol-macro/README', items: [
      { text: 'Contract', link: '/examples/sol-macro/contract' },
      { text: 'All Derives', link: '/examples/sol-macro/all_derives' },
      { text: 'Decode Returns', link: '/examples/sol-macro/decode_returns' },
      { text: 'Events & Errors', link: '/examples/sol-macro/events_errors' },
      { text: 'Extra Derives', link: '/examples/sol-macro/extra_derives' },
      { text: 'Structs & Enums', link: '/examples/sol-macro/structs_enums' },
      { text: 'User Defined Types', link: '/examples/sol-macro/user_defined_types' }
    ]
  },
  {
    text: 'Subscriptions', collapsed: true, link: '/examples/subscriptions/README', items: [
      { text: 'Event Multiplexer', link: '/examples/subscriptions/event_multiplexer' },
      { text: 'Poll Logs', link: '/examples/subscriptions/poll_logs' },
      { text: 'Subscribe All Logs', link: '/examples/subscriptions/subscribe_all_logs' },
      { text: 'Subscribe Blocks', link: '/examples/subscriptions/subscribe_blocks' },
      { text: 'Subscribe Logs', link: '/examples/subscriptions/subscribe_logs' },
      { text: 'Subscribe Pending Transactions', link: '/examples/subscriptions/subscribe_pending_transactions' }
    ]
  },
  {
    text: 'Transactions', collapsed: true, link: '/examples/transactions/README', items: [
      { text: 'Debug Trace Call Many', link: '/examples/transactions/debug_trace_call_many' },
      { text: 'Decode Input', link: '/examples/transactions/decode_input' },
      { text: 'Decode Receipt Log', link: '/examples/transactions/decode_receipt_log' },
      { text: 'Encode Decode EIP1559', link: '/examples/transactions/encode_decode_eip1559' },
      { text: 'Gas Price USD', link: '/examples/transactions/gas_price_usd' },
      { text: 'Permit2 Signature Transfer', link: '/examples/transactions/permit2_signature_transfer' },
      { text: 'Send EIP1559 Transaction', link: '/examples/transactions/send_eip1559_transaction' },
      { text: 'Send EIP4844 Transaction', link: '/examples/transactions/send_eip4844_transaction' },
      { text: 'Send EIP7702 Transaction', link: '/examples/transactions/send_eip7702_transaction' },
      { text: 'Send Legacy Transaction', link: '/examples/transactions/send_legacy_transaction' },
      { text: 'Send Private Transaction', link: '/examples/transactions/send_private_transaction' },
      { text: 'Send Raw Transaction', link: '/examples/transactions/send_raw_transaction' },
      { text: 'Trace Call', link: '/examples/transactions/trace_call' },
      { text: 'Trace Call Many', link: '/examples/transactions/trace_call_many' },
      { text: 'Trace Transaction', link: '/examples/transactions/trace_transaction' },
      { text: 'Transfer ERC20', link: '/examples/transactions/transfer_erc20' },
      { text: 'Transfer ETH', link: '/examples/transactions/transfer_eth' },
      { text: 'With Access List', link: '/examples/transactions/with_access_list' }
    ]
  },
  {
    text: 'Wallets', collapsed: true, link: '/examples/wallets/README', items: [
      { text: 'AWS Signer', link: '/examples/wallets/aws_signer' },
      { text: 'Create Keystore', link: '/examples/wallets/create_keystore' },
      { text: 'Ethereum Wallet', link: '/examples/wallets/ethereum_wallet' },
      { text: 'GCP Signer', link: '/examples/wallets/gcp_signer' },
      { text: 'Keystore Signer', link: '/examples/wallets/keystore_signer' },
      { text: 'Ledger Signer', link: '/examples/wallets/ledger_signer' },
      { text: 'Mnemonic Signer', link: '/examples/wallets/mnemonic_signer' },
      { text: 'Private Key Signer', link: '/examples/wallets/private_key_signer' },
      { text: 'Sign Message', link: '/examples/wallets/sign_message' },
      { text: 'Sign Permit Hash', link: '/examples/wallets/sign_permit_hash' },
      { text: 'Trezor Signer', link: '/examples/wallets/trezor_signer' },
      { text: 'Verify Message', link: '/examples/wallets/verify_message' },
      { text: 'Yubi Signer', link: '/examples/wallets/yubi_signer' }
    ]
  }
]

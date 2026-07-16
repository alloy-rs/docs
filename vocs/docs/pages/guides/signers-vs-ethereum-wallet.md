---
title: Signers and EthereumWallet
description: Choose an Alloy signer, register it with EthereumWallet, and connect it to a provider safely
---

# Signers and `EthereumWallet`

A signer owns or delegates access to signing material. A network wallet selects a signer for a
transaction and turns the network's unsigned transaction into a signed envelope. Keeping these
roles separate lets the same provider work with local keys, hardware devices, or remote KMS
services.

## Signer traits

The [`Signer`](https://docs.rs/alloy-signer/latest/alloy_signer/trait.Signer.html) trait signs hashes,
messages, and EIP-712 typed data. Transaction signing also uses
[`TxSigner`](https://docs.rs/alloy-network/latest/alloy_network/trait.TxSigner.html), which exposes
the signer address and signs a network transaction in place.

Most applications do not call the transaction trait directly. They put a signer in an
`EthereumWallet`, attach that wallet to `ProviderBuilder`, and let the wallet filler sign prepared
transactions.

## Available integrations

| Signer | `alloy` feature | Configuration | Runnable example |
| --- | --- | --- | --- |
| Private key | `signer-local` | key string or generated key | [Private key](/examples/wallets/private_key_signer) |
| Mnemonic | `signer-mnemonic` | phrase, derivation path, optional password | [Mnemonic](/examples/wallets/mnemonic_signer) |
| Encrypted keystore | `signer-keystore` | keystore file and password | [Create](/examples/wallets/create_keystore), [load](/examples/wallets/keystore_signer) |
| YubiHSM | `signer-yubihsm` | connector and key ID | [YubiHSM](/examples/wallets/yubi_signer) |
| AWS KMS | `signer-aws` | AWS credentials, region, key ID | [AWS](/examples/wallets/aws_signer) |
| GCP KMS | `signer-gcp` | Google credentials and KMS key version | [GCP](/examples/wallets/gcp_signer) |
| Ledger | `signer-ledger` | device transport, derivation path, chain ID | [Ledger](/examples/wallets/ledger_signer) |
| Trezor | `signer-trezor` | device transport, derivation path, chain ID | [Trezor](/examples/wallets/trezor_signer) |
| Turnkey | `signer-turnkey` | Turnkey organization, key, and API credentials | [API docs](https://docs.rs/alloy-signer-turnkey/latest/alloy_signer_turnkey/) |

`signer-local` is part of the default `essentials` set. The other integrations are opt-in. Some
local capabilities, including mnemonics and keystores, also have their own feature because they add
dependencies or platform requirements.

## Attach a signer to a provider

Read secrets from a secret manager or environment rather than source code:

```rust
use alloy::{
    network::EthereumWallet,
    providers::ProviderBuilder,
    signers::local::PrivateKeySigner,
};

# async fn run() -> Result<(), Box<dyn std::error::Error>> {
let signer: PrivateKeySigner = std::env::var("PRIVATE_KEY")?.parse()?;
let signer_address = signer.address();
let wallet = EthereumWallet::new(signer);

let rpc_url = std::env::var("RPC_URL")?;
let provider = ProviderBuilder::new()
    .wallet(wallet)
    .connect(&rpc_url)
    .await?;
# let _ = (provider, signer_address);
# Ok(())
# }
```

`ProviderBuilder::wallet(signer)` also accepts compatible signer types directly and converts them
to the network wallet. Construct `EthereumWallet` explicitly when registering more than one signer
or when wallet behavior is part of the application boundary.

## Multiple signers

`EthereumWallet::new(signer)` registers the first signer as the default. Add others with
`register_signer`; use `register_default_signer` when changing the default.

The wallet filler selects a signer as follows:

1. If a transaction has a `from` address, use the signer registered for that address.
2. Otherwise, use the default signer and populate `from` with its address.
3. Return an error if the requested address has no registered signer.

See the complete [multi-signer wallet example](/examples/wallets/ethereum_wallet), which combines a
local key, AWS KMS, and Ledger.

Prefer separate wallets or providers when accounts have different authorization, retry, audit, or
rate-limit policies. A large shared wallet can hide which external system will be contacted for a
given transaction.

## Chain ID and transaction intent

Remote and hardware signer constructors may accept a chain ID. The provider's fillers also populate
and validate transaction fields. Configure the signer and provider for the same chain, and check the
connected chain ID at startup before allowing writes.

Always review or log safe transaction intent before asking an interactive or remote signer to sign:
sender, chain ID, destination, value, method selector, gas bounds, and nonce. Never log the private
key, mnemonic, keystore password, cloud credential, or raw secrets returned by a signing service.

## Message and typed-data signing

Signing a message is not the same as signing a transaction. Use the signer methods directly for
messages and EIP-712 data, and verify with the matching recovery rules. See [sign and verify
message](/examples/wallets/sign_message) and [Permit hash signing](/examples/wallets/sign_permit_hash).

Enable the `eip712` feature when the selected signer integration requires typed-data support. Check
the concrete signer documentation because not every hardware or remote backend supports every
signing mode.

## Secret-handling checklist

- Keep development keys clearly separated from funded accounts.
- Use a secret manager or protected environment injection in production.
- Give cloud KMS identities only the key permissions they need.
- Pin the expected chain ID and verify it before signing.
- Apply human or policy approval for high-value operations.
- Zeroize or drop plaintext secret buffers as soon as practical.
- Never commit example credentials, even if an account is believed to be empty.

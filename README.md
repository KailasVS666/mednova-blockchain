
# MedNova Blockchain Project

A comprehensive suite of Hyperledger Fabric samples, smart contracts, applications, and guides for asset transfer, tokenization, auctions, private data, and more. This repository is designed to help you learn, develop, and deploy blockchain solutions using Hyperledger Fabric.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Key Features & Samples](#key-features--samples)
- [Getting Started](#getting-started)
- [Test Networks](#test-networks)
- [Tokenization](#tokenization)
- [Security & HSM](#security--hsm)
- [Contributing](#contributing)
- [License](#license)
- [References](#references)

---

## Overview

This repository provides:

- Sample smart contracts (chaincode) and client applications in Go, Java, JavaScript, and TypeScript.
- Tutorials and guides for asset transfer, private data, events, auctions, and tokens (ERC-20, ERC-721, ERC-1155, UTXO).
- Tools for running test networks (Docker Compose, Kubernetes).
- Advanced topics: Attribute-based access control, state-based endorsement, secured agreements, off-chain data, and hardware security modules.

---

## Project Structure

- `asset-transfer-basic/` — Basic asset transfer samples and REST APIs.
- `asset-transfer-private-data/` — Private data collections and transfer.
- `asset-transfer-events/` — Emitting and handling chaincode events.
- `asset-transfer-abac/` — Attribute-based access control.
- `asset-transfer-ledger-queries/` — Advanced ledger queries.
- `asset-transfer-sbe/` — State-based endorsement.
- `asset-transfer-secured-agreement/` — Secure asset transfer scenarios.
- `auction-simple/`, `auction-dutch/` — Auction smart contracts and apps.
- `token-sdk/` — REST API and SDK for privacy-friendly UTXO tokens.
- `token-erc-20/`, `token-erc-721/`, `token-erc-1155/`, `token-utxo/` — Token standards implementations.
- `hardware-security-module/` — HSM integration samples.
- `test-network/`, `test-network-k8s/` — Local and Kubernetes-based test networks.
- `full-stack-asset-transfer-guide/` — End-to-end development and deployment guide.
- `node-backend/` — Node.js backend integration example.
- `off_chain_data/` — Off-chain data and analytics integration.

---

## Key Features & Samples

- **Asset Transfer**: Create, read, update, transfer, and delete assets on the blockchain.
- **Private Data**: Secure asset data using private data collections.
- **Events**: Emit and listen to chaincode events.
- **Auctions**: Run simple and Dutch auctions with privacy features.
- **Tokenization**: Issue, transfer, and redeem tokens (ERC-20, ERC-721, ERC-1155, UTXO).
- **Security**: Integrate with Hardware Security Modules (HSM) for key management.
- **REST APIs**: Interact with the blockchain via RESTful services.
- **Kubernetes Support**: Deploy and manage networks in cloud-native environments.

---

## Getting Started

1. **Prerequisites**:  
	 - [Install Fabric prerequisites](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html)
	 - Docker, Docker Compose, Go, Node.js, Java, and (optionally) Kubernetes

2. **Clone the repository**:
	 ```sh
	 git clone https://github.com/KailasVS666/mednova-blockchain.git
	 cd mednova-blockchain
	 ```

3. **Install Fabric binaries and Docker images**:
	 ```sh
	 curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh
	 chmod +x install-fabric.sh
	 ./install-fabric.sh docker binary
	 ```

4. **Run a test network**:
	 - Docker Compose: See `test-network/README.md`
	 - Kubernetes: See `test-network-k8s/README.md`

5. **Deploy and test samples**:
	 - Follow the README in each sample directory for specific instructions.

---

## Test Networks

- **Docker Compose**:  
	Use `test-network` for local development and testing.
- **Kubernetes**:  
	Use `test-network-k8s` for cloud-native deployments and advanced scenarios.

---

## Tokenization

- **Token SDK**:  
	REST API for privacy-preserving UTXO tokens. See `token-sdk/README.md` for setup and usage.
- **ERC Standards**:  
	- ERC-20: Fungible tokens
	- ERC-721: Non-fungible tokens
	- ERC-1155: Multi-token standard

---

## Security & HSM

- **Hardware Security Module**:  
	See `hardware-security-module/README.md` for using HSMs with Fabric identities and transactions.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for guidelines. Maintainers are listed in [MAINTAINERS.md](MAINTAINERS.md).

---

## License

- Source code: [Apache 2.0](LICENSE)
- Documentation: [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/)

---

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/en/latest/)
- [Fabric Samples Tutorials](https://hyperledger-fabric.readthedocs.io/en/latest/write_first_app.html)
- [Token SDK](https://github.com/hyperledger-labs/fabric-token-sdk)

---

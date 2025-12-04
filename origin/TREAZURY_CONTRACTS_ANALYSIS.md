# Treazury Smart Contracts Analysis

## Context
Treazury is a privacy-first, non-custodial vault for USDC (or ZTK in testnet) on Ztarknet. The application leverages zero-knowledge proofs, encrypted balances, and private transfers. The original template included badge/KYC contracts, but for Treazury, the focus is on secure asset management and privacy.

## Contract Requirements
After a thorough review of the application flow, stack, and privacy goals, the following contracts are deemed necessary:

### 1. TreazuryVault (Core Vault Contract)
**Purpose:**
- Manage encrypted balances for each user.
- Enable deposit, withdrawal, and private transfer of assets.
- Support encrypted state and rollover of pending balances.
- Integrate with Tongo SDK for encryption and proof validation.

**Key Functions:**
- `deposit(amount: u256)`
- `withdraw(amount: u256)`
- `transfer(to: ContractAddress, encrypted_amount: felt252, proof: Span<felt252>)`
- `get_encrypted_balance(address: ContractAddress) -> felt252`
- `rollover_pending_balance(address: ContractAddress)`
- `set_encryption_key(address: ContractAddress, pubkey: felt252)`

**Security:**
- All balances stored as ciphertexts (ElGamal or similar).
- Proofs validated on-chain before transfers/withdrawals.
- Replay protection and double-spend prevention.
- Only owner can withdraw own funds.

### 2. Registry (Optional, for contract management)
**Purpose:**
- Store addresses of deployed contracts (vault, future upgrades).
- Facilitate contract upgrades and migration.

**Key Functions:**
- `set_contract(name: felt252, address: ContractAddress)`
- `get_contract(name: felt252) -> ContractAddress`

**Security:**
- OnlyOwner pattern for registry updates.
- Event emission for audit trail.

### 3. Badge/KYC Verifier (Not required for MVP)
**Conclusion:**
- The badge/KYC contract is not necessary for the core Treazury vault.
- Can be added later if compliance or reputation gating is required.

## Justification
- The vault contract is the heart of Treazury, enabling all privacy-preserving operations.
- Registry is optional but recommended for future-proofing and upgradeability.
- Badge/KYC is excluded for now to keep the system minimal and focused on privacy and asset management.

## Next Steps
- Implement `TreazuryVault` contract in Cairo under `zkpassport_verifier/src/treazury_vault.cairo`.
- (Optional) Implement `Registry` contract in Cairo if multi-contract management is needed.
- Document all contract interfaces and security considerations.

---

*Prepared by CTO (Blockchain & Security), December 2025.*

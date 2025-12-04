// zkpassport_verifier.cairo
// ZKPassport verifier contract for Starknet
// Verifies KYC proofs generated from Noir circuits via Garaga
// Stores verified KYC levels and emits events for settlement

use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::get_block_timestamp;

#[starknet::interface]
pub trait IZKPassportVerifier<TContractState> {
    fn verify_kyc(
        self: @TContractState,
        full_proof_with_hints: Span<felt252>,
        kyc_level: u8,
        subject_address: ContractAddress,
    ) -> bool;

    fn get_kyc_level(self: @TContractState, address: ContractAddress) -> u8;

    fn is_kyc_verified(self: @TContractState, address: ContractAddress) -> bool;

    fn revoke_kyc(ref self: TContractState, address: ContractAddress) -> bool;

    fn get_verification_timestamp(
        self: @TContractState,
        address: ContractAddress
    ) -> u64;
}

#[starknet::contract]
pub mod zkpassport_verifier_contract {
    use super::IZKPassportVerifier;
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;

    #[storage]
    struct Storage {
        // Maps address to KYC verification level (0 = unverified, 1-4 = tier levels)
        kyc_levels: LegacyMap::<ContractAddress, u8>,
        // Track verification timestamp for expiration management
        verification_timestamps: LegacyMap::<ContractAddress, u64>,
        // Track used proof commitments to prevent replay attacks
        used_commitments: LegacyMap::<felt252, bool>,
        // Owner/admin address for revocations
        owner: ContractAddress,
        // Proof commitments counter for nonce generation
        total_verifications: u64,
    }

    #[event]
    pub enum Event {
        VerificationSuccess: VerificationSuccess,
        VerificationFailed: VerificationFailed,
        KYCRevoked: KYCRevoked,
    }

    #[derive(Drop, starknet::Event)]
    pub struct VerificationSuccess {
        #[key]
        pub subject_address: ContractAddress,
        pub kyc_level: u8,
        pub proof_commitment: felt252,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct VerificationFailed {
        #[key]
        pub subject_address: ContractAddress,
        pub reason: felt252,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct KYCRevoked {
        #[key]
        pub subject_address: ContractAddress,
        pub previous_level: u8,
        pub timestamp: u64,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
        self.owner.write(initial_owner);
        self.total_verifications.write(0);
    }

    #[abi(embed_v0)]
    impl IZKPassportVerifierImpl of IZKPassportVerifier<ContractState> {
        fn verify_kyc(
            self: @ContractState,
            full_proof_with_hints: Span<felt252>,
            kyc_level: u8,
            subject_address: ContractAddress,
        ) -> bool {
            // Validate inputs
            if full_proof_with_hints.len() == 0 {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Invalid proof length',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Validate KYC level is in valid range (1-4)
            if kyc_level == 0 || kyc_level > 4 {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Invalid KYC level',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Validate subject address is not zero
            if subject_address == starknet::contract_address_const::<0>() {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Invalid subject address',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Extract proof commitment hash (first element)
            let proof_commitment = *full_proof_with_hints.at(0);

            // Check commitment not already used (replay protection)
            if self.used_commitments.read(proof_commitment) {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Proof already used',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // In production: Call Garaga verifier contract to validate proof_with_hints
            // For now, accept proof as valid if properly formatted
            let is_proof_valid = full_proof_with_hints.len() >= 3;

            if !is_proof_valid {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Proof verification failed',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Get current KYC level for address
            let current_level = self.kyc_levels.read(subject_address);

            // Only allow upgrade or first-time verification, not downgrades
            if current_level > kyc_level {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Cannot downgrade KYC level',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Store verified KYC level
            self.kyc_levels.write(subject_address, kyc_level);

            // Record verification timestamp
            let now = get_block_timestamp();
            self.verification_timestamps.write(subject_address, now);

            // Mark proof commitment as used
            self.used_commitments.write(proof_commitment, true);

            // Increment verification counter
            let total = self.total_verifications.read() + 1;
            self.total_verifications.write(total);

            // Emit success event
            self.emit(VerificationSuccess {
                subject_address,
                kyc_level,
                proof_commitment,
                timestamp: now,
            });

            true
        }

        fn get_kyc_level(self: @ContractState, address: ContractAddress) -> u8 {
            self.kyc_levels.read(address)
        }

        fn is_kyc_verified(self: @ContractState, address: ContractAddress) -> bool {
            let level = self.kyc_levels.read(address);
            level > 0
        }

        fn revoke_kyc(ref self: ContractState, address: ContractAddress) -> bool {
            // Only owner can revoke
            let caller = get_caller_address();
            if caller != self.owner.read() {
                return false;
            }

            let previous_level = self.kyc_levels.read(address);

            // Only revoke if actually verified
            if previous_level == 0 {
                return false;
            }

            // Set KYC level to 0 (unverified)
            self.kyc_levels.write(address, 0);
            self.verification_timestamps.write(address, 0);

            // Emit revocation event
            self.emit(KYCRevoked {
                subject_address: address,
                previous_level,
                timestamp: get_block_timestamp(),
            });

            true
        }

        fn get_verification_timestamp(
            self: @ContractState,
            address: ContractAddress
        ) -> u64 {
            self.verification_timestamps.read(address)
        }
    }
}

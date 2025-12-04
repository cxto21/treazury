// zkpassport_verifier.cairo
// ZKPassport verifier contract for Starknet
// Verifies KYC proofs generated from Noir circuits via Garaga
// Stores verified KYC levels and emits events for settlement
// Validates MRZ (Machine Readable Zone) data integrity

use starknet::ContractAddress;
use starknet::get_caller_address;
use starknet::get_block_timestamp;

// Constants for KYC levels
const KYC_LEVEL_NONE: u8 = 0;
const KYC_LEVEL_BASIC: u8 = 1;
const KYC_LEVEL_ENHANCED: u8 = 2;
const KYC_LEVEL_PREMIUM: u8 = 3;

// Constants for document types
const DOC_TYPE_PASSPORT: u8 = 0;
const DOC_TYPE_ID_CARD: u8 = 1;
const DOC_TYPE_TRAVEL_DOC: u8 = 2;

#[starknet::interface]
pub trait IZKPassportVerifier<TContractState> {
    fn verify_kyc(
        self: @TContractState,
        full_proof_with_hints: Span<felt252>,
        public_inputs: Span<felt252>,
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
    
    fn validate_mrz_data(
        self: @TContractState,
        nationality_hash: felt252,
        dob_hash: felt252,
        doc_hash: felt252,
        document_type: u8,
    ) -> bool;
}

#[starknet::contract]
pub mod zkpassport_verifier_contract {
    use super::IZKPassportVerifier;
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::get_block_timestamp;
    use starknet::storage::Map;

    #[storage]
    struct Storage {
        // Maps address to KYC verification level (0 = unverified, 1-3 = tier levels)
        kyc_levels: Map::<ContractAddress, u8>,
        // Track verification timestamp for expiration management
        verification_timestamps: Map::<ContractAddress, u64>,
        // Store hashes for verification records
        nationality_hashes: Map::<ContractAddress, felt252>,
        dob_hashes: Map::<ContractAddress, felt252>,
        doc_hashes: Map::<ContractAddress, felt252>,
        // Track used proof commitments to prevent replay attacks
        used_commitments: Map::<felt252, bool>,
        // Owner/admin address for revocations
        owner: ContractAddress,
        // Proof commitments counter for nonce generation
        total_verifications: u64,
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
            public_inputs: Span<felt252>,
            kyc_level: u8,
            subject_address: ContractAddress,
        ) -> bool {
            // ========== INPUT VALIDATION ==========
            
            // Validate proof is not empty
            if full_proof_with_hints.len() == 0 {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Invalid proof length',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Validate public inputs present (nationality_hash, dob_hash, doc_hash)
            if public_inputs.len() < 3 {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Missing public inputs',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Validate KYC level is in valid range (1-3)
            if kyc_level == 0 || kyc_level > 3 {
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

            // ========== PROOF VERIFICATION ==========
            
            // Extract proof commitment (first element)
            let proof_commitment = *full_proof_with_hints.at(0);

            // Check replay protection: commitment must not be used
            if self.used_commitments.read(proof_commitment) {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Proof already used (replay)',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // In production: Call Garaga verifier contract to cryptographically verify proof
            // For now: Accept proof if properly formatted (minimum elements)
            let is_proof_valid = full_proof_with_hints.len() >= 3;

            if !is_proof_valid {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Proof verification failed',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // ========== MRZ VALIDATION ==========
            
            // Extract hashes from public inputs
            let nationality_hash = *public_inputs.at(0);
            let dob_hash = *public_inputs.at(1);
            let doc_hash = *public_inputs.at(2);

            // Validate MRZ data consistency
            if !self.validate_mrz_data(nationality_hash, dob_hash, doc_hash, 0) {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'MRZ validation failed',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // ========== KYC LEVEL STORAGE ==========
            
            // Get current KYC level
            let current_level = self.kyc_levels.read(subject_address);

            // Only allow upgrade or first-time, no downgrades
            if current_level > kyc_level {
                self.emit(VerificationFailed {
                    subject_address,
                    reason: 'Cannot downgrade KYC level',
                    timestamp: get_block_timestamp(),
                });
                return false;
            }

            // Store KYC level
            self.kyc_levels.write(subject_address, kyc_level);

            // Store hashes for verification records
            self.nationality_hashes.write(subject_address, nationality_hash);
            self.dob_hashes.write(subject_address, dob_hash);
            self.doc_hashes.write(subject_address, doc_hash);

            // Record timestamp
            let now = get_block_timestamp();
            self.verification_timestamps.write(subject_address, now);

            // ========== REPLAY PROTECTION ==========
            
            // Mark proof as used
            self.used_commitments.write(proof_commitment, true);

            // Increment counter
            let _total = self.total_verifications.read() + 1;
            self.total_verifications.write(_total);

            // ========== EMIT SUCCESS EVENT ==========
            
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

        fn validate_mrz_data(
            self: @ContractState,
            nationality_hash: felt252,
            dob_hash: felt252,
            doc_hash: felt252,
            document_type: u8,
        ) -> bool {
            // Validate MRZ field hashes
            
            // Check all hashes are non-zero
            if nationality_hash == 0 || dob_hash == 0 || doc_hash == 0 {
                return false;
            }
            
            // Validate document type
            if document_type > 2 {
                return false;
            }
            
            // In production: Validate against known good hash values
            // For now: Accept any non-zero hash
            
            true
        }
    }
}

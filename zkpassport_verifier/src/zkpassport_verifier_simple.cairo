// zkpassport_verifier_simple.cairo
// Simplified ZKPassport verifier contract for Starknet

use starknet::ContractAddress;
use starknet::get_block_timestamp;

// Constants for KYC levels
const KYC_LEVEL_NONE: u8 = 0;
const KYC_LEVEL_BASIC: u8 = 1;
const KYC_LEVEL_ENHANCED: u8 = 2;
const KYC_LEVEL_PREMIUM: u8 = 3;

#[starknet::interface]
pub trait IZKPassportVerifier<TContractState> {
    fn verify_kyc(
        self: @TContractState,
        subject_address: ContractAddress,
        kyc_level: u8,
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
    use starknet::get_block_timestamp;
    use starknet::storage::Map;

    #[storage]
    struct Storage {
        kyc_levels: Map::<ContractAddress, u8>,
        verification_timestamps: Map::<ContractAddress, u64>,
        owner: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
        self.owner.write(initial_owner);
    }

    #[abi(embed_v0)]
    impl IZKPassportVerifierImpl of IZKPassportVerifier<ContractState> {
        fn verify_kyc(
            self: @ContractState,
            subject_address: ContractAddress,
            kyc_level: u8,
        ) -> bool {
            // Validate KYC level is in valid range (1-3)
            if kyc_level == 0 || kyc_level > 3 {
                return false;
            }

            // Validate subject address is not zero
            if subject_address == starknet::contract_address_const::<0>() {
                return false;
            }

            // Get current KYC level
            let current_level = self.kyc_levels.read(subject_address);

            // Only allow upgrade, no downgrades
            if current_level > kyc_level {
                return false;
            }

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
            let previous_level = self.kyc_levels.read(address);

            // Only revoke if actually verified
            if previous_level == 0 {
                return false;
            }

            // Set KYC level to 0 (unverified)
            self.kyc_levels.write(address, 0);
            self.verification_timestamps.write(address, 0);

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

// zkpassport_verifier.cairo
// Interfaz mínima del verificador de KYC con `verify_kyc`

%lang starknet

use starknet::ContractAddress;

#[starknet::interface]
trait IZKPassportVerifier<TContractState> {
    fn verify_kyc(
        self: @TContractState,
        full_proof_with_hints: Span<felt252>,
        kyc_level: u8,
        subject_address: ContractAddress,
    ) -> bool;
}

#[starknet::contract]
mod zkpassport_verifier_contract {
    use super::IZKPassportVerifier;
    use starknet::ContractAddress;

    #[starknet::storage]
    struct Storage {
        kyc_levels: LegacyMap::<ContractAddress, u8>,
    }

    #[starknet::abi]
    impl IZKPassportVerifierImpl of IZKPassportVerifier<ContractState> {
        fn verify_kyc(
            self: @ContractState,
            full_proof_with_hints: Span<felt252>,
            kyc_level: u8,
            subject_address: ContractAddress,
        ) -> bool {
            // TODO: Integrar verificación Garaga/Noir.
            // Por ahora, placeholder que devuelve false.
            let _ = full_proof_with_hints;
            let _ = kyc_level;
            let _ = subject_address;
            return false;
        }
    }
}

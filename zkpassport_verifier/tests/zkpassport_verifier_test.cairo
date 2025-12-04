// zkpassport_verifier tests (snforge scaffold)

%lang starknet

use zkpassport_verifier::zkpassport_verifier_contract;

#[starknet::test]
fn test_verify_kyc_placeholder() {
    // Arrange: deploy contract
    let (contract_address, _contract) = zkpassport_verifier_contract::deploy();
    let proof: Array::<felt252> = Array::new();
    let kyc_level: u8 = 1_u8;

    // Act: call verify_kyc (placeholder returns false)
    let res = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        contract_address,
        proof.span(),
        kyc_level,
        contract_address,
    );

    // Assert
    assert(res == false, 'placeholder should be false');
}

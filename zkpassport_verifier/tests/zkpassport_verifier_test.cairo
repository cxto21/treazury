// zkpassport_verifier_test.cairo
// Starknet Foundry tests for KYC verifier contract
// Tests proof verification, storage, events, and edge cases

use zkpassport_verifier::zkpassport_verifier_contract;
use starknet::contract_address_const;
use starknet::testing::{pop_log, set_block_timestamp};

#[starknet::test]
fn test_verify_kyc_with_valid_proof_tier_1() {
    let (contract_address, mut state) = setup();

    // Create valid proof with 3+ elements
    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0x123_felt252); // proof commitment
    proof.append(0x456_felt252); // public input 1
    proof.append(0x789_felt252); // public input 2

    let subject: ContractAddress = contract_address_const::<0x1234>();

    // Verify KYC level 1
    let result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        1,
        subject,
    );

    assert(result == true, 'KYC verification should succeed');

    // Check storage was updated
    let stored_level = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_kyc_level(
        @state,
        subject,
    );
    assert(stored_level == 1, 'KYC level should be 1');
}

#[starknet::test]
fn test_verify_kyc_with_valid_proof_tier_2() {
    let (contract_address, mut state) = setup();

    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0xabcdef_felt252);
    proof.append(0x111111_felt252);
    proof.append(0x222222_felt252);

    let subject: ContractAddress = contract_address_const::<0x5678>();

    // Verify with higher KYC tier
    let result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        2,
        subject,
    );

    assert(result == true, 'Tier 2 verification should succeed');

    let stored_level = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_kyc_level(
        @state,
        subject,
    );
    assert(stored_level == 2, 'KYC level should be 2');
}

#[starknet::test]
fn test_verify_kyc_rejects_empty_proof() {
    let (contract_address, state) = setup();

    let proof: Array<felt252> = ArrayTrait::new(); // Empty proof
    let subject: ContractAddress = contract_address_const::<0x9999>();

    let result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        1,
        subject,
    );

    assert(result == false, 'Empty proof should fail');
}

#[starknet::test]
fn test_verify_kyc_rejects_invalid_kyc_level_0() {
    let (contract_address, state) = setup();

    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0x123_felt252);
    proof.append(0x456_felt252);
    proof.append(0x789_felt252);

    let subject: ContractAddress = contract_address_const::<0xaaaa>();

    // KYC level 0 (unverified) is invalid
    let result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        0,
        subject,
    );

    assert(result == false, 'Level 0 should fail');
}

#[starknet::test]
fn test_verify_kyc_rejects_invalid_kyc_level_5() {
    let (contract_address, state) = setup();

    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0x123_felt252);
    proof.append(0x456_felt252);
    proof.append(0x789_felt252);

    let subject: ContractAddress = contract_address_const::<0xbbbb>();

    // KYC level > 4 is invalid
    let result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        5,
        subject,
    );

    assert(result == false, 'Level 5 should fail');
}

#[starknet::test]
fn test_verify_kyc_rejects_zero_address() {
    let (contract_address, state) = setup();

    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0x123_felt252);
    proof.append(0x456_felt252);
    proof.append(0x789_felt252);

    let zero_address: ContractAddress = contract_address_const::<0x0>();

    let result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        1,
        zero_address,
    );

    assert(result == false, 'Zero address should fail');
}

#[starknet::test]
fn test_verify_kyc_replay_protection() {
    let (contract_address, mut state) = setup();

    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0xdeadbeef_felt252); // Same commitment
    proof.append(0x111111_felt252);
    proof.append(0x222222_felt252);

    let subject1: ContractAddress = contract_address_const::<0x1111>();
    let subject2: ContractAddress = contract_address_const::<0x2222>();

    // First verification succeeds
    let result1 = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        1,
        subject1,
    );
    assert(result1 == true, 'First verification should succeed');

    // Second verification with same proof commitment should fail (replay protection)
    let result2 = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        1,
        subject2,
    );
    assert(result2 == false, 'Replay should be prevented');
}

#[starknet::test]
fn test_verify_kyc_prevents_downgrade() {
    let (contract_address, mut state) = setup();

    let subject: ContractAddress = contract_address_const::<0x3333>();

    // First: Verify with Level 3
    let mut proof1: Array<felt252> = ArrayTrait::new();
    proof1.append(0x111_felt252);
    proof1.append(0x222_felt252);
    proof1.append(0x333_felt252);

    let result1 = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof1.span(),
        3,
        subject,
    );
    assert(result1 == true, 'Level 3 verification should succeed');

    // Attempt: Downgrade to Level 2 with different proof
    let mut proof2: Array<felt252> = ArrayTrait::new();
    proof2.append(0x444_felt252);
    proof2.append(0x555_felt252);
    proof2.append(0x666_felt252);

    let result2 = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof2.span(),
        2,
        subject,
    );
    assert(result2 == false, 'Downgrade should fail');

    // Verify level remains at 3
    let final_level = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_kyc_level(
        @state,
        subject,
    );
    assert(final_level == 3, 'Level should remain 3');
}

#[starknet::test]
fn test_verify_kyc_allows_upgrade() {
    let (contract_address, mut state) = setup();

    let subject: ContractAddress = contract_address_const::<0x4444>();

    // First: Verify with Level 1
    let mut proof1: Array<felt252> = ArrayTrait::new();
    proof1.append(0xaaa_felt252);
    proof1.append(0xbbb_felt252);
    proof1.append(0xccc_felt252);

    let result1 = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof1.span(),
        1,
        subject,
    );
    assert(result1 == true, 'Level 1 verification should succeed');

    // Second: Upgrade to Level 2 with different proof
    let mut proof2: Array<felt252> = ArrayTrait::new();
    proof2.append(0xddd_felt252);
    proof2.append(0xeee_felt252);
    proof2.append(0xfff_felt252);

    let result2 = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof2.span(),
        2,
        subject,
    );
    assert(result2 == true, 'Upgrade to Level 2 should succeed');

    // Verify level is now 2
    let final_level = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_kyc_level(
        @state,
        subject,
    );
    assert(final_level == 2, 'Level should be upgraded to 2');
}

#[starknet::test]
fn test_get_kyc_level_returns_correct_value() {
    let (contract_address, mut state) = setup();

    let subject: ContractAddress = contract_address_const::<0x5555>();

    // Initially should be 0 (unverified)
    let initial_level = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_kyc_level(
        @state,
        subject,
    );
    assert(initial_level == 0, 'Should be unverified initially');

    // Verify and check
    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0x111_felt252);
    proof.append(0x222_felt252);
    proof.append(0x333_felt252);

    let _result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        3,
        subject,
    );

    let final_level = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_kyc_level(
        @state,
        subject,
    );
    assert(final_level == 3, 'Level should be 3');
}

#[starknet::test]
fn test_is_kyc_verified() {
    let (contract_address, mut state) = setup();

    let unverified: ContractAddress = contract_address_const::<0x6666>();
    let verified: ContractAddress = contract_address_const::<0x7777>();

    // Check unverified
    let is_unverified = zkpassport_verifier_contract::IZKPassportVerifierImpl::is_kyc_verified(
        @state,
        unverified,
    );
    assert(is_unverified == false, 'Should be unverified');

    // Verify address
    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0x111_felt252);
    proof.append(0x222_felt252);
    proof.append(0x333_felt252);

    let _result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        1,
        verified,
    );

    // Check now verified
    let is_verified = zkpassport_verifier_contract::IZKPassportVerifierImpl::is_kyc_verified(
        @state,
        verified,
    );
    assert(is_verified == true, 'Should be verified');
}

#[starknet::test]
fn test_get_verification_timestamp() {
    let (contract_address, mut state) = setup();

    let subject: ContractAddress = contract_address_const::<0x8888>();

    // Set block timestamp
    set_block_timestamp(1700000000);

    // Initially should be 0
    let initial_ts = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_verification_timestamp(
        @state,
        subject,
    );
    assert(initial_ts == 0, 'Initial timestamp should be 0');

    // Verify
    let mut proof: Array<felt252> = ArrayTrait::new();
    proof.append(0x111_felt252);
    proof.append(0x222_felt252);
    proof.append(0x333_felt252);

    let _result = zkpassport_verifier_contract::IZKPassportVerifierImpl::verify_kyc(
        @state,
        proof.span(),
        1,
        subject,
    );

    // Check timestamp was recorded
    let recorded_ts = zkpassport_verifier_contract::IZKPassportVerifierImpl::get_verification_timestamp(
        @state,
        subject,
    );
    assert(recorded_ts == 1700000000, 'Timestamp should be recorded');
}

fn setup() -> (ContractAddress, zkpassport_verifier_contract::ContractState) {
    // Deploy contract
    let owner: ContractAddress = contract_address_const::<0xdeadbeef>();
    let contract = zkpassport_verifier_contract::contract_state_for_testing();
    
    contract
}

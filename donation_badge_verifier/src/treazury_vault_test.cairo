// Tests for TreazuryVault
// Following Ztarknet quickstart best practices

#[cfg(test)]
mod tests {
    use zkpassport_verifier::treazury_vault::TreazuryVault;
    use zkpassport_verifier::treazury_vault::{
        TreazuryVault::DepositEvent, TreazuryVault::WithdrawEvent, 
        TreazuryVault::TransferEvent, TreazuryVault::RolloverEvent,
        TreazuryVault::KeySetEvent
    };
    use starknet::{ContractAddress, contract_address_const};
    use starknet::testing::{set_caller_address, set_contract_address};
    use core::array::{Array, ArrayTrait};
    use core::integer::u256;

    // Test addresses
    const USER1: felt252 = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
    const USER2: felt252 = 0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321;
    const VAULT_ADDRESS: felt252 = 0x100;

    fn user1_address() -> ContractAddress {
        contract_address_const::<USER1>()
    }

    fn user2_address() -> ContractAddress {
        contract_address_const::<USER2>()
    }

    fn vault_address() -> ContractAddress {
        contract_address_const::<VAULT_ADDRESS>()
    }

    #[test]
    fn test_set_encryption_key() {
        let mut state = TreazuryVault::contract_state_for_testing();
        set_caller_address(user1_address());

        let pubkey: felt252 = 0x42;
        state.set_encryption_key(pubkey);

        let stored_key = state.encryption_keys.read(user1_address());
        assert(stored_key == pubkey, 'Key not set correctly');
    }

    #[test]
    fn test_deposit() {
        let mut state = TreazuryVault::contract_state_for_testing();
        set_caller_address(user1_address());

        let encrypted_amount: felt252 = 0xaabbccdd;
        let amount: u256 = u256 { low: 1000, high: 0 };
        
        state.deposit(encrypted_amount, amount);

        let balance = state.get_encrypted_balance(user1_address());
        assert(balance == encrypted_amount, 'Deposit failed');
    }

    #[test]
    fn test_withdraw() {
        let mut state = TreazuryVault::contract_state_for_testing();
        set_caller_address(user1_address());

        let encrypted_amount: felt252 = 0xaabbccdd;
        let amount: u256 = u256 { low: 1000, high: 0 };
        
        // First deposit
        state.deposit(encrypted_amount, amount);
        
        // Then withdraw
        let mut proof_array = ArrayTrait::new();
        proof_array.append(0x1);
        proof_array.append(0x2);
        
        state.withdraw(proof_array.span(), amount);

        let balance = state.get_encrypted_balance(user1_address());
        assert(balance == 0, 'Withdraw failed');
    }

    #[test]
    fn test_transfer() {
        let mut state = TreazuryVault::contract_state_for_testing();
        set_caller_address(user1_address());

        let encrypted_amount: felt252 = 0xaabbccdd;
        let amount: u256 = u256 { low: 1000, high: 0 };
        
        // User1 deposits
        state.deposit(encrypted_amount, amount);

        // User1 transfers to User2
        let mut proof_array = ArrayTrait::new();
        proof_array.append(0x1);
        proof_array.append(0x2);
        proof_array.append(0x3);
        
        state.transfer(user2_address(), encrypted_amount, proof_array.span());

        let user1_balance = state.get_encrypted_balance(user1_address());
        let user2_balance = state.get_encrypted_balance(user2_address());
        
        assert(user1_balance == 0, 'User1 balance should be 0');
        assert(user2_balance == encrypted_amount, 'User2 balance incorrect');
    }

    #[test]
    fn test_rollover_pending_balance() {
        let mut state = TreazuryVault::contract_state_for_testing();
        set_caller_address(user1_address());

        let pending_amount: felt252 = 0x12345678;
        
        // Manually set pending balance (in real scenario, this comes from transfer logic)
        state.pending_balances.write(user1_address(), pending_amount);

        // Rollover
        state.rollover_pending_balance();

        let current_balance = state.get_encrypted_balance(user1_address());
        let new_pending = state.pending_balances.read(user1_address());
        
        assert(current_balance == pending_amount, 'Rollover failed');
        assert(new_pending == 0, 'Pending should be cleared');
    }

    #[test]
    fn test_multiple_users_independent_state() {
        let mut state = TreazuryVault::contract_state_for_testing();

        // User1 deposits
        set_caller_address(user1_address());
        let amount1: felt252 = 0xaaaa;
        state.deposit(amount1, u256 { low: 1000, high: 0 });

        // User2 deposits
        set_caller_address(user2_address());
        let amount2: felt252 = 0xbbbb;
        state.deposit(amount2, u256 { low: 2000, high: 0 });

        // Verify independent balances
        let balance1 = state.get_encrypted_balance(user1_address());
        let balance2 = state.get_encrypted_balance(user2_address());
        
        assert(balance1 == amount1, 'User1 balance incorrect');
        assert(balance2 == amount2, 'User2 balance incorrect');
    }

    #[test]
    fn test_encryption_key_per_user() {
        let mut state = TreazuryVault::contract_state_for_testing();

        // User1 sets key
        set_caller_address(user1_address());
        let key1: felt252 = 0x1111;
        state.set_encryption_key(key1);

        // User2 sets different key
        set_caller_address(user2_address());
        let key2: felt252 = 0x2222;
        state.set_encryption_key(key2);

        // Verify keys are independent
        let stored_key1 = state.encryption_keys.read(user1_address());
        let stored_key2 = state.encryption_keys.read(user2_address());
        
        assert(stored_key1 == key1, 'User1 key incorrect');
        assert(stored_key2 == key2, 'User2 key incorrect');
        assert(stored_key1 != stored_key2, 'Keys should be different');
    }

    #[test]
    fn test_zero_balance_initially() {
        let state = TreazuryVault::contract_state_for_testing();

        let balance = state.get_encrypted_balance(user1_address());
        assert(balance == 0, 'Initial balance should be 0');
    }

    #[test]
    fn test_transfer_updates_both_balances() {
        let mut state = TreazuryVault::contract_state_for_testing();

        // User1 deposits
        set_caller_address(user1_address());
        let amount: felt252 = 0xcccccccc;
        state.deposit(amount, u256 { low: 5000, high: 0 });

        // User1 transfers to User2
        let mut proof = ArrayTrial::new();
        proof.append(0x1);
        state.transfer(user2_address(), amount, proof.span());

        // Verify User1 has 0 and User2 has amount
        let user1_balance = state.get_encrypted_balance(user1_address());
        let user2_balance = state.get_encrypted_balance(user2_address());
        
        assert(user1_balance == 0, 'Sender balance should be 0');
        assert(user2_balance == amount, 'Recipient should have amount');
    }
}

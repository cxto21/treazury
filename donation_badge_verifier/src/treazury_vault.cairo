// TreazuryVault Cairo Contract
// Privacy-first encrypted vault for Ztarknet

use starknet::ContractAddress;
use core::integer::u256;
use core::array::{Span, ArrayTrait};
use starknet::storage::Map;
use starknet::get_caller_address;

#[starknet::interface]
pub trait ITreazuryVault<TContractState> {
    fn set_encryption_key(ref self: TContractState, pubkey: felt252);
    fn deposit(ref self: TContractState, encrypted_amount: felt252, amount: u256);
    fn withdraw(ref self: TContractState, proof: Span<felt252>, amount: u256);
    fn transfer(ref self: TContractState, to: ContractAddress, encrypted_amount: felt252, proof: Span<felt252>);
    fn get_encrypted_balance(self: @TContractState, address: ContractAddress) -> felt252;
    fn rollover_pending_balance(ref self: TContractState);
}

#[starknet::contract]
pub mod TreazuryVault {
    use super::*;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess};
    use starknet::get_caller_address;

    #[storage]
    struct Storage {
        encrypted_balances: Map<ContractAddress, felt252>,
        pending_balances: Map<ContractAddress, felt252>,
        encryption_keys: Map<ContractAddress, felt252>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Deposit: DepositEvent,
        Withdraw: WithdrawEvent,
        Transfer: TransferEvent,
        Rollover: RolloverEvent,
        KeySet: KeySetEvent,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DepositEvent {
        #[key]
        user: ContractAddress,
        amount: u256,
    }
    #[derive(Drop, starknet::Event)]
    pub struct WithdrawEvent {
        #[key]
        user: ContractAddress,
        amount: u256,
    }
    #[derive(Drop, starknet::Event)]
    pub struct TransferEvent {
        #[key]
        from: ContractAddress,
        to: ContractAddress,
        encrypted_amount: felt252,
    }
    #[derive(Drop, starknet::Event)]
    pub struct RolloverEvent {
        #[key]
        user: ContractAddress,
    }
    #[derive(Drop, starknet::Event)]
    pub struct KeySetEvent {
        #[key]
        user: ContractAddress,
        pubkey: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        // No special init required
    }

    #[abi(embed_v0)]
    impl TreazuryVaultImpl of ITreazuryVault<ContractState> {
        fn set_encryption_key(ref self: ContractState, pubkey: felt252) {
            let caller = get_caller_address();
            self.encryption_keys.write(caller, pubkey);
            self.emit(Event::KeySet(KeySetEvent { user: caller, pubkey }));
        }

        fn deposit(ref self: ContractState, encrypted_amount: felt252, amount: u256) {
            let caller = get_caller_address();
            // Add encrypted amount to balance
            self.encrypted_balances.write(caller, encrypted_amount);
            self.emit(Event::Deposit(DepositEvent { user: caller, amount }));
        }

        fn withdraw(ref self: ContractState, proof: Span<felt252>, amount: u256) {
            let caller = get_caller_address();
            // TODO: Validate proof before allowing withdrawal
            // For MVP, assume proof is valid
            self.encrypted_balances.write(caller, 0);
            self.emit(Event::Withdraw(WithdrawEvent { user: caller, amount }));
        }

        fn transfer(ref self: ContractState, to: ContractAddress, encrypted_amount: felt252, proof: Span<felt252>) {
            let caller = get_caller_address();
            // TODO: Validate proof before allowing transfer
            // For MVP, assume proof is valid
            self.encrypted_balances.write(caller, 0);
            self.encrypted_balances.write(to, encrypted_amount);
            self.emit(Event::Transfer(TransferEvent { from: caller, to, encrypted_amount }));
        }

        fn get_encrypted_balance(self: @ContractState, address: ContractAddress) -> felt252 {
            self.encrypted_balances.read(address)
        }

        fn rollover_pending_balance(ref self: ContractState) {
            let caller = get_caller_address();
            let pending = self.pending_balances.read(caller);
            self.encrypted_balances.write(caller, pending);
            self.pending_balances.write(caller, 0);
            self.emit(Event::Rollover(RolloverEvent { user: caller }));
        }
    }
}

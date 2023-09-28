#![cfg_attr(not(feature = "std"), no_std, no_main)]

use dia_oracle_randomness_type::RandomData;
use ink::prelude::vec::Vec;
use ink::primitives::AccountId;

#[ink::trait_definition]
pub trait RandomOracleSetter {
    /// Transfer ownership of the contract to a new owner.
    #[ink(message)]
    fn transfer_ownership(&mut self, new_owner: AccountId);

    /// Set the account ID of the updater.
    #[ink(message)]
    fn set_updater(&mut self, updater: AccountId);

    /// Set the random value for a specific round.
    #[ink(message)]
    fn set_random_value(&mut self, round: u64, data: RandomData);

    /// Set random values for multiple rounds.
    #[ink(message)]
    fn set_random_values(&mut self, rounds: Vec<(u64, RandomData)>);
}

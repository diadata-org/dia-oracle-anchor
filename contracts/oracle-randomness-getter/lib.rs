#![cfg_attr(not(feature = "std"), no_std, no_main)]

use dia_oracle_randomness_type::RandomData;
use ink::prelude::vec::Vec;
use ink::primitives::AccountId;

#[ink::trait_definition]
pub trait RandomOracleGetter {
    /// Retrieve the updater's account ID.
    #[ink(message)]
    fn get_updater(&self) -> AccountId;

    /// Get the random value for a specific round, if it exists.
    #[ink(message)]
    fn get_random_value_for_round(&self, round: u64) -> Option<Vec<u8>>;

    /// Get the complete RandomData for a specific round, if it exists.
    #[ink(message)]
    fn get_round(&self, round: u64) -> Option<RandomData>;

    /// Get the latest round number.
    #[ink(message)]
    fn get_latest_round(&self) -> u64;
}

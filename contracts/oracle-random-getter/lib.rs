#![cfg_attr(not(feature = "std"), no_std, no_main)]

use ink::prelude::vec::Vec;
use ink::primitives::AccountId;
use dia_oracle_random_type::RandomData;


#[ink::trait_definition]
pub trait RandomOracleGetter {
    #[ink(message)]
    fn get_updater(&self) -> AccountId;

    #[ink(message)]
    fn get_random_value_for_round(&self, round: u64) -> Option<Vec<u8>>;

    #[ink(message)]
    fn get_round(&self, round: u64) -> Option<RandomData>;

    #[ink(message)]
    fn get_latest_round(&self) -> u64;
}

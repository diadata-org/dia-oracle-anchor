#![cfg_attr(not(feature = "std"), no_std, no_main)]

use ink::prelude::vec::Vec;
use ink::primitives::AccountId;

#[ink::trait_definition]
pub trait RandomOracleSetter {
    #[ink(message)]
    fn transfer_ownership(&mut self, new_owner: AccountId);

    #[ink(message)]
    fn set_updater(&mut self, updater: AccountId);

    #[ink(message)]
    fn set_random_value(&mut self, round: u64, randomness: Vec<u8>, signature: Vec<u8>);

    #[ink(message)]
    fn set_random_values(&mut self, rounds: Vec<(u64, Vec<u8>, Vec<u8>)>);
}

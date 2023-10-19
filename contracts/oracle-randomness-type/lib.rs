#![cfg_attr(not(feature = "std"), no_std, no_main)]

use ink::prelude::vec::Vec;

#[derive(PartialEq, Debug, Clone, scale::Encode, scale::Decode)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ::ink::storage::traits::StorageLayout)
)]
pub struct RandomData {
    /// A vector of bytes representing the randomness data.
    pub randomness: Vec<u8>,
}

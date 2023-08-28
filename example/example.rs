
#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod oracleexample {
    use ink::prelude::string::String;
    use blockchain::TokenPriceStorageRef;
    use blockchain::oracle_anchor::OracleGetters;

    #[derive(
        PartialEq,
        Eq,
    )]
 
    #[ink(storage)]
    pub struct OracleExample {
        oracle: TokenPriceStorageRef,
    }

  

    impl OracleExample {
        #[ink(constructor)]
        pub fn new(
            oracle_address: AccountId, 
        ) -> Self {
            let oracle: TokenPriceStorageRef = ink::env::call::FromAccountId::from_account_id(oracle_address);  
            Self {
                oracle
            }
        }

        #[ink(message)]
        pub fn get(&self,key:String ) ->  Option<(u64, u128)> {
            return self.oracle.get_latest_price(key);
        }

    }
}
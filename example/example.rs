#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod oracleexample {
    use blockchain::oracle_anchor::OracleGetters;
    use blockchain::TokenPriceStorageRef;
    use ink::prelude::string::String;

    #[derive(PartialEq, Eq)]
    #[ink(storage)]
    pub struct OracleExample {
        oracle: TokenPriceStorageRef,
    }

    impl OracleExample {
        #[ink(constructor)]
        pub fn new(oracle_address: AccountId) -> Self {
            let oracle: TokenPriceStorageRef =
                ink::env::call::FromAccountId::from_account_id(oracle_address);
            Self { oracle }
        }

        #[ink(message)]
        pub fn get(&self, key: String) -> Option<(u64, u128)> {
            self.oracle.get_latest_price(key)
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use blockchain::oracle_anchor::OracleSetters;
        use blockchain::TokenPriceStorageRef;
        use ink_e2e::build_message;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            //init Oracle contract

            let constructor = TokenPriceStorageRef::new();
            let contract_acc_id = client
                .instantiate("blockchain", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            //init Oracle Example contract

            let example_constructor = OracleExampleRef::new(contract_acc_id);

            let example_contract_acc_id = client
                .instantiate("example", &ink_e2e::alice(), example_constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            // set price for oracle
            let set_price_message = build_message::<TokenPriceStorageRef>(contract_acc_id.clone())
                .call(|tps| tps.set_price("abc".to_string(), 1001));

            let _set_price_res = client
                .call(&ink_e2e::alice(), set_price_message, 0, None)
                .await
                .expect("set failed");

            let get_price_message = build_message::<TokenPriceStorageRef>(contract_acc_id.clone())
                .call(|tps| tps.get_latest_price("abc".to_string()));

            let get_price_res = client
                .call(&ink_e2e::alice(), get_price_message, 0, None)
                .await
                .expect("get failed");

            let price = get_price_res.return_value().expect("Value is None").1;
            assert_eq!(price, 1001);

            // get price for oracle from example contract

            let get_price_message_example =
                build_message::<OracleExampleRef>(example_contract_acc_id.clone())
                    .call(|oe| oe.get("abc".to_string()));

            let get_price_res_example = client
                .call(&ink_e2e::alice(), get_price_message_example, 0, None)
                .await
                .expect("get failed");

            let price = get_price_res_example
                .return_value()
                .expect("Value is None")
                .1;
            assert_eq!(price, 1001);

            Ok(())
        }
    }
}

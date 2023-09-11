#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod oracleexample {
    use dia_oracle_getter::OracleGetters;
    use ink::contract_ref;
    use ink::prelude::string::String;

    #[ink(storage)]
    pub struct OracleExample {
        oracle: contract_ref!(OracleGetters),
    }

    impl OracleExample {
        #[ink(constructor)]
        pub fn new(oracle_address: AccountId) -> Self {
            Self { oracle: oracle_address.into() }
        }

        #[ink(message)]
        pub fn get(&self, key: String) -> Option<(u64, u128)> {
            self.oracle.get_latest_price(key)
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    mod e2e_tests {
        use super::*;
        use dia_oracle_setter::OracleSetters;
        use dia_oracle::TokenPriceStorageRef;
        use ink_e2e::build_message;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            //init Oracle contract
            const PRICE: u128 = 1001;


            let constructor = TokenPriceStorageRef::new();
            let contract_acc_id = client
                .instantiate("dia_oracle", &ink_e2e::alice(), constructor, 0, None)
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
                .call(|tps| tps.set_price("abc".to_string(), PRICE));

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

            let latest_price = get_price_res.return_value().expect("Value is None").1;
            assert_eq!(latest_price, PRICE);

            // get price for oracle from example contract

            let get_price_message_example =
                build_message::<OracleExampleRef>(example_contract_acc_id.clone())
                    .call(|oe| oe.get("abc".to_string()));

            let get_price_res_example = client
                .call(&ink_e2e::alice(), get_price_message_example, 0, None)
                .await
                .expect("get failed");

            let latest_price = get_price_res_example
                .return_value()
                .expect("Value is None")
                .1;
            assert_eq!(latest_price, PRICE);

            Ok(())
        }
    }
}

#![cfg_attr(not(feature = "std"), no_std, no_main)]



#[ink::contract]
mod randomoracleexample {
    use dia_oracle_random_getter::RandomOracleGetter;
    use ink::contract_ref;
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;


    #[ink(storage)]
    pub struct RandomOracleExample {
        oracle: contract_ref!(RandomOracleGetter),
    }

    impl RandomOracleExample {
        #[ink(constructor)]
        pub fn new(oracle_address: AccountId) -> Self {
            Self { oracle: oracle_address.into() }
        }

        #[ink(message)]
        pub fn get(&self, key: String) -> Option<Vec<u8>> {
            self.oracle.get_random_value_for_round(key)
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    #[cfg_attr(all(test, feature = "e2e-tests"), allow(unused_imports))]
    mod e2e_tests {
        use super::*;
        use dia_oracle_random_setter::RandomOracleSetter;
        use dia_random_oracle::RandomDataStorageRef;
        use ink_e2e::build_message;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            //init Oracle contract
            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![7, 8, 9];

            let constructor = RandomDataStorageRef::new();
            let contract_acc_id = client
                .instantiate("dia_random_oracle", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            //init Oracle Example contract

            let example_constructor = RandomOracleExampleRef::new(contract_acc_id);

            let example_contract_acc_id = client
                .instantiate("dia_oracle_example_random", &ink_e2e::alice(), example_constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            let set_random_value = build_message::<RandomDataStorageRef>(contract_acc_id.clone())
                .call(|rds| {
                    rds.set_random_value(
                        "round1".to_string(),
                        randomness.clone(),
                        signature.clone(),
                        previous_signature.clone(),
                    )
                });
                let _set_random_value_res = client
                .call(&ink_e2e::alice(), set_random_value, 0, None)
                .await
                .expect("set failed");

                let get_random_value_message = build_message::<RandomDataStorageRef>(contract_acc_id)
                .call(|rds| rds.get_random_value_for_round("round1".to_string()));

            let get_random_value_for_round_res = client
                .call(&ink_e2e::alice(), get_random_value_message, 0, None)
                .await
                .expect("get failed");


                let value = get_random_value_for_round_res
                .return_value()
                .expect("Value is None");
            assert_eq!(value, randomness);

            // get price for oracle from example contract

            let get_random_message_example =
                build_message::<RandomOracleExampleRef>(example_contract_acc_id.clone())
                    .call(|oe| oe.get("round1".to_string()));

            let get_random_res_example = client
                .call(&ink_e2e::alice(), get_random_message_example, 0, None)
                .await
                .expect("get failed");

            let latest_price = get_random_res_example
                .return_value()
                .expect("Value is None")
                ;
            assert_eq!(latest_price, randomness);

            Ok(())
        }
    }
}

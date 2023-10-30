#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod randomoracleexample {
    use dia_oracle_randomness_getter::RandomOracleGetter;
    use ink::contract_ref;
    use ink::prelude::vec::Vec;


    #[ink(storage)]
    pub struct RandomOracleExample {
        oracle: contract_ref!(RandomOracleGetter),
    }

    impl RandomOracleExample {
        #[ink(constructor)]
        pub fn new(oracle_address: AccountId) -> Self {
            Self {
                oracle: oracle_address.into(),
            }
        }

        #[ink(message)]
        pub fn get(&self, key: u64) -> Option<Vec<u8>> {
            self.oracle.get_random_value_for_round(key)
        }
    }

    #[cfg(all(test, feature = "e2e-tests"))]
    #[cfg_attr(all(test, feature = "e2e-tests"), allow(unused_imports))]
    mod e2e_tests {
        use super::*;
        use dia_oracle_randomness_setter::RandomOracleSetter;
        use dia_randomness_oracle::RandomnessOracleRef;
        use ink_e2e::build_message;
        use dia_oracle_randomness_type::RandomData;


        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            //init Oracle contract
            let randomness = vec![1, 2, 3];
 

            let r_data = RandomData {
                randomness,
            };


            let constructor = RandomnessOracleRef::new();
            let contract_acc_id = client
                .instantiate("dia_randomness_oracle", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            //init Oracle Example contract

            let example_constructor = RandomOracleExampleRef::new(contract_acc_id);

            let example_contract_acc_id = client
                .instantiate(
                    "dia_oracle_example_random",
                    &ink_e2e::alice(),
                    example_constructor,
                    0,
                    None,
                )
                .await
                .expect("instantiate failed")
                .account_id;

            let set_random_value = build_message::<RandomnessOracleRef>(contract_acc_id.clone())
                .call(|rds| rds.set_random_value(1, r_data.clone()));
            let _set_random_value_res = client
                .call(&ink_e2e::alice(), set_random_value, 0, None)
                .await
                .expect("set failed");

            let get_random_value_message = build_message::<RandomnessOracleRef>(contract_acc_id)
                .call(|rds| rds.get_random_value_for_round(1));

            let get_random_value_for_round_res = client
                .call(&ink_e2e::alice(), get_random_value_message, 0, None)
                .await
                .expect("get failed");

            let value = get_random_value_for_round_res
                .return_value()
                .expect("Value is None");
            assert_eq!(value, r_data.clone().randomness);

            // get price for oracle from example contract

            let get_random_message_example =
                build_message::<RandomOracleExampleRef>(example_contract_acc_id.clone())
                    .call(|oe| oe.get(1));

            let get_random_res_example = client
                .call(&ink_e2e::alice(), get_random_message_example, 0, None)
                .await
                .expect("get failed");

            let latest_round = get_random_res_example
                .return_value()
                .expect("Value is None");
            assert_eq!(latest_round, r_data.clone().randomness);

            Ok(())
        }
    }
}

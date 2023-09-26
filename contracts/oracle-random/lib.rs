#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::oracle_anchor::RandomDataStorageRef;

#[ink::contract]
pub mod oracle_anchor {
    use ink::prelude::vec::Vec;
    use ink::storage::{traits::ManualKey, Lazy, Mapping};

    use dia_oracle_random_getter::RandomOracleGetter;
    use dia_oracle_random_setter::RandomOracleSetter;
    use dia_oracle_random_type::RandomData;

    #[ink::storage_item]
    pub struct RandomDataStruct {
        owner: AccountId,
        updater: AccountId,
        value: Mapping<u64, RandomData>,
        latest_round: u64,
    }

    #[ink(storage)]
    pub struct RandomDataStorage {
        data: Lazy<RandomDataStruct, ManualKey<0x1>>,
    }

    #[ink(event)]
    pub struct OwnershipTransferred {
        #[ink(topic)]
        previous_owner: Option<AccountId>,
        #[ink(topic)]
        new_owner: AccountId,
    }

    #[ink(event)]
    pub struct RandomnessPointAdded {
        #[ink(topic)]
        round: u64,
        randomness: Vec<u8>,
    }

    #[ink(event)]
    pub struct UpdaterChanged {
        #[ink(topic)]
        old: Option<AccountId>,
        #[ink(topic)]
        new: AccountId,
    }

    impl RandomOracleSetter for RandomDataStorage {
        #[ink(message)]
        fn transfer_ownership(&mut self, new_owner: AccountId) {
            let caller: AccountId = self.env().caller();

            let mut tps: RandomDataStruct = self.data.get().expect("self.data not set");

            assert!(caller == tps.owner, "only owner can transfer ownership");
            tps.owner = new_owner;
            self.data.set(&tps);
            self.env().emit_event(OwnershipTransferred {
                previous_owner: Some(caller),
                new_owner,
            });
        }

        #[ink(message)]
        fn set_updater(&mut self, updater: AccountId) {
            let caller: AccountId = self.env().caller();

            let mut tps: RandomDataStruct = self.data.get().expect("self.data not set");

            assert!(caller == tps.owner, "only owner can set updater");
            tps.updater = updater;
            self.data.set(&tps);
            self.env().emit_event(UpdaterChanged {
                old: Some(caller),
                new: updater,
            });
        }

        #[ink(message)]
        fn set_random_value(&mut self, round: u64, data: RandomData) {
            let caller = Self::env().caller();
            let mut rds: RandomDataStruct = self.data.get().expect("self.data not set");
            assert!(caller == rds.updater, "only updater can set price");

            if rds.latest_round < round {
                rds.latest_round = round;
            }

            rds.value.insert(round, &data.clone());

            self.data.set(&rds);

            self.env().emit_event(RandomnessPointAdded {
                round,
                randomness: data.randomness,
            });
        }

        #[ink(message)]
        fn set_random_values(&mut self, rounds: Vec<(u64, RandomData)>) {
            let caller: AccountId = self.env().caller();
            let mut rds: RandomDataStruct = self.data.get().expect("self.data not set");
            assert!(caller == rds.updater, "only updater can set price");

            for (round, data) in rounds {
                // let data = RandomData {
                //     randomness,
                //     signature,
                //     previous_signature,
                // };
                rds.value.insert(round, &data.clone());

                if rds.latest_round < round {
                    rds.latest_round = round;
                }

                self.env().emit_event(RandomnessPointAdded {
                    round: rds.latest_round,
                    randomness: data.randomness.clone(),
                });
            }

            self.data.set(&rds);
        }
    }

    impl RandomOracleGetter for RandomDataStorage {
        #[ink(message)]
        fn get_random_value_for_round(&self, round: u64) -> Option<Vec<u8>> {
            let rds: RandomDataStruct = self.data.get().expect("self.data not set");

            rds.value.get(round).map(|data| data.randomness)
        }

        #[ink(message)]
        fn get_updater(&self) -> AccountId {
            self.data.get().unwrap().updater
        }

        #[ink(message)]
        fn get_latest_round(&self) -> u64 {
            self.data.get().unwrap().latest_round
        }
        #[ink(message)]
        fn get_round(&self, round: u64) -> Option<RandomData> {
            let rds: RandomDataStruct = self.data.get().expect("self.data not set");
            rds.value.get(round)
        }
    }

    impl Default for RandomDataStorage {
        fn default() -> Self {
            Self::new()
        }
    }

    impl RandomDataStorage {
        #[ink(constructor)]
        pub fn new() -> Self {
            let caller: AccountId = Self::env().caller();
            Self::env().emit_event(OwnershipTransferred {
                previous_owner: None,
                new_owner: caller,
            });
            Self::env().emit_event(UpdaterChanged {
                old: None,
                new: caller,
            });

            let rds = RandomDataStruct {
                owner: caller,
                updater: caller,
                value: Mapping::new(),
                latest_round: u64::default(),
            };

            let mut ldata = Lazy::new();
            ldata.set(&rds);

            Self { data: ldata }
        }
        #[ink(message)]
        pub fn code_hash(&self) -> Hash {
            self.env().own_code_hash().unwrap_or(Default::default())
        }

        #[ink(message)]
        pub fn set_code(&mut self, code_hash: [u8; 32]) {
            let caller: AccountId = self.env().caller();
            let tps: RandomDataStruct = self.data.get().expect("self.data not set");
            assert!(caller == tps.owner, "only owner can set set code");

            ink::env::set_code_hash(&code_hash).unwrap_or_else(|err| {
                panic!("Failed to `set_code_hash` to {code_hash:?} due to {err:?}")
            });
            ink::env::debug_println!("Switched code hash to {:?}.", code_hash);
        }
    }

    #[cfg(test)]
    mod tests {
        use ink::{
            env::hash::{Blake2x256, CryptoHash, HashOutput},
            primitives::Clear,
        };

        use super::*;

        struct PrefixedValue<'a, 'b, T> {
            pub prefix: &'a [u8],
            pub value: &'b T,
        }
        impl<X> scale::Encode for PrefixedValue<'_, '_, X>
        where
            X: scale::Encode,
        {
            #[inline]
            fn size_hint(&self) -> usize {
                self.prefix.size_hint() + self.value.size_hint()
            }

            #[inline]
            fn encode_to<T: scale::Output + ?Sized>(&self, dest: &mut T) {
                self.prefix.encode_to(dest);
                self.value.encode_to(dest);
            }
        }

        #[ink::test]
        fn get_random_value_for_round_returns_none_if_round_does_not_exist() {
            let contract = RandomDataStorage::new();

            assert_eq!(None, contract.get_random_value_for_round(1));
        }

        #[ink::test]
        fn get_random_value_for_round_returns_randomness_if_round_exists() {
            let mut contract = RandomDataStorage::new();

            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![4, 5, 6];

            let data = RandomData {
                randomness,
                signature,
                previous_signature,
            };

            contract.set_random_value(1, data.clone());

            assert_random_value_updated_event(
                &ink::env::test::recorded_events().collect::<Vec<_>>()[2],
                1,
                data.clone().randomness,
            );

            assert_eq!(
                Some(data.randomness),
                contract.get_random_value_for_round(1)
            );
        }

        #[ink::test]
        fn get_random_round() {
            let mut contract = RandomDataStorage::new();

            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![4, 5, 6];
            let data = RandomData {
                randomness,
                signature,
                previous_signature,
            };

            contract.set_random_value(1, data.clone());

            let result = contract.get_round(1);

            assert_eq!(result, Some(data));
        }

        #[ink::test]
        fn set_multiple_random_round() {
            let mut contract = RandomDataStorage::new();

            let test_rounds = vec![
                (
                    1,
                    RandomData {
                        randomness: vec![2, 2, 3],
                        signature: vec![1, 2, 3],
                        previous_signature: vec![1, 2, 3],
                    },
                ),
                (
                    2,
                    RandomData {
                        randomness: vec![1, 2, 3],
                        signature: vec![4, 5, 6],
                        previous_signature: vec![1, 2, 3],
                    },
                ),
                (
                    4,
                    RandomData {
                        randomness: vec![1, 2, 3],
                        signature: vec![4, 5, 6],
                        previous_signature: vec![1, 2, 3],
                    },
                ),
                (
                    3,
                    RandomData {
                        randomness: vec![1, 2, 3],
                        signature: vec![4, 5, 6],
                        previous_signature: vec![1, 2, 3],
                    },
                ),
            ];

            contract.set_random_values(test_rounds);

            let result = contract.get_round(4);

            let latest_round = contract.get_latest_round();
            assert_eq!(latest_round, 4);
            assert_eq!(
                result,
                Some(RandomData {
                    randomness: vec![1, 2, 3],
                    signature: vec![4, 5, 6],
                    previous_signature: vec![1, 2, 3]
                })
            );
        }

        #[ink::test]
        fn set_random_value_can_only_be_called_by_the_updater() {
            let mut contract = RandomDataStorage::new();
            let caller = AccountId::from([0x01; 32]);
            contract.set_updater(caller);

            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![4, 5, 6];
            let data = RandomData {
                randomness,
                signature,
                previous_signature,
            };

            contract.set_random_value(1, data);
        }

        #[ink::test]
        #[should_panic]
        fn set_random_value_panic() {
            let mut random_data_storage: RandomDataStorage = RandomDataStorage::new();
            // change caller
            let account: AccountId = AccountId::from([0x2; 32]);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(account);
            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![4, 5, 6];
            let data = RandomData {
                randomness,
                signature,
                previous_signature,
            };

            random_data_storage.set_random_value(1, data);
        }

        #[ink::test]
        #[should_panic]
        fn set_updater_panic() {
            let mut random_data_storage: RandomDataStorage = RandomDataStorage::new();
            // change caller
            let account: AccountId = AccountId::from([0x2; 32]);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(account);
            random_data_storage.set_updater(AccountId::from([0x01; 32]));
        }

        #[ink::test]
        fn transfer_ownership_works() {
            let mut rds: RandomDataStorage = RandomDataStorage::new();
            rds.transfer_ownership(AccountId::from([0x02; 32]));
            assert_eq!(
                rds.data.get().unwrap().owner,
                AccountId::from([0x02; 32]),
                "transfer ownership failed"
            );

            let emitted_events: Vec<ink::env::test::EmittedEvent> =
                ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 3);
            assert_transfer_ownership_event(&emitted_events[0], None, AccountId::from([0x01; 32]));
            assert_transfer_ownership_event(
                &emitted_events[2],
                Some(AccountId::from([0x01; 32])),
                AccountId::from([0x02; 32]),
            );
        }
        type Event = <RandomDataStorage as ::ink::reflect::ContractEventBase>::Type;

        fn assert_transfer_ownership_event(
            event: &ink::env::test::EmittedEvent,
            expected_old: Option<AccountId>,
            expected_new: AccountId,
        ) {
            let decoded_event = <Event as scale::Decode>::decode(&mut &event.data[..])
                .expect("encountered invalid contract event data buffer");
            if let Event::OwnershipTransferred(OwnershipTransferred {
                previous_owner,
                new_owner,
            }) = decoded_event
            {
                assert_eq!(
                    previous_owner, expected_old,
                    "encountered invalid OwnershipTransferred.old"
                );
                assert_eq!(
                    new_owner, expected_new,
                    "encountered invalid OwnershipTransferred.new"
                );
            } else {
                panic!("encountered unexpected event kind: expected a OwnershipTransferred event")
            }

            fn encoded_into_hash<T>(entity: &T) -> Hash
            where
                T: scale::Encode,
            {
                let mut result: ink::primitives::Hash = Hash::CLEAR_HASH;
                let len_result: usize = result.as_ref().len();
                let encoded: Vec<u8> = entity.encode();
                let len_encoded: usize = encoded.len();
                if len_encoded <= len_result {
                    result.as_mut()[..len_encoded].copy_from_slice(&encoded);
                    return result;
                }
                let mut hash_output: [u8; 32] =
                    <<Blake2x256 as HashOutput>::Type as Default>::default();
                <Blake2x256 as CryptoHash>::hash(&encoded, &mut hash_output);
                let copy_len: usize = core::cmp::min(hash_output.len(), len_result);
                result.as_mut()[0..copy_len].copy_from_slice(&hash_output[0..copy_len]);
                result
            }

            let expected_topics: [Hash; 3] = [
                encoded_into_hash(&PrefixedValue {
                    prefix: b"",
                    value: b"RandomDataStorage::OwnershipTransferred",
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"RandomDataStorage::OwnershipTransferred::previous_owner",
                    value: &expected_old,
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"RandomDataStorage::OwnershipTransferred::new_owner",
                    value: &expected_new,
                }),
            ];
            for (n, (actual_topic, expected_topic)) in
                event.topics.iter().zip(expected_topics).enumerate()
            {
                let topic: Hash = <Hash as scale::Decode>::decode(&mut &actual_topic[..])
                    .expect("encountered invalid topic encoding");
                assert_eq!(topic, expected_topic, "encountered invalid topic at {n}");
            }
        }

        fn assert_random_value_updated_event(
            event: &ink::env::test::EmittedEvent,
            expected_round: u64,
            expected_randomness: Vec<u8>,
        ) {
            let decoded_event = <Event as scale::Decode>::decode(&mut &event.data[..])
                .expect("encountered invalid contract event data buffer");
            if let Event::RandomnessPointAdded(RandomnessPointAdded { round, randomness }) =
                decoded_event
            {
                assert_eq!(
                    round, expected_round,
                    "encountered invalid RandomnessPointAdded.round"
                );
                assert_eq!(
                    randomness, expected_randomness,
                    "encountered invalid RandomnessPointAdded.randomness"
                );
            } else {
                panic!("encountered unexpected event kind: expected a RandomnessPointAdded event")
            }

            fn encoded_into_hash<T>(entity: &T) -> Hash
            where
                T: scale::Encode,
            {
                let mut result: Hash = Hash::CLEAR_HASH;
                let len_result: usize = result.as_ref().len();
                let encoded: Vec<u8> = entity.encode();
                let len_encoded: usize = encoded.len();
                if len_encoded <= len_result {
                    result.as_mut()[..len_encoded].copy_from_slice(&encoded);
                    return result;
                }
                let mut hash_output: [u8; 32] =
                    <<Blake2x256 as HashOutput>::Type as Default>::default();
                <Blake2x256 as CryptoHash>::hash(&encoded, &mut hash_output);
                let copy_len: usize = core::cmp::min(hash_output.len(), len_result);
                result.as_mut()[0..copy_len].copy_from_slice(&hash_output[0..copy_len]);
                result
            }

            let expected_topics: [Hash; 3] = [
                encoded_into_hash(&PrefixedValue {
                    prefix: b"",
                    value: b"RandomDataStorage::RandomnessPointAdded",
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"RandomDataStorage::RandomnessPointAdded::round",
                    value: &expected_round,
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"RandomDataStorage::RandomnessPointAdded::randomness",
                    value: &expected_randomness,
                }),
            ];
            for (n, (actual_topic, expected_topic)) in
                event.topics.iter().zip(expected_topics).enumerate()
            {
                let topic: Hash = <Hash as scale::Decode>::decode(&mut &actual_topic[..])
                    .expect("encountered invalid topic encoding");
                assert_eq!(topic, expected_topic, "encountered invalid topic at {n}");
            }
        }

        #[ink::test]
        fn set_updater_works() {
            let mut random_data_storage: RandomDataStorage = RandomDataStorage::new();
            random_data_storage.set_updater(AccountId::from([0x02; 32]));
            assert_eq!(
                random_data_storage.get_updater(),
                AccountId::from([0x02; 32])
            );

            let emitted_events: Vec<ink::env::test::EmittedEvent> =
                ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 3);
            assert_updater_event(&emitted_events[1], None, AccountId::from([0x01; 32]));
            assert_updater_event(
                &emitted_events[2],
                Some(AccountId::from([0x01; 32])),
                AccountId::from([0x02; 32]),
            );
        }

        fn assert_updater_event(
            event: &ink::env::test::EmittedEvent,
            expected_old: Option<AccountId>,
            expected_new: AccountId,
        ) {
            let decoded_event = <Event as scale::Decode>::decode(&mut &event.data[..])
                .expect("encountered invalid contract event data buffer");
            if let Event::UpdaterChanged(UpdaterChanged { old, new }) = decoded_event {
                assert_eq!(old, expected_old, "encountered invalid UpdaterChanged.old");
                assert_eq!(new, expected_new, "encountered invalid UpdaterChanged.new");
            } else {
                panic!("encountered unexpected event kind: expected a UpdaterChanged event")
            }

            fn encoded_into_hash<T>(entity: &T) -> Hash
            where
                T: scale::Encode,
            {
                let mut result: ink::primitives::Hash = Hash::CLEAR_HASH;
                let len_result: usize = result.as_ref().len();
                let encoded: Vec<u8> = entity.encode();
                let len_encoded: usize = encoded.len();
                if len_encoded <= len_result {
                    result.as_mut()[..len_encoded].copy_from_slice(&encoded);
                    return result;
                }
                let mut hash_output: [u8; 32] =
                    <<Blake2x256 as HashOutput>::Type as Default>::default();
                <Blake2x256 as CryptoHash>::hash(&encoded, &mut hash_output);
                let copy_len: usize = core::cmp::min(hash_output.len(), len_result);
                result.as_mut()[0..copy_len].copy_from_slice(&hash_output[0..copy_len]);
                result
            }

            let expected_topics: [Hash; 3] = [
                encoded_into_hash(&PrefixedValue {
                    prefix: b"",
                    value: b"RandomDataStorage::UpdaterChanged",
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"RandomDataStorage::UpdaterChanged::old",
                    value: &expected_old,
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"RandomDataStorage::UpdaterChanged::new",
                    value: &expected_new,
                }),
            ];
            for (n, (actual_topic, expected_topic)) in
                event.topics.iter().zip(expected_topics).enumerate()
            {
                let topic: Hash = <Hash as scale::Decode>::decode(&mut &actual_topic[..])
                    .expect("encountered invalid topic encoding");
                assert_eq!(topic, expected_topic, "encountered invalid topic at {n}");
            }
        }
    }
    #[cfg(all(test, feature = "e2e-tests"))]
    #[cfg_attr(all(test, feature = "e2e-tests"), allow(unused_imports))]
    mod e2e_tests {
        use super::*;
        use ink_e2e::build_message;

        type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

        #[ink_e2e::test]
        async fn default_works(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
            let constructor = RandomDataStorageRef::new();

            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![4, 5, 6];

            let contract_acc_id = client
                .instantiate("dia_random_oracle", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;
            let r_data = RandomData {
                randomness,
                signature,
                previous_signature,
            };

            let set_random_value = build_message::<RandomDataStorageRef>(contract_acc_id)
                .call(|rds| rds.set_random_value(1, r_data.clone()));

            let _set_random_value_res = client
                .call(&ink_e2e::alice(), set_random_value, 0, None)
                .await
                .expect("set failed");

            let get_random_value_message = build_message::<RandomDataStorageRef>(contract_acc_id)
                .call(|rds| rds.get_random_value_for_round(1));

            let get_random_value_for_round_res = client
                .call(&ink_e2e::alice(), get_random_value_message, 0, None)
                .await
                .expect("get failed");

            let value = get_random_value_for_round_res
                .return_value()
                .expect("Value is None");
            assert_eq!(value, r_data.clone().randomness);

            Ok(())
        }
    }
}

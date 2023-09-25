#![cfg_attr(not(feature = "std"), no_std, no_main)]

pub use self::oracle_anchor::RandomDataStorageRef;

#[ink::contract]
pub mod oracle_anchor {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::{traits::ManualKey, Lazy, Mapping};

    use dia_oracle_random_getter::RandomOracleGetter;
    use dia_oracle_random_setter::RandomOracleSetter;

    type RandomData = (Vec<u8>, Vec<u8>, Vec<u8>);

    #[ink::storage_item]
    pub struct RandomDataStruct {
        owner: AccountId,
        updater: AccountId,
        value: Mapping<String, RandomData>,
        last_round: String,
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
    pub struct UpdaterChanged {
        #[ink(topic)]
        old: Option<AccountId>,
        #[ink(topic)]
        new: AccountId,
    }

    #[ink(event)]
    pub struct RandomValueUpdate {
        #[ink(topic)]
        pair: String,
        price: u128,
        timestamp: u64,
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
        fn set_random_value(
            &mut self,
            round: String,
            randomness: Vec<u8>,
            signature: Vec<u8>,
            previous_signature: Vec<u8>,
        ) {
            let caller = Self::env().caller();
            let mut rds: RandomDataStruct = self.data.get().expect("self.data not set");
            assert!(caller == rds.updater, "only updater can set price");

            rds.last_round = round.clone();
            rds.value
                .insert(round, &(randomness, signature, previous_signature));

            self.data.set(&rds);
        }
    }

    impl RandomOracleGetter for RandomDataStorage {
        #[ink(message)]
        fn get_random_value_for_round(&self, round: String) -> Option<Vec<u8>> {
            let rds: RandomDataStruct = self.data.get().expect("self.data not set");

            if let Some(data) = rds.value.get(round) {
                Some(data.0)
            } else {
                None
            }
        }

        #[ink(message)]
        fn get_updater(&self) -> AccountId {
            self.data.get().unwrap().updater
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
                last_round: String::default(),
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

            assert_eq!(
                None,
                contract.get_random_value_for_round("round1".to_string())
            );
        }

        #[ink::test]
        fn get_random_value_for_round_returns_randomness_if_round_exists() {
            let mut contract = RandomDataStorage::new();

            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![7, 8, 9];

            contract.set_random_value(
                "round1".to_string(),
                randomness.clone(),
                signature.clone(),
                previous_signature.clone(),
            );

            assert_eq!(
                Some(randomness.clone()),
                contract.get_random_value_for_round("round1".to_string())
            );
        }

        #[ink::test]
        fn set_random_value_can_only_be_called_by_the_updater() {
            let mut contract = RandomDataStorage::new();
            let caller = AccountId::from([0x01; 32]);
            contract.set_updater(caller);

            let randomness = vec![1, 2, 3];
            let signature = vec![4, 5, 6];
            let previous_signature = vec![7, 8, 9];

            contract.set_random_value(
                "round1".to_string(),
                randomness.clone(),
                signature.clone(),
                previous_signature.clone(),
            );
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
            let previous_signature = vec![7, 8, 9];

            random_data_storage.set_random_value(
                "round1".to_string(),
                randomness.clone(),
                signature.clone(),
                previous_signature.clone(),
            );
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
            let previous_signature = vec![7, 8, 9];

            let contract_acc_id = client
                .instantiate("dia_random_oracle", &ink_e2e::alice(), constructor, 0, None)
                .await
                .expect("instantiate failed")
                .account_id;

            let set_random_value =
                build_message::<RandomDataStorageRef>(contract_acc_id).call(|rds| {
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

            Ok(())
        }
    }
}

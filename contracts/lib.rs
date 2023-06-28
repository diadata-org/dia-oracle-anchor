#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
pub mod oracle_anchor {
    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    #[ink(storage)]
    pub struct TokenPriceStorage {
        owner: AccountId,
        updater: AccountId,
        pairs: Mapping<String, Vec<(u64, u128)>>,
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
    pub struct TokenPriceChanged {
        #[ink(topic)]
        pair: String,
        #[ink(topic)]
        price: u128,
        timestamp: u64,
    }

    impl TokenPriceStorage {
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
            Self {
                owner: caller,
                updater: caller,
                pairs: Mapping::new(),
            }
        }

        #[ink(message)]
        pub fn transfer_ownership(&mut self, new_owner: AccountId) {
            let caller: AccountId = self.env().caller();
            assert!(caller == self.owner, "only owner can transfer ownership");
            self.owner = new_owner;
            self.env().emit_event(OwnershipTransferred {
                previous_owner: Some(caller),
                new_owner,
            });
        }

        #[ink(message)]
        pub fn set_updater(&mut self, updater: AccountId) {
            let caller: AccountId = self.env().caller();
            assert!(caller == self.owner, "only owner can set updater");
            self.updater = updater;
            self.env().emit_event(UpdaterChanged {
                old: Some(caller),
                new: updater,
            });
        }

        #[ink(message)]
        pub fn get_updater(&self) -> AccountId {
            self.updater
        }

        #[ink(message)]
        pub fn set_price(&mut self, pair: String, price: u128) {
            let caller: AccountId = self.env().caller();
            assert!(caller == self.updater, "only updater can set price");
            let current_timestamp: u64 = self.env().block_timestamp();
            let mut pricing: Vec<(u64, u128)> = self.pairs.get(&pair).unwrap_or_default();
            pricing.push((current_timestamp, price));
            self.pairs.insert(&pair, &pricing);

            self.env().emit_event(TokenPriceChanged {
                pair,
                price,
                timestamp: current_timestamp,
            });
        }

        #[ink(message)]
        pub fn get_latest_price(&self, pair: String) -> Option<(u64, u128)> {
            let pair: Vec<(u64, u128)> = self.pairs.get(&pair).unwrap_or_default();
            pair.last().copied()
        }

        #[ink(message)]
        pub fn get_price_history(&self, pair: String) -> Vec<(u64, u128)> {
            self.pairs.get(&pair).unwrap_or_default()
        }

        #[ink(message)]
        pub fn get_price_history_by_index(
            &self,
            pair: String,
            index: u32,
            length: u32,
        ) -> Vec<(u64, u128)> {
            let mut history: Vec<(u64, u128)> = self.pairs.get(&pair).unwrap_or_default();
            let start: usize = index as usize;
            let end: usize = (index + length) as usize;
            if end > history.len() {
                history = history[start..].to_vec();
            } else {
                history = history[start..end].to_vec();
            }
            history
        }

        #[ink(message)]
        pub fn get_price_history_length(&self, pair: String) -> u32 {
            let history: Vec<(u64, u128)> = self.pairs.get(&pair).unwrap_or_default();
            history.len() as u32
        }

        #[ink(message)]
        pub fn get_price_history_by_timestamp_and_binary_search(
            &self,
            pair: String,
            timestamp: u64,
        ) -> (u64, u128) {
            let history: Vec<(u64, u128)> = self.pairs.get(&pair).unwrap_or_default();
            let latest_price: (u64, u128) = self.get_latest_price(pair.clone()).unwrap_or_default();
            if timestamp >= latest_price.0 {
                return latest_price;
            }
            let mut left: usize = 0;
            let mut right: usize = history.len() - 1;
            let mut mid: usize = 0;
            // if not match return lower value
            while left <= right {
                mid = (left + right) / 2;
                if history[mid].0 == timestamp {
                    return history[mid];
                } else if history[mid].0 < timestamp {
                    left = mid + 1;
                } else {
                    right = mid - 1;
                }
            }
            if mid == 0 {
                return history[mid];
            }
            history[mid - 1]
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::{
            env::hash::{Blake2x256, CryptoHash, HashOutput},
            primitives::Clear,
        };

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
        fn default_works() {
            let token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            assert_eq!(
                token_price_storage.get_latest_price("abc".to_string()),
                None
            );
        }

        type Event = <TokenPriceStorage as ::ink::reflect::ContractEventBase>::Type;

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
                    value: b"TokenPriceStorage::OwnershipTransferred",
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"TokenPriceStorage::OwnershipTransferred::previous_owner",
                    value: &expected_old,
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"TokenPriceStorage::OwnershipTransferred::new_owner",
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
                    value: b"TokenPriceStorage::UpdaterChanged",
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"TokenPriceStorage::UpdaterChanged::old",
                    value: &expected_old,
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"TokenPriceStorage::UpdaterChanged::new",
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

        fn assert_token_price_changed_event(
            event: &ink::env::test::EmittedEvent,
            expected_pair: String,
            expected_price: u128,
            expected_timestamp: u64,
        ) {
            let decoded_event = <Event as scale::Decode>::decode(&mut &event.data[..])
                .expect("encountered invalid contract event data buffer");
            if let Event::TokenPriceChanged(TokenPriceChanged {
                pair,
                price,
                timestamp,
            }) = decoded_event
            {
                assert_eq!(
                    pair, expected_pair,
                    "encountered invalid TokenPriceChanged.pair"
                );
                assert_eq!(
                    price, expected_price,
                    "encountered invalid TokenPriceChanged.price"
                );
                assert_eq!(
                    timestamp, expected_timestamp,
                    "encountered invalid TokenPriceChanged.timestamp"
                );
            } else {
                panic!("encountered unexpected event kind: expected a TokenPriceChanged event")
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

            let expected_topics: [Hash; 4] = [
                encoded_into_hash(&PrefixedValue {
                    prefix: b"",
                    value: b"TokenPriceStorage::TokenPriceChanged",
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"TokenPriceStorage::TokenPriceChanged::pair",
                    value: &expected_pair,
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"TokenPriceStorage::TokenPriceChanged::price",
                    value: &expected_price,
                }),
                encoded_into_hash(&PrefixedValue {
                    prefix: b"TokenPriceStorage::TokenPriceChanged::timestamp",
                    value: &expected_timestamp,
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
        fn transfer_ownership_works() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            token_price_storage.transfer_ownership(AccountId::from([0x02; 32]));
            assert_eq!(
                token_price_storage.owner,
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

        #[ink::test]
        fn set_updater_works() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            token_price_storage.set_updater(AccountId::from([0x02; 32]));
            assert_eq!(
                token_price_storage.get_updater(),
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

        #[ink::test]
        fn set_price_works() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            token_price_storage.set_price("abc".to_string(), 100);
            assert_eq!(
                token_price_storage.get_latest_price("abc".to_string()),
                Some((0, 100))
            );

            assert_token_price_changed_event(
                &ink::env::test::recorded_events().collect::<Vec<_>>()[2],
                "abc".to_string(),
                100,
                0,
            );
        }

        #[ink::test]
        #[should_panic]
        fn set_price_panic() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            // change caller
            let account: AccountId = AccountId::from([0x2; 32]);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(account);
            token_price_storage.set_price("abc".to_string(), 100);
        }

        #[ink::test]
        #[should_panic]
        fn set_updater_panic() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            // change caller
            let account: AccountId = AccountId::from([0x2; 32]);
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(account);
            token_price_storage.set_updater(AccountId::from([0x01; 32]));
        }

        #[ink::test]
        fn get_price_history_works() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            token_price_storage.set_price("abc".to_string(), 100);
            token_price_storage.set_price("abc".to_string(), 200);
            token_price_storage.set_price("abc".to_string(), 300);
            assert_eq!(
                token_price_storage.get_price_history("abc".to_string()),
                vec![(0, 100), (0, 200), (0, 300)]
            );
        }

        #[ink::test]
        fn get_price_history_by_index_works() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            token_price_storage.set_price("abc".to_string(), 100);
            token_price_storage.set_price("abc".to_string(), 200);
            token_price_storage.set_price("abc".to_string(), 300);
            assert_eq!(
                token_price_storage.get_price_history_by_index("abc".to_string(), 0, 2),
                vec![(0, 100), (0, 200)]
            );
            assert_eq!(
                token_price_storage.get_price_history_by_index("abc".to_string(), 1, 2),
                vec![(0, 200), (0, 300)]
            );
            assert_eq!(
                token_price_storage.get_price_history_by_index("abc".to_string(), 2, 2),
                vec![(0, 300)]
            );
            assert_eq!(
                token_price_storage.get_price_history_by_index("abc".to_string(), 3, 1),
                vec![]
            );
        }

        #[ink::test]
        fn get_price_history_length_works() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            token_price_storage.set_price("abc".to_string(), 100);
            token_price_storage.set_price("abc".to_string(), 200);
            token_price_storage.set_price("abc".to_string(), 300);
            assert_eq!(
                token_price_storage.get_price_history_length("abc".to_string()),
                3
            );
        }

        #[ink::test]
        fn get_price_history_by_timestamp_and_binary_search_works() {
            let mut token_price_storage: TokenPriceStorage = TokenPriceStorage::new();
            // fake timestamp
            ink::env::test::set_block_timestamp::<ink::env::DefaultEnvironment>(100);
            token_price_storage.set_price("abc".to_string(), 100);
            ink::env::test::set_block_timestamp::<ink::env::DefaultEnvironment>(121);
            token_price_storage.set_price("abc".to_string(), 200);
            ink::env::test::set_block_timestamp::<ink::env::DefaultEnvironment>(134);
            token_price_storage.set_price("abc".to_string(), 300);
            ink::env::test::set_block_timestamp::<ink::env::DefaultEnvironment>(145);
            token_price_storage.set_price("abc".to_string(), 400);
            ink::env::test::set_block_timestamp::<ink::env::DefaultEnvironment>(156);
            token_price_storage.set_price("abc".to_string(), 500);

            let emitted_events: Vec<ink::env::test::EmittedEvent> =
                ink::env::test::recorded_events().collect::<Vec<_>>();
            assert_eq!(emitted_events.len(), 7);
            assert_token_price_changed_event(&emitted_events[2], "abc".to_string(), 100, 100);
            assert_token_price_changed_event(&emitted_events[3], "abc".to_string(), 200, 121);
            assert_token_price_changed_event(&emitted_events[4], "abc".to_string(), 300, 134);
            assert_token_price_changed_event(&emitted_events[5], "abc".to_string(), 400, 145);
            assert_token_price_changed_event(&emitted_events[6], "abc".to_string(), 500, 156);

            assert_eq!(
                token_price_storage
                    .get_price_history_by_timestamp_and_binary_search("abc".to_string(), 100),
                (100, 100)
            );

            assert_eq!(
                token_price_storage
                    .get_price_history_by_timestamp_and_binary_search("abc".to_string(), 120),
                (100, 100)
            );

            assert_eq!(
                token_price_storage
                    .get_price_history_by_timestamp_and_binary_search("abc".to_string(), 121),
                (121, 200)
            );

            assert_eq!(
                token_price_storage
                    .get_price_history_by_timestamp_and_binary_search("abc".to_string(), 140),
                (134, 300)
            );

            assert_eq!(
                token_price_storage
                    .get_price_history_by_timestamp_and_binary_search("abc".to_string(), 150),
                (145, 400)
            );

            assert_eq!(
                token_price_storage
                    .get_price_history_by_timestamp_and_binary_search("abc".to_string(), 190),
                (156, 500)
            );
        }
    }
}

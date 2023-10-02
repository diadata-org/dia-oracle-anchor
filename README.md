# DIA Oracles on Aleph Zero
This repository contains the source code for DIA oracles on Aleph Zero.

## Oracle Types
DIA offers two types of oracles on Aleph Zero.

### Asset Price Oracle
DIA token price feeds provide smart contract real-time price information cryptocurrency assets, transparently sourced from 80+ trusted, high-volume DEXs and CEXs.
The feeds facilitate the development of DeFi use cases such as money markets, lending/borrowing, synthetic asset issuance, options, derivatives and futures markets, and many more.
New assets can also be supported on demand.

#### Supported assets
The deployed DIA oracles support the following assets

| Asset | Query String | Methodology | Update Threshold |
| ----- | ------------ | ----------- | ---------------- |
| [Bitcoin](https://www.diadata.org/app/price/asset/Bitcoin/0x0000000000000000000000000000000000000000/) | `BTC/USD` | MAIR120 | 2% |
| [Ether](https://www.diadata.org/app/price/asset/Ethereum/0x0000000000000000000000000000000000000000/) | `ETH/USD` | MAIR120 | 2% |
| [USDC](https://www.diadata.org/app/price/asset/Ethereum/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/) | `USDC/USD` | MAIR120 | 2% |
| [USDT](https://www.diadata.org/app/price/asset/Ethereum/0xdAC17F958D2ee523a2206206994597C13D831ec7/) | `USDT/USD` | MAIR120 | 2% |
| [DOT](https://www.diadata.org/app/price/asset/Polkadot/0x0000000000000000000000000000000000000000/) | `DOT/USD` | MAIR120 | 2% |
| [SOL](https://www.diadata.org/app/price/asset/Solana/0x0000000000000000000000000000000000000000/) | `SOL/USD` | MAIR120 | 2% |
| [AVAX](https://www.diadata.org/app/price/asset/Avalanche/0x0000000000000000000000000000000000000000/) | `AVAX/USD` | MAIR120 | 2% |
| [DOT](https://www.diadata.org/app/price/asset/Polkadot/0x0000000000000000000000000000000000000000/) | `DOT/USD` | MAIR120 | 2% |
| [EUR](https://www.diadata.org/app/price/asset/Fiat/978/) | `EUR/USD` | MAIR120 | 2% |
| [BNB](https://www.diadata.org/app/price/asset/BinanceSmartChain/0x0000000000000000000000000000000000000000/) | `BNB/USD` | MAIR120 | 2% |
| [DOGE](https://www.diadata.org/app/price/asset/Dogechain/0x0000000000000000000000000000000000000000/) | `DOGE/USD` | MAIR120 | 2% |
| [MATIC](https://www.diadata.org/app/price/asset/Polygon/0x0000000000000000000000000000000000001010/) | `MATIC/USD` | MAIR120 | 2% |
| [DAI](https://www.diadata.org/app/price/asset/Ethereum/0x6B175474E89094C44Da98b954EedeAC495271d0F/) | `DAI/USD` | MAIR120 | 2% |
| [AZERO](https://www.diadata.org/app/price/asset/Dogechain/0x0000000000000000000000000000000000000000/) | `AZERO/USD` | MAIR120 | 2% |

The MAIR120 methodology is defined [in detail in the DIA documentation](https://docs.diadata.org/products/token-price-feeds/exchangeprices/mair-moving-average-with-interquartile-range-filter).

### Randomness Oracle
DIA xRandom provides smart contracts with unpredictable random numbers. DIA leverages drand’s distributed randomness beacon, enabling verifiable, unpredictable and unbiased random numbers.
The randomness oracle enables the creation of on-chain applications including but not limited to on-chain gaming, lotteries, prediction markets, and NFT launches. 

The randomness oracle is defined [in detail in the DIA documentation](https://docs.diadata.org/documentation/oracle-documentation/randomness-oracle).

### Deployed Oracles
Deployed oracles can be accessed at these addresses:

| Network | Oracle Name | Address | Metadata JSON |
| ------- | ----------- | ------- | ------------- |
| Testnet | Asset Price Oracle | [`5FmmcSEPiT4sZniwBMs6G89128GTTfPtaWK3jEJPJ9Z77v7U`](https://contracts-ui.substrate.io/contract/5FmmcSEPiT4sZniwBMs6G89128GTTfPtaWK3jEJPJ9Z77v7U) | [Price Oracle Metadata](example/dia_oracle.json) |
| Testnet | Randomness Oracle | [`5Grpo53UbArhM6uJNCrJTnyVy3BXYuxk5M4TNAwDnAgmrrjg`](https://contracts-ui.substrate.io/contract/5Grpo53UbArhM6uJNCrJTnyVy3BXYuxk5M4TNAwDnAgmrrjg) | [Randomness Oracle Metadata](example-randomness/dia_randomness_oracle.json) |
| Mainnet | Asset Price Oracle | [`5F7wPCMXX65RmL8oiuAFNKu2ydhvgcissDZ3NWZ5X85n2WPG`](https://contracts-ui.substrate.io/contract/5F7wPCMXX65RmL8oiuAFNKu2ydhvgcissDZ3NWZ5X85n2WPG) |
| Mainnet | Randomness Oracle | [`5FhA9YoxgT4ydFh83Dy1Ek1Cqkog9cp9JG8LP2BxFn4ECssi`](https://contracts-ui.substrate.io/contract/5FhA9YoxgT4ydFh83Dy1Ek1Cqkog9cp9JG8LP2BxFn4ECssi) |

## Asset price oracle
To facilitate development, the DIA oracles are deployed on Aleph Zero mainnet and testnet.
Any developer can interact with these oracles without any authentication.

### Oracle contract
The smart contract is a key/vlaue store and contains two values per asset, the timestamp of the last update and the value of the asset price.
The asset price is stored with 18 decimals by default.

To interact with this contract via the aleph zero UI, you can import the deployed contract.

#### Compiling the smart contract
Generate the smart contract files for interacting with the contact and import the resulting file into the Aleph Zero UI.

- Install cargo and required dependencies: https://docs.alephzero.org/aleph-zero/build/aleph-zero-smart-contracts-basics/installig-required-tools
- Run `cargo contract build --release`
- Go to https://contracts-ui.substrate.io/contract
- Choose `aleph zero testnet` on top left
- Choose `Add new contract`
- Choose `Use Onchain Contract`
- Enter `5FmmcSEPiT4sZniwBMs6G89128GTTfPtaWK3jEJPJ9Z77v7U`
- Import the built file ./target/ink/dia_oracle/dia_oracle.contract

### Interacting with the oracle
The `example` directory contains an example for how the oracle can be called by a dApp.
This piece of code shows how an asset can be retrieved using the `getLatestPrice()` function.

```
        #[ink(message)]
        pub fn get(&self, key: String) -> Option<(u64, u128)> {
            self.oracle.get_latest_price(key)
        }
```
The key usually is the string symbol of an asset pair, for example, "BTC/USD" for the price of Bitcoin.
The return value contains two values per asset, the timestamp of the last update and the value of the asset price.
The asset price is stored with 18 decimals by default.

Other functions include the retrieval of historic prices and the precision (decimals) of the oracle.

## Randomness oracle
The randomness oracle is available on Aleph Zero mainnet and testnet and can be used to retrieve randomness from [drand.love](https://drand.love).

### Oracle contract
Randomness is produced in numbered rounds. Each round's randomness can be retirved individually and the latest round can be queried from the contract directly.
To interact with this contract via the aleph zero UI, you can import the deployed contract above.

### Interacting with the oracle
The `example-randomness-oracle` directory contains an example for how the radnomness oracle can be called by a dApp.
This piece of code shows how an asset can be retrieved using the `getRandomValueForRound()` function.
The latest round (the required input parameter for this call) can be retrieved using the `getLatestRound()` function.

```
        #[ink(message)]
        pub fn get(&self, key: u64) -> Option<Vec<u8>> {
            self.oracle.get_random_value_for_round(key)
        }
```
The key is the integer round number, for example 3353171.
The return value contains three values per round, the radnomness value, its signature, and the previous round's signature.

Other functions include the retrieval of the latest round ID and the historical round randomnesses.

## Behind the scenes: Feeder setup
The smart contract is fed by a piece of software called the *Feeder* which is available as a docker image.
Unless you want to re-create the entire setup and operate your own oracle, the following section is not relevant.

### Environment for testing the feeder
These variables will be read from helm configs as environment variables
<table>
    <tr>
        <td>Name</td>
        <td>Default Value</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>DATABASE_URL</td>
        <td>postgresql://user:password@host:port/dbname</td>
        <td>Postgres database URL (optional, for recording transaction IDs)</td>
    </tr>
    <tr>
        <td>BLOCKCHAIN_NODE</td>
        <td>https://rpc.test.azero.dev</td>
        <td>Blockchain RPC</td>
    </tr>
    <tr>
        <td>PRIVATE_KEY</td>
        <td>*insert your private updater key here* </td>
        <td>PK of price updater</td>
    </tr>
    <tr>
        <td>DEPLOYED_CONTRACT</td>
        <td>5FmmcSEPiT4sZniwBMs6G89128GTTfPtaWK3jEJPJ9Z77v7U</td>
        <td>Price anchor contract deployed</td>
    </tr>
    <tr>
        <td>ASSETS</td>
        <td>"
      Bitcoin-0x0000000000000000000000000000000000000000,
      Ethereum-0x0000000000000000000000000000000000000000,
      Ethereum-0x84cA8bc7997272c7CfB4D0Cd3D55cd942B3c9419,
      Ethereum-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,
      Ethereum-0xdAC17F958D2ee523a2206206994597C13D831ec7,
      Ethereum-0x6B175474E89094C44Da98b954EedeAC495271d0F,
      Ethereum-0x853d955aCEf822Db058eb8505911ED77F175b99e,
      BinanceSmartChain-0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56,
      Solana-0x0000000000000000000000000000000000000000,
      Polkadot-0x0000000000000000000000000000000000000000
      "</td>
        <td>Assets, whose price is to be stored in the oracle</td>
    </tr>
    <tr>
        <td>FREQUENCY_SECONDS</td>
        <td>86400</td>
        <td>How often to feed price onchain</td>
    </tr>
    <tr>
        <td>SLEEP_SECONDS</td>
        <td>120</td>
        <td>How often to check DEVIATION_PERMILLE, store new price if need</td>
    </tr>
        <tr>
        <td>ORACLE_TYPE</td>
        <td>0</td>
        <td>Type of oracle for pricing oracle 0, and for randomness oracle 1</td>
    </tr>
</table>

> Note: these values are just used for testnet. Never share your production private key with anyone.

### How to run to the test with your own feeder
- Fill your env vars
- Install docker
- Run: 
  + `docker build --tag dia-oracle:latest .`
  + `docker run --rm -p 3000:3000 -d dia-oracle:latest`

### Output
The feeder will auto feed price onchain with 18 decimals. If you want to track transaction logs, youcan access them at `http://${host}/api/v1/oracle?page_size=${page_size}&page_index=${page_index}`

# DIA Oracles on Aleph Zero
This repository contains the source code for DIA oracles on Aleph Zero.

## Oracle Types
DIA offers two types of oracles on Aleph Zero.

### Asset Price Oracle
DIA token price feeds provide smart contract real-time price information cryptocurrency assets, transparently sourced from 80+ trusted, high-volume DEXs and CEXs.
The feeds facilitate the development of DeFi use cases such as money markets, lending/borrowing, synthetic asset issuance, options, derivatives and futures markets, and many more.
New assets can also be supported on demand.

### Randomness Oracle
DIA xRandom provides smart contracts with unpredictable random numbers. DIA leverages drand’s distributed randomness beacon, enabling verifiable, unpredictable and unbiased random numbers.
The randomness oracle enables the creation of on-chain applications including but not limited to on-chain gaming, lotteries, prediction markets, and NFT launches​. 

## Testnet
To facilitate development, the DIA oracles are deployed on Aleph Zero testnet.

### Contracts
The asset price oracle contract is deployed here: https://contracts-ui.substrate.io/contract/5FmmcSEPiT4sZniwBMs6G89128GTTfPtaWK3jEJPJ9Z77v7U
The smart contract contains two values per asset, the timestamp of the last update and the value of the asset price.
The asset price is stored with 18 decimals by default.

To interact with this contract via the aleph zero UI, you can import the deployed contract above.

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
The `example`directory contains an example for how the oracle can be called by a dApp.
This piece of code shows how an asset can be retrieved using the `getLatestPrice()` function.

```
        #[ink(message)]
        pub fn get(&self, key: String) -> Option<(u64, u128)> {
            self.oracle.get_latest_price(key)
        }
```
The key usually is the string symbol of an asset pair, for example, "BTC/USD" for the price of Bitcoin.
The return value two values per asset, the timestamp of the last update and the value of the asset price.
The asset price is stored with 18 decimals by default.

Other functions include the retrieval of historic prices and the precision (decimals) of the oracle.

### Feeder
The smart contract is fed by a piece of software called the *Feeder* which is available as a docker image.

#### Environment for testing the feeder
These variables will be read from helm configs as environment variables
<table>
    <tr>
        <td>Name</td>
        <td>Value</td>
        <td>Description</td>
    </tr>
    <tr>
        <td>DATABASE_URL</td>
        <td>postgresql://user:password@host:port/dbname</td>
        <td>Postgres database URL</td>
    </tr>
    <tr>
        <td>BLOCKCHAIN_NODE</td>
        <td>https://rpc.test.azero.dev</td>
        <td>Blockchain RPC</td>
    </tr>
    <tr>
        <td>PRIVATE_KEY</td>
        <td>0x0f41531f507c46cf005bba7043b62f8fe003893b9ab5ce79138a7c53f2fc6846</td>
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
        <td>Assets to be stored price</td>
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
</table>

> Note: these values are just used for testnet. Never share your production private key with anyone.

#### How to run to the test with your own feeder
- Fill your env vars
- Install docker
- Run: 
  + `docker build --tag dia-oracle:latest .`
  + `docker run --rm -p 3000:3000 -d dia-oracle:latest`

#### Output
The feeder will auto feed price onchain with 18 decimals. If you want to track transaction logs, youcan access them at `http://${host}/api/v1/oracle?page_size=${page_size}&page_index=${page_index}`

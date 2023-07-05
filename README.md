# Testnet

## Contracts

```
Token price contract deployed: https://contracts-ui.substrate.io/contract/5FmmcSEPiT4sZniwBMs6G89128GTTfPtaWK3jEJPJ9Z77v7U
```

To interact with contract on aleph zero UI, you can import deployed contract above

- install cargo and required libs https://docs.alephzero.org/aleph-zero/build/aleph-zero-smart-contracts-basics/installing-required-tools
- run `cargo contract build --release`
- go to https://contracts-ui.substrate.io/contract
- choose `aleph zero testnet` on top left
- choose `Add new contract`
- choose `Use Onchain Contract`
- enter `5FmmcSEPiT4sZniwBMs6G89128GTTfPtaWK3jEJPJ9Z77v7U`
- import file ./target/ink/blockchain.contract

## Bot

### Env for test
These variables will be read from helm configs
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

> Note: these values are just used for testnet

### How to run to test
- fill your env vars
- install docker
- run: 
  + docker build --tag dia-oracle:latest .
  + docker run --rm -p 3000:3000 -d dia-oracle:latest

### Output
- bot will auto feed price onchain
- if you want to track txn logs, http://${host}/api/v1/oracle?page_size=${page_size}&page_index=${page_index}

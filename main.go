package main

import (
	"errors"
	"fmt"
	"math/big"

	"github.com/btcsuite/btcutil/base58"
	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/signature"
	types "github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/ethereum/go-ethereum/common/hexutil"
)

func decodePubKeyFromSS58(ss58 string) ([]byte, error) {
	// decode ss58
	decoded := base58.Decode(ss58)
	if len(decoded) != 35 {
		return nil, errors.New("invalid public key")
	}
	if decoded[0] != 0x2a {
		return nil, errors.New("invalid public key prefix")
	}
	pubKey := decoded[1 : len(decoded)-2]
	return pubKey, nil
}

func main1() {
	// Connect to the Polkadot node
	api, err := gsrpc.NewSubstrateAPI("https://rpc.test.azero.dev")
	// This sample shows how to create a transaction to make a transfer from one an account to another.

	// Instantiate the API
	if err != nil {
		panic(err)
	}

	keyPair, err := signature.KeyringPairFromSecret("0x0f41531f507c46cf005bba7043b62f8fe003893b9ab5ce79138a7c53f2fc6846", 1)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Alice's AccountID: %v\n", keyPair.PublicKey)
	fmt.Printf("Alice's Address: %v\n", keyPair.Address)

	// get balance of account
	// alice, err := types.NewAddressFromAccountID(keyPair.PublicKey)
	// if err != nil {
	// 	panic(err)
	// }

	meta, err := api.RPC.State.GetMetadataLatest()
	if err != nil {
		panic(err)
	}

	// Create a call, transferring 12345 units to Bob
	pubKey, err := decodePubKeyFromSS58("5HjntDRkRkg2FQKfapeRqexzcciMUyByUFctUYWP6JgtCLJn")
	if err != nil {
		panic(err)
	}
	// to hex string
	fmt.Printf("pubKey: %v\n", hexutil.Encode(pubKey))
	bob, err := types.NewMultiAddressFromAccountID(pubKey)
	if err != nil {
		panic(err)
	}

	// 1 unit of transfer
	bal, ok := new(big.Int).SetString("100000000000000", 10)
	if !ok {
		panic(fmt.Errorf("failed to convert balance"))
	}

	c, err := types.NewCall(meta, "Balances.transfer", bob, types.NewUCompact(bal))
	if err != nil {
		panic(err)
	}

	// Create the extrinsic
	ext := types.NewExtrinsic(c)

	genesisHash, err := api.RPC.Chain.GetBlockHash(0)
	if err != nil {
		panic(err)
	}

	rv, err := api.RPC.State.GetRuntimeVersionLatest()
	if err != nil {
		panic(err)
	}

	key, err := types.CreateStorageKey(meta, "System", "Account", keyPair.PublicKey)
	if err != nil {
		panic(err)
	}

	var accountInfo types.AccountInfo
	ok, err = api.RPC.State.GetStorageLatest(key, &accountInfo)
	if err != nil || !ok {
		panic(err)
	}

	nonce := uint32(accountInfo.Nonce)
	o := types.SignatureOptions{
		BlockHash:          genesisHash,
		Era:                types.ExtrinsicEra{IsMortalEra: false},
		GenesisHash:        genesisHash,
		Nonce:              types.NewUCompactFromUInt(uint64(nonce)),
		SpecVersion:        rv.SpecVersion,
		Tip:                types.NewUCompactFromUInt(100),
		TransactionVersion: rv.TransactionVersion,
	}

	// Sign the transaction using Alice's default account
	err = ext.Sign(keyPair, o)
	if err != nil {
		panic(err)
	}

	// Send the extrinsic
	_, err = api.RPC.Author.SubmitExtrinsic(ext)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Balance transferred from Alice to Bob: %v\n", bal.String())
}

func main() {
	// Connect to the Polkadot node
	api, err := gsrpc.NewSubstrateAPI("https://rpc.test.azero.dev")
	// This sample shows how to create a transaction to make a transfer from one an account to another.

	// Instantiate the API
	if err != nil {
		panic(err)
	}

	keyPair, err := signature.KeyringPairFromSecret("0x0f41531f507c46cf005bba7043b62f8fe003893b9ab5ce79138a7c53f2fc6846", 1)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Alice's AccountID: %v\n", keyPair.PublicKey)
	fmt.Printf("Alice's Address: %v\n", keyPair.Address)

	// load contract
	contractAddress := "5E96aN1cgWhjPqnjNtbc67L8wT4p1HL74a3Euy71sLTJi6A5"
	pubKey, err := decodePubKeyFromSS58(contractAddress)
	if err != nil {
		panic(err)
	}
	// to hex string
	contract, err := types.NewMultiAddressFromAccountID(pubKey)
	if err != nil {
		panic(err)
	}

	meta, err := api.RPC.State.GetMetadataLatest()
	if err != nil {
		panic(err)
	}

	c, err := types.NewCall(meta, "Contracts.call.setUpdater", contract, contract)
	if err != nil {
		panic(err)
	}

	// Create the extrinsic
	ext := types.NewExtrinsic(c)

	genesisHash, err := api.RPC.Chain.GetBlockHash(0)
	if err != nil {
		panic(err)
	}

	rv, err := api.RPC.State.GetRuntimeVersionLatest()
	if err != nil {
		panic(err)
	}

	key, err := types.CreateStorageKey(meta, "System", "Account", keyPair.PublicKey)
	if err != nil {
		panic(err)
	}

	var accountInfo types.AccountInfo
	_, err = api.RPC.State.GetStorageLatest(key, &accountInfo)
	if err != nil {
		panic(err)
	}

	nonce := uint32(accountInfo.Nonce)
	o := types.SignatureOptions{
		BlockHash:          genesisHash,
		Era:                types.ExtrinsicEra{IsMortalEra: false},
		GenesisHash:        genesisHash,
		Nonce:              types.NewUCompactFromUInt(uint64(nonce)),
		SpecVersion:        rv.SpecVersion,
		Tip:                types.NewUCompactFromUInt(100),
		TransactionVersion: rv.TransactionVersion,
	}

	// Sign the transaction using Alice's default account
	err = ext.Sign(keyPair, o)
	if err != nil {
		panic(err)
	}

	// Send the extrinsic
	_, err = api.RPC.Author.SubmitExtrinsic(ext)
	if err != nil {
		panic(err)
	}

	// fmt.Printf("Balance transferred from Alice to Bob: %v\n", bal.String())
}

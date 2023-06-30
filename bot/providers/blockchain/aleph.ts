import { CONFIG } from '@config'
import { ChainSupported, TransactionStatus } from '@config/constants'
import { ApiPromise, HttpProvider, Keyring } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import { ContractCallOutcome, ContractOptions } from '@polkadot/api-contract/types'
import type { WeightV2 } from '@polkadot/types/interfaces'
import { BN, bnToBn, stringCamelCase } from '@polkadot/util'
import { injectable } from 'inversify'
import { find } from 'lodash'
import { ethers } from 'ethers'

@injectable()
export default class AlephZeroProvider {
  public getHttpProvider() {
    const rpcUrl = CONFIG.CHAINS?.[ChainSupported.AlephZero]?.PROVIDER
    if (!rpcUrl) {
      throw new Error('Application Error:::::Chain not supported')
    }
    return new HttpProvider(rpcUrl)
  }

  public async getHttpApi() {
    const provider = this.getHttpProvider()
    return await ApiPromise.create({ provider })
  }

  public getContractPromise(api: ApiPromise, address: string, abi: any) {
    return new ContractPromise(api, abi, address)
  }

  public getAccountKeyring(pk: string) {
    const keyring = new Keyring({ type: 'sr25519' })
    return keyring.addFromUri(pk)
  }

  public getAbiMessage(contract: ContractPromise, method: string) {
    const abiMessage = contract.abi.messages.find(m => stringCamelCase(m.method) === stringCamelCase(method))
    if (!abiMessage) {
      throw new Error(`"${method}" not found in Contract`)
    }
    return abiMessage
  }

  protected _getGasLimit(api: ApiPromise, _refTime: string | BN, _proofSize: string | BN): WeightV2 {
    const refTime = bnToBn(_refTime)
    const proofSize = bnToBn(_proofSize)

    return api.registry.createType('WeightV2', {
      refTime,
      proofSize
    })
  }

  public parseFromIntToFloat(num: string, unit: number) {
    return ethers.utils.formatUnits(num, unit)
  }

  public parseFromFloatToInt(num: string, unit: number) {
    return ethers.utils.parseUnits(num, unit).toString()
  }

  /**
   * Helper function that returns the maximum gas limit Weights V2 object
   * for an extrinsiv based on the api chain constants.
   * NOTE: It's reduced by a given factor (defaults to 80%) to avoid storage exhaust.
   */
  public getMaxGasLimit(api: ApiPromise, reductionFactor = 0.8) {
    const blockWeights = api.consts.system.blockWeights.toPrimitive() as any
    const maxExtrinsic = blockWeights?.perClass?.normal?.maxExtrinsic

    let maxRefTime = new BN(0)
    if (maxExtrinsic?.refTime) {
      maxRefTime = bnToBn(maxExtrinsic.refTime)
        .mul(new BN(reductionFactor * 100))
        .div(new BN(100))
    }

    let maxProofSize = new BN(0)
    if (maxExtrinsic?.proofSize) {
      maxProofSize = bnToBn(maxExtrinsic.proofSize)
        .mul(new BN(reductionFactor * 100))
        .div(new BN(100))
    }

    return this._getGasLimit(api, maxRefTime, maxProofSize)
  }

  public decodeOutput(
    { result }: any,
    contract: ContractPromise,
    method: string
  ): {
    output: any
    decodedOutput: string
    isError: boolean
  } {
    let output
    let decodedOutput = ''
    let isError = true

    if (result.isOk) {
      const flags = result.asOk.flags.toHuman()
      isError = flags.includes('Revert')
      const abiMessage = this.getAbiMessage(contract, method)
      const returnType = abiMessage.returnType
      const returnTypeName = returnType?.lookupName || returnType?.type || ''
      const registry = contract.abi.registry
      output = (registry.createTypeUnsafe(returnTypeName, [result.asOk.data]).toHuman() as any)?.Ok

      decodedOutput = output?.toString()
      if (typeof output === 'object') {
        decodedOutput = JSON.stringify(output, null, '\t')
      }
    }

    return {
      output,
      decodedOutput,
      isError
    }
  }

  public async contractCallDryRun(
    api: ApiPromise,
    account: any, // IKeyringPair | string,
    contract: ContractPromise,
    method: string,
    options = {} as ContractOptions,
    args = [] as unknown[]
  ): Promise<ContractCallOutcome> {
    const abiMessage = this.getAbiMessage(contract, method)
    const address = account?.address || account
    const { value, gasLimit, storageDepositLimit } = options
    const result = await api.call.contractsApi.call<ContractCallOutcome>(
      address,
      contract.address,
      value ?? new BN(0),
      gasLimit ?? null,
      storageDepositLimit ?? null,
      abiMessage.toU8a(args)
    )

    return result
  }

  public async contractQuery(
    api: ApiPromise,
    address: string,
    contract: ContractPromise,
    method: string,
    options = {} as ContractOptions,
    args = [] as unknown[]
  ): Promise<ContractCallOutcome> {
    const gasLimit = this.getMaxGasLimit(api)

    // Call actual query/tx
    const queryFn = contract.query[stringCamelCase(method)]
    return await queryFn(address, { ...options, gasLimit }, ...args)
  }

  public async contractTx(
    api: ApiPromise,
    account: any, // IKeyringPair | string,
    contract: ContractPromise,
    method: string,
    options = {} as ContractOptions,
    args = [] as unknown[]
  ) {
    // Dry run to determine required gas and potential errors
    delete options.gasLimit
    const dryResult = await this.contractCallDryRun(api, account, contract, method, options, args)
    const { isError, decodedOutput } = this.decodeOutput(dryResult, contract, method)
    if (isError) {
      throw new Error(
        JSON.stringify({
          dryResult,
          errorMessage: decodedOutput || 'Error'
        })
      )
    }

    // Call actual query/tx & wrap it in a promise
    const gasLimit = dryResult.gasRequired
    const tx = contract.tx[stringCamelCase(method)]({ ...options, gasLimit }, ...args)
    const currentBlock = await api.rpc.chain.getBlock()
    const result = await tx.signAndSend(account)

    return {
      currentBlock,
      dryResult,
      result
    }
  }

  public async waitTx(api: ApiPromise, txHash: string, startBlockNumber: number) {
    const latestBlock = await api.rpc.chain.getBlock()

    const latestBlockNumber = latestBlock.block.header.number.toNumber()

    // check within 30 blocks
    for (let i = startBlockNumber; i < latestBlockNumber + 30; i++) {
      const blockHash = await api.rpc.chain.getBlockHash(i)
      if (blockHash.toHex() === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        break
      }
      const block = await api.rpc.chain.getBlock(blockHash)
      const txn = find(block.block.extrinsics, e => e.hash.toHex() === txHash)
      if (txn) {
        const readableTxn = txn.toHuman() as any
        return {
          block: {
            block_number: i,
            block_hash: blockHash.toHex()
          },
          txn: {
            nonce: Number(readableTxn?.nonce),
            hash: txHash,
            signer: readableTxn?.signer?.Id,
            data: readableTxn.method.args?.data,
            value: readableTxn.method.args?.value,
            dest: readableTxn.method.args?.dest?.Id
          },
          status: TransactionStatus.Success
        }
      }
    }

    return {
      block: {},
      txn: {
        hash: txHash
      },
      status: TransactionStatus.Untracked
    }
  }
}

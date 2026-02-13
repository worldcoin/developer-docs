import { createHash } from 'node:crypto'
import { ethers } from 'ethers'

// TODO: Replace with actual staging miniapp ID
const MINIAPP_ID = 'app_staging_REPLACE_ME'

// Worldchain staging/testnet RPC - replace if using mainnet
const WORLDCHAIN_RPC_URL = 'https://worldchain-mainnet.g.alchemy.com/public'

const provider = new ethers.JsonRpcProvider(WORLDCHAIN_RPC_URL)

// ERC-4337 EntryPoint v0.7 contract address
const ENTRYPOINT_ADDRESS = '0x0000000071727De22E5E9d8BAf0edAc6f37da032'

// Minimal ABI with only the UserOperationEvent definition
const ENTRYPOINT_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'userOpHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
      { indexed: true, internalType: 'address', name: 'paymaster', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'nonce', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'success', type: 'bool' },
      { indexed: false, internalType: 'uint256', name: 'actualGasCost', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'actualGasUsed', type: 'uint256' },
    ],
    name: 'UserOperationEvent',
    type: 'event',
  },
]

const ENTRYPOINT_INTERFACE = new ethers.Interface(ENTRYPOINT_ABI)

// Used to identify the UserOperationEvent logs
const USER_OPERATION_EVENT_TOPIC = ENTRYPOINT_INTERFACE.getEvent('UserOperationEvent')!.topicHash

const VERSION_BYTES = 1
const MINIAPP_ID_BYTES = 13
const REFERENCE_BYTES = 10

async function verifyPaymentOnChain({
  senderAddress,
  reference,
  fromBlock,
}: {
  senderAddress: string
  /* The reference you generated when initiating the payment */
  reference: string
  /* Record provider.getBlockNumber() at payment initiation time */
  fromBlock: number
}): Promise<{ verified: boolean; transactionHash: string | null }> {
  console.log('🔍 Searching for payment...')
  console.log(`  Sender: ${senderAddress}`)
  console.log(`  Reference: ${reference}`)
  console.log(`  From block: ${fromBlock}`)

  // 1. Query logs for UserOperationEvent for sender
  const logs = await provider.getLogs({
    address: ENTRYPOINT_ADDRESS,
    topics: [
      USER_OPERATION_EVENT_TOPIC, // Topic 0: Event signature
      null, // Topic 1: userOpHash (any)
      ethers.zeroPadValue(senderAddress, 32), // Topic 2: sender (indexed)
    ],
    fromBlock,
  })

  console.log(`\n📋 Found ${logs.length} UserOperationEvent(s) for this sender`)

  // 2. Calculate expected hashes
  const expectedMiniappHash = createHash('sha256')
    .update(MINIAPP_ID, 'utf8')
    .digest()
    .subarray(0, MINIAPP_ID_BYTES)

  const expectedReferenceHash = createHash('sha256')
    .update(reference, 'utf8')
    .digest()
    .subarray(0, REFERENCE_BYTES)

  console.log(`\n🔑 Expected hashes:`)
  console.log(`  MiniappId hash: ${expectedMiniappHash.toString('hex')}`)
  console.log(`  Reference hash: ${expectedReferenceHash.toString('hex')}`)

  // 3. Iterate through the logs to find the matching event
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]
    console.log(`\n📄 Checking log ${i + 1}/${logs.length}...`)
    console.log(`  Block: ${log.blockNumber}`)
    console.log(`  TxHash: ${log.transactionHash}`)

    const parsedEvent = ENTRYPOINT_INTERFACE.parseLog({
      topics: log.topics as string[],
      data: log.data,
    })
    const nonce = parsedEvent.args.nonce as bigint

    // The nonce is structured as: [24-byte nonce key][8-byte nonce sequence]
    // Extract the nonce key by shifting right by 64 bits
    const nonceKey = nonce >> 64n

    // Convert the nonce key to bytes (24 bytes)
    const nonceKeyHex = nonceKey.toString(16).padStart(48, '0')
    const nonceKeyBytes = Buffer.from(nonceKeyHex, 'hex')

    // Verify miniappId: bytes [1..14) of the nonce key
    const actualMiniappHash = nonceKeyBytes.subarray(VERSION_BYTES, VERSION_BYTES + MINIAPP_ID_BYTES)
    console.log(`  Actual miniapp hash: ${actualMiniappHash.toString('hex')}`)

    if (Buffer.compare(actualMiniappHash, expectedMiniappHash) !== 0) {
      console.log(`  ❌ Miniapp hash mismatch`)
      continue
    }
    console.log(`  ✅ Miniapp hash matches!`)

    // Verify reference: bytes [14..24) of the nonce key
    const referenceOffset = VERSION_BYTES + MINIAPP_ID_BYTES
    const actualReferenceHash = nonceKeyBytes.subarray(referenceOffset, referenceOffset + REFERENCE_BYTES)
    console.log(`  Actual reference hash: ${actualReferenceHash.toString('hex')}`)

    if (Buffer.compare(actualReferenceHash, expectedReferenceHash) !== 0) {
      console.log(`  ❌ Reference hash mismatch`)
      continue
    }
    console.log(`  ✅ Reference hash matches!`)

    console.log(`\n🎉 Payment verified!`)
    return {
      verified: true,
      transactionHash: log.transactionHash,
    }
  }

  console.log(`\n❌ No matching payment found`)
  return {
    verified: false,
    transactionHash: null,
  }
}

// Test function
async function main() {
  const SENDER_ADDRESS = '0x1138f0842fd4c18103b247579aeb37cbe8bc830f'
  const REFERENCE = 'your-test-reference-123' // TODO: Get this from the staging app payment

  // Get current block number (do this BEFORE making the payment)
  const currentBlock = await provider.getBlockNumber()
  console.log(`Current block: ${currentBlock}`)
  console.log('\n⏳ Now make your payment in the World App...')
  console.log('⏳ Then come back and update FROM_BLOCK and run this script again\n')

  const FROM_BLOCK = currentBlock // Update this after payment if needed

  const result = await verifyPaymentOnChain({
    senderAddress: SENDER_ADDRESS,
    reference: REFERENCE,
    fromBlock: FROM_BLOCK,
  })

  console.log('\n' + '='.repeat(50))
  console.log('Result:', result)
}

main().catch(console.error)

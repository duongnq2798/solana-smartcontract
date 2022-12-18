import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ConsumeOrderEventsArgs {
  maxIterations: BN
}

export interface ConsumeOrderEventsAccounts {
  eventQueue: PublicKey
  orderbook: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("maxIterations")])

export function consumeOrderEvents(
  args: ConsumeOrderEventsArgs,
  accounts: ConsumeOrderEventsAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.eventQueue, isSigner: false, isWritable: true },
    { pubkey: accounts.orderbook, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([21, 25, 224, 233, 187, 4, 83, 216])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      maxIterations: args.maxIterations,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}

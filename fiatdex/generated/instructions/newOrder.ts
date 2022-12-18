import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface NewOrderArgs {
  side: types.SideKind
  limitPrice: BN
  maxBaseQty: BN
  isBroker: boolean
}

export interface NewOrderAccounts {
  user: PublicKey
  market: PublicKey
  userAccount: PublicKey
  eventQueue: PublicKey
  bids: PublicKey
  asks: PublicKey
  orderbook: PublicKey
  quoteMint: PublicKey
  userQuote: PublicKey
  quoteVault: PublicKey
  tokenProgram: PublicKey
}

export const layout = borsh.struct([
  types.Side.layout("side"),
  borsh.u64("limitPrice"),
  borsh.u64("maxBaseQty"),
  borsh.bool("isBroker"),
])

export function newOrder(args: NewOrderArgs, accounts: NewOrderAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.user, isSigner: true, isWritable: false },
    { pubkey: accounts.market, isSigner: false, isWritable: false },
    { pubkey: accounts.userAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.eventQueue, isSigner: false, isWritable: true },
    { pubkey: accounts.bids, isSigner: false, isWritable: true },
    { pubkey: accounts.asks, isSigner: false, isWritable: true },
    { pubkey: accounts.orderbook, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteMint, isSigner: false, isWritable: false },
    { pubkey: accounts.userQuote, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([153, 0, 116, 34, 241, 46, 40, 139])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      side: args.side.toEncodable(),
      limitPrice: args.limitPrice,
      maxBaseQty: args.maxBaseQty,
      isBroker: args.isBroker,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}

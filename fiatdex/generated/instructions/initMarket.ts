import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitMarketArgs {
  marketId: Array<number>
  minBaseOrderSize: BN
  tickSize: BN
}

export interface InitMarketAccounts {
  marketer: PublicKey
  market: PublicKey
  eventQueue: PublicKey
  orderbook: PublicKey
  bids: PublicKey
  asks: PublicKey
  quoteMint: PublicKey
  quoteVault: PublicKey
  rent: PublicKey
  tokenProgram: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.array(borsh.u8(), 10, "marketId"),
  borsh.u64("minBaseOrderSize"),
  borsh.u64("tickSize"),
])

export function initMarket(args: InitMarketArgs, accounts: InitMarketAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.marketer, isSigner: true, isWritable: true },
    { pubkey: accounts.market, isSigner: false, isWritable: true },
    { pubkey: accounts.eventQueue, isSigner: false, isWritable: true },
    { pubkey: accounts.orderbook, isSigner: false, isWritable: true },
    { pubkey: accounts.bids, isSigner: false, isWritable: true },
    { pubkey: accounts.asks, isSigner: false, isWritable: true },
    { pubkey: accounts.quoteMint, isSigner: false, isWritable: false },
    { pubkey: accounts.quoteVault, isSigner: false, isWritable: true },
    { pubkey: accounts.rent, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([33, 253, 15, 116, 89, 25, 127, 236])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      marketId: args.marketId,
      minBaseOrderSize: args.minBaseOrderSize,
      tickSize: args.tickSize,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}

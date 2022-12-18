import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface MarketFields {
  bump: number
  bumps: types.AobBumpsFields
  authority: PublicKey
  marketId: Array<number>
  pctCautionFeeForBaseToken: number
  orderbook: PublicKey
  eventQueue: PublicKey
  bids: PublicKey
  asks: PublicKey
  quoteMint: PublicKey
  quoteVault: PublicKey
  minBaseOrderSize: BN
  tickSize: BN
}

export interface MarketJSON {
  bump: number
  bumps: types.AobBumpsJSON
  authority: string
  marketId: Array<number>
  pctCautionFeeForBaseToken: number
  orderbook: string
  eventQueue: string
  bids: string
  asks: string
  quoteMint: string
  quoteVault: string
  minBaseOrderSize: string
  tickSize: string
}

export class Market {
  readonly bump: number
  readonly bumps: types.AobBumps
  readonly authority: PublicKey
  readonly marketId: Array<number>
  readonly pctCautionFeeForBaseToken: number
  readonly orderbook: PublicKey
  readonly eventQueue: PublicKey
  readonly bids: PublicKey
  readonly asks: PublicKey
  readonly quoteMint: PublicKey
  readonly quoteVault: PublicKey
  readonly minBaseOrderSize: BN
  readonly tickSize: BN

  static readonly discriminator = Buffer.from([
    219, 190, 213, 55, 0, 227, 198, 154,
  ])

  static readonly layout = borsh.struct([
    borsh.u8("bump"),
    types.AobBumps.layout("bumps"),
    borsh.publicKey("authority"),
    borsh.array(borsh.u8(), 10, "marketId"),
    borsh.u16("pctCautionFeeForBaseToken"),
    borsh.publicKey("orderbook"),
    borsh.publicKey("eventQueue"),
    borsh.publicKey("bids"),
    borsh.publicKey("asks"),
    borsh.publicKey("quoteMint"),
    borsh.publicKey("quoteVault"),
    borsh.u64("minBaseOrderSize"),
    borsh.u64("tickSize"),
  ])

  constructor(fields: MarketFields) {
    this.bump = fields.bump
    this.bumps = new types.AobBumps({ ...fields.bumps })
    this.authority = fields.authority
    this.marketId = fields.marketId
    this.pctCautionFeeForBaseToken = fields.pctCautionFeeForBaseToken
    this.orderbook = fields.orderbook
    this.eventQueue = fields.eventQueue
    this.bids = fields.bids
    this.asks = fields.asks
    this.quoteMint = fields.quoteMint
    this.quoteVault = fields.quoteVault
    this.minBaseOrderSize = fields.minBaseOrderSize
    this.tickSize = fields.tickSize
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<Market | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[]
  ): Promise<Array<Market | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(PROGRAM_ID)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): Market {
    if (!data.slice(0, 8).equals(Market.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Market.layout.decode(data.slice(8))

    return new Market({
      bump: dec.bump,
      bumps: types.AobBumps.fromDecoded(dec.bumps),
      authority: dec.authority,
      marketId: dec.marketId,
      pctCautionFeeForBaseToken: dec.pctCautionFeeForBaseToken,
      orderbook: dec.orderbook,
      eventQueue: dec.eventQueue,
      bids: dec.bids,
      asks: dec.asks,
      quoteMint: dec.quoteMint,
      quoteVault: dec.quoteVault,
      minBaseOrderSize: dec.minBaseOrderSize,
      tickSize: dec.tickSize,
    })
  }

  toJSON(): MarketJSON {
    return {
      bump: this.bump,
      bumps: this.bumps.toJSON(),
      authority: this.authority.toString(),
      marketId: this.marketId,
      pctCautionFeeForBaseToken: this.pctCautionFeeForBaseToken,
      orderbook: this.orderbook.toString(),
      eventQueue: this.eventQueue.toString(),
      bids: this.bids.toString(),
      asks: this.asks.toString(),
      quoteMint: this.quoteMint.toString(),
      quoteVault: this.quoteVault.toString(),
      minBaseOrderSize: this.minBaseOrderSize.toString(),
      tickSize: this.tickSize.toString(),
    }
  }

  static fromJSON(obj: MarketJSON): Market {
    return new Market({
      bump: obj.bump,
      bumps: types.AobBumps.fromJSON(obj.bumps),
      authority: new PublicKey(obj.authority),
      marketId: obj.marketId,
      pctCautionFeeForBaseToken: obj.pctCautionFeeForBaseToken,
      orderbook: new PublicKey(obj.orderbook),
      eventQueue: new PublicKey(obj.eventQueue),
      bids: new PublicKey(obj.bids),
      asks: new PublicKey(obj.asks),
      quoteMint: new PublicKey(obj.quoteMint),
      quoteVault: new PublicKey(obj.quoteVault),
      minBaseOrderSize: new BN(obj.minBaseOrderSize),
      tickSize: new BN(obj.tickSize),
    })
  }
}

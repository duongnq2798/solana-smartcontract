import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface UserAccountFields {
  bump: number
  authority: PublicKey
  market: PublicKey
  quoteTokenFree: BN
  quoteTokenLocked: BN
  quoteTokenAsCautionFee: BN
  numberOfOrders: number
  orders: Array<BN>
}

export interface UserAccountJSON {
  bump: number
  authority: string
  market: string
  quoteTokenFree: string
  quoteTokenLocked: string
  quoteTokenAsCautionFee: string
  numberOfOrders: number
  orders: Array<string>
}

export class UserAccount {
  readonly bump: number
  readonly authority: PublicKey
  readonly market: PublicKey
  readonly quoteTokenFree: BN
  readonly quoteTokenLocked: BN
  readonly quoteTokenAsCautionFee: BN
  readonly numberOfOrders: number
  readonly orders: Array<BN>

  static readonly discriminator = Buffer.from([
    211, 33, 136, 16, 186, 110, 242, 127,
  ])

  static readonly layout = borsh.struct([
    borsh.u8("bump"),
    borsh.publicKey("authority"),
    borsh.publicKey("market"),
    borsh.u64("quoteTokenFree"),
    borsh.u64("quoteTokenLocked"),
    borsh.u64("quoteTokenAsCautionFee"),
    borsh.u8("numberOfOrders"),
    borsh.vec(borsh.u128(), "orders"),
  ])

  constructor(fields: UserAccountFields) {
    this.bump = fields.bump
    this.authority = fields.authority
    this.market = fields.market
    this.quoteTokenFree = fields.quoteTokenFree
    this.quoteTokenLocked = fields.quoteTokenLocked
    this.quoteTokenAsCautionFee = fields.quoteTokenAsCautionFee
    this.numberOfOrders = fields.numberOfOrders
    this.orders = fields.orders
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<UserAccount | null> {
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
  ): Promise<Array<UserAccount | null>> {
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

  static decode(data: Buffer): UserAccount {
    if (!data.slice(0, 8).equals(UserAccount.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = UserAccount.layout.decode(data.slice(8))

    return new UserAccount({
      bump: dec.bump,
      authority: dec.authority,
      market: dec.market,
      quoteTokenFree: dec.quoteTokenFree,
      quoteTokenLocked: dec.quoteTokenLocked,
      quoteTokenAsCautionFee: dec.quoteTokenAsCautionFee,
      numberOfOrders: dec.numberOfOrders,
      orders: dec.orders,
    })
  }

  toJSON(): UserAccountJSON {
    return {
      bump: this.bump,
      authority: this.authority.toString(),
      market: this.market.toString(),
      quoteTokenFree: this.quoteTokenFree.toString(),
      quoteTokenLocked: this.quoteTokenLocked.toString(),
      quoteTokenAsCautionFee: this.quoteTokenAsCautionFee.toString(),
      numberOfOrders: this.numberOfOrders,
      orders: this.orders.map((item) => item.toString()),
    }
  }

  static fromJSON(obj: UserAccountJSON): UserAccount {
    return new UserAccount({
      bump: obj.bump,
      authority: new PublicKey(obj.authority),
      market: new PublicKey(obj.market),
      quoteTokenFree: new BN(obj.quoteTokenFree),
      quoteTokenLocked: new BN(obj.quoteTokenLocked),
      quoteTokenAsCautionFee: new BN(obj.quoteTokenAsCautionFee),
      numberOfOrders: obj.numberOfOrders,
      orders: obj.orders.map((item) => new BN(item)),
    })
  }
}

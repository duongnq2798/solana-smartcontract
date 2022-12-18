import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface AobBumpsFields {
  quoteVault: number
}

export interface AobBumpsJSON {
  quoteVault: number
}

export class AobBumps {
  readonly quoteVault: number

  constructor(fields: AobBumpsFields) {
    this.quoteVault = fields.quoteVault
  }

  static layout(property?: string) {
    return borsh.struct([borsh.u8("quoteVault")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new AobBumps({
      quoteVault: obj.quoteVault,
    })
  }

  static toEncodable(fields: AobBumpsFields) {
    return {
      quoteVault: fields.quoteVault,
    }
  }

  toJSON(): AobBumpsJSON {
    return {
      quoteVault: this.quoteVault,
    }
  }

  static fromJSON(obj: AobBumpsJSON): AobBumps {
    return new AobBumps({
      quoteVault: obj.quoteVault,
    })
  }

  toEncodable() {
    return AobBumps.toEncodable(this)
  }
}

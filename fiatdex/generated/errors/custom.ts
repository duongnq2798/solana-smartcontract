export type CustomError =
  | NotImplemented
  | InvalidAobMarketState
  | InvalidMarket
  | InvalidOrder
  | AbortedOrder

export class NotImplemented extends Error {
  static readonly code = 6000
  readonly code = 6000
  readonly name = "NotImplemented"
  readonly msg = "Function not yet implemented"

  constructor(readonly logs?: string[]) {
    super("6000: Function not yet implemented")
  }
}

export class InvalidAobMarketState extends Error {
  static readonly code = 6001
  readonly code = 6001
  readonly name = "InvalidAobMarketState"
  readonly msg = "Invalid account data on AOB market state"

  constructor(readonly logs?: string[]) {
    super("6001: Invalid account data on AOB market state")
  }
}

export class InvalidMarket extends Error {
  static readonly code = 6002
  readonly code = 6002
  readonly name = "InvalidMarket"
  readonly msg = "Impossible to create the market"

  constructor(readonly logs?: string[]) {
    super("6002: Impossible to create the market")
  }
}

export class InvalidOrder extends Error {
  static readonly code = 6003
  readonly code = 6003
  readonly name = "InvalidOrder"
  readonly msg = "Impossible to create a order"

  constructor(readonly logs?: string[]) {
    super("6003: Impossible to create a order")
  }
}

export class AbortedOrder extends Error {
  static readonly code = 6004
  readonly code = 6004
  readonly name = "AbortedOrder"
  readonly msg = "Order has aborted"

  constructor(readonly logs?: string[]) {
    super("6004: Order has aborted")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new NotImplemented(logs)
    case 6001:
      return new InvalidAobMarketState(logs)
    case 6002:
      return new InvalidMarket(logs)
    case 6003:
      return new InvalidOrder(logs)
    case 6004:
      return new AbortedOrder(logs)
  }

  return null
}

use anchor_lang::prelude::*;

#[error_code]
pub enum CookieCutterError {
    #[msg("The account is not mutable")]
    NotMutableAccount,

    #[msg("Public key comparison returns false")]
    NotEqualKey,

    #[msg("Cannot initialized the account")]
    UninitializedAccount,

    #[msg("The given account is not an owner")]
    IncorrectOwner,

    #[msg("The mathematic calculation returns invalid value")]
    NumericalOverflow,

    #[msg("The highest bidder is not presented in the seller trade state")]
    NoHighestBidder,
}
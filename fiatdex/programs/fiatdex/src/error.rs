use anchor_lang::prelude::*;

#[error_code]
pub enum CustomErrors {
    #[msg("Function not yet implemented")]
    NotImplemented, // 6000
    #[msg("Invalid account data on AOB market state")]
    InvalidAobMarketState, // 6001
    #[msg("Impossible to create the market")]
    InvalidMarket, // 6002
    #[msg("Impossible to create a order")]
    InvalidOrder, // 6003
    #[msg("Order has aborted")]
    AbortedOrder, // 6004
    #[msg("Impossible to decode user account")]
    MissingOpenOrdersPubkeyInRemainingAccounts, // 6005
}
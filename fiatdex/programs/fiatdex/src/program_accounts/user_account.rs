use anchor_lang::prelude::*;

use crate::types::*;

#[account]
#[derive(Default, Debug)]
pub struct UserAccount {
    pub bump: u8,
    pub authority: Pubkey,
    pub market: Pubkey,
    pub quote_token_free: u64,
    pub quote_token_locked: u64,
    pub quote_token_as_caution_fee: u64,
    // Active orders
    pub number_of_orders: u8,
    pub orders: Vec<u128>,
}
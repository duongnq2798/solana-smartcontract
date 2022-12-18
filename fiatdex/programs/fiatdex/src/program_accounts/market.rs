use anchor_lang::prelude::*;

use crate::types::*;

#[account]
#[derive(Default, Debug)]
pub struct Market {
    // General market options
    pub bump: u8,
    pub bumps: AobBumps,
    pub authority: Pubkey,
    pub market_id: [u8; 10],
    pub pct_caution_fee_for_base_token: u16,  //percentage of amount of base currency that needs to be locked in quote currency to create an order
    pub orderbook: Pubkey,
    pub event_queue: Pubkey,
    pub bids: Pubkey,
    pub asks: Pubkey,
    pub quote_mint: Pubkey,
    pub quote_vault: Pubkey,
    pub min_base_order_size: u64,
    pub tick_size: u64,
}
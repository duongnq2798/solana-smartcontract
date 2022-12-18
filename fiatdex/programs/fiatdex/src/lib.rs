use anchor_lang::prelude::*;

use agnostic_orderbook::state::{SelfTradeBehavior};

use instructions::*;
use types::*;
use program_accounts::*;
use error::*;

mod consts;
mod error;
pub mod program_accounts;
pub mod instructions;
pub mod types;

declare_id!("5f3Q4hsMW3UboR9nhwYvDWjLUVJpnNm545hekKe1Gs3W");

#[program]
pub mod fiatdex {
    use super::*;

    pub fn init_market(ctx: Context<InitMarket>, market_id: [u8; 10], min_base_order_size: u64, tick_size: u64) -> Result<()> {
        instructions::init_market(ctx, market_id, min_base_order_size, tick_size)
    }

    pub fn init_user_account(ctx: Context<InitUserAccount>) -> Result<()> {
        instructions::init_user_account(ctx)
    }
    
    pub fn new_order(ctx: Context<NewOrder>, side: Side, limit_price: u64, max_base_qty: u64, is_broker: bool) -> Result<()> {
        instructions::new_order(ctx, side, limit_price, max_base_qty, is_broker)
    }

    pub fn consume_order_events(ctx: Context<ConsumeOrderEvents>, max_iterations: u64,) -> Result<()> {
        instructions::consume_order_events(ctx, max_iterations)
    }

    
}

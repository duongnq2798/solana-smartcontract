use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::consts::*;
use crate::error::CustomErrors;
use crate::program_accounts::*;
use crate::types::*;

use agnostic_orderbook::state::event_queue::EventQueue;
use agnostic_orderbook::state::AccountTag;
use agnostic_orderbook::state::market_state::MarketState;
use agnostic_orderbook::state::critbit::Slab;




#[derive(Accounts)]
pub struct InitUserAccount<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [MARKET.as_bytes(), &market.market_id, market.authority.as_ref()],
        bump = market.bump,
    )]
    pub market: Box<Account<'info, Market>>,
    #[account(
        init,
        seeds = [user.key().as_ref(), USER_ACCOUNT.as_bytes(), &market.market_id, market.authority.as_ref()],
        bump,
        space = 332, // better compute the space probably we can reduce a little bit
        payer = user,
    )]
    pub user_account: Box<Account<'info, UserAccount>>,
    pub system_program: Program<'info, System>,
}

pub fn init_user_account(ctx: Context<InitUserAccount>) -> Result<()> {
    ctx.accounts.user_account.set_inner(UserAccount {
        bump: *ctx.bumps.get("user_account").unwrap(),
        authority: ctx.accounts.user.key(),
        market: ctx.accounts.market.key(),
        
        // Everything else defaults to 0
        
        quote_token_locked: 0,
        quote_token_free: 0,
        quote_token_as_caution_fee: 0,
        
        number_of_orders: 0,
        orders: Vec::new(),
    });
    
    Ok(())

}
use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::consts::*;
use crate::error::CustomErrors;
use crate::program_accounts::*;
use crate::types::*;

use crate::consts::*;
use crate::program_accounts::*;

use agnostic_orderbook::state::event_queue::EventQueue;
use agnostic_orderbook::state::AccountTag;
use agnostic_orderbook::state::market_state::MarketState;
use agnostic_orderbook::state::critbit::Slab;



// Flexible on design decisions such as:
// - Using start time as part of the seeds to allow more than one auction
//   per auctioneer account. Open to other suggestions on namespaces
#[derive(Accounts)]
#[instruction(market_id: [u8; 10], min_base_order_size: u64, tick_size: u64)]
pub struct InitMarket<'info> {
    #[account(mut)]
    pub marketer: Signer<'info>,
    // Program Accounts
    // An account struct with all of the auction options
    #[account(
        init,
        seeds = [MARKET.as_bytes(), &market_id, marketer.key().as_ref()],
        bump,
        space = 1000,
        payer = marketer,
    )]
    pub market: Box<Account<'info, Market>>,
    /// CHECK: This is zeroed and owned by the program
    #[account(zero, owner = crate::ID)]
    pub event_queue: UncheckedAccount<'info>,
    /// CHECK: This is zeroed and owned by the program
    #[account(zero, owner = crate::ID)]
    pub orderbook: UncheckedAccount<'info>,
    /// CHECK: This is zeroed and owned by the program
    #[account(zero, owner = crate::ID)]
    pub bids: UncheckedAccount<'info>,
    /// CHECK: This is zeroed and owned by the program
    #[account(zero, owner = crate::ID)]
    pub asks: UncheckedAccount<'info>,
    // Token vaults
    pub quote_mint: Account<'info, Mint>,
    #[account(
        init,
        token::mint = quote_mint,
        token::authority = market, // It should probably be the market account, since it will sign
        seeds = [QUOTE_VAULT.as_bytes(), &market_id, marketer.key().as_ref()],
        bump,
        payer = marketer,
    )]
    pub quote_vault: Account<'info, TokenAccount>,
    // Sysvars
    pub rent: Sysvar<'info, Rent>,
    // Programs
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn init_market(ctx: Context<InitMarket>, market_id: [u8; 10], min_base_order_size: u64, tick_size: u64) -> Result<()> {
    
    ctx.accounts.market.set_inner(Market {
        bump: *ctx.bumps.get("market").unwrap(),
        bumps: AobBumps {
            quote_vault: *ctx.bumps.get("quote_vault").unwrap(),
        },
        authority: ctx.accounts.marketer.key(),
        market_id: market_id,
        // Order book stuff
        pct_caution_fee_for_base_token: 500, // "5%"
        event_queue: ctx.accounts.event_queue.key(),
        orderbook: ctx.accounts.orderbook.key(),
        bids: ctx.accounts.bids.key(),
        asks: ctx.accounts.asks.key(),
        quote_mint: ctx.accounts.quote_mint.key(),
        quote_vault: ctx.accounts.quote_vault.key(),
        min_base_order_size: min_base_order_size,
        tick_size: tick_size,
    });

    let invoke_params = agnostic_orderbook::instruction::create_market::Params {
        min_base_order_size: min_base_order_size,
        tick_size: tick_size,
    };
    
    if let Err(error) = agnostic_orderbook::instruction::create_market::process::<BasicCallBack>(
        ctx.program_id,
        agnostic_orderbook::instruction::create_market::Accounts {
            market: &ctx.accounts.orderbook,
            event_queue: &ctx.accounts.event_queue,
            bids: &ctx.accounts.bids,
            asks: &ctx.accounts.asks,
        },
        invoke_params,
    ) {
        msg!("{}", error);
        return Err(error!(CustomErrors::InvalidMarket))
    }
    
    Ok(())


}
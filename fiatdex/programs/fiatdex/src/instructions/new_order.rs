use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::consts::*;
use crate::error::CustomErrors;
use crate::program_accounts::*;
use crate::types::*;

use agnostic_orderbook::state::{SelfTradeBehavior};
use agnostic_orderbook::error::AoError;
use agnostic_orderbook::state::market_state::MarketState;

use anchor_lang::solana_program::program_error::PrintProgramError;

use agnostic_orderbook::{
    state::{
        event_queue::{EventQueue, EventQueueHeader, EventRef, FillEvent, FillEventRef, OutEvent, OutEventRef},
        AccountTag, Side as AobSide,
    },
};


#[derive(Accounts)]
pub struct NewOrder<'info> {
    pub user: Signer<'info>,
    // Program Accounts
    #[account(
        seeds = [MARKET.as_bytes(), &market.market_id, market.authority.as_ref()],
        bump = market.bump,
    )]
    pub market: Box<Account<'info, Market>>,
    #[account(
        seeds = [user.key().as_ref(), USER_ACCOUNT.as_bytes(), &market.market_id, market.authority.as_ref()],
        bump = user_account.bump,
        mut
    )]
    pub user_account: Box<Account<'info, UserAccount>>,
    // AOB Accounts
    /// CHECK: This should be owned by the program
    #[account(
        address = market.event_queue,
        owner = crate::ID,
        mut
    )]
    pub event_queue: UncheckedAccount<'info>,
    /// CHECK: This should be owned by the program
    #[account(
        address = market.bids,
        owner = crate::ID,
        mut
    )]
    pub bids: UncheckedAccount<'info>,
    /// CHECK: This should be owned by the program
    #[account(
        address = market.asks,
        owner = crate::ID,
        mut
    )]
    pub asks: UncheckedAccount<'info>,
    /// CHECK: This should be owned by the program
    #[account(
        address = market.orderbook,
        owner = crate::ID,
        mut
    )]
    pub orderbook: UncheckedAccount<'info>,
    // Token accounts
    #[account(address = market.quote_mint)]
    pub quote_mint: Box<Account<'info, Mint>>,
    #[account(
        associated_token::mint = quote_mint,
        associated_token::authority = user,
        mut
    )]
    pub user_quote: Account<'info, TokenAccount>,
    #[account(
        seeds = [QUOTE_VAULT.as_bytes(), &market.market_id, market.authority.as_ref()],
        bump = market.bumps.quote_vault,
        mut
    )]
    pub quote_vault: Account<'info, TokenAccount>,
    // Programs
    pub token_program: Program<'info, Token>,
}

impl<'info> NewOrder<'info> {
    
    pub fn transfer_user_quote(&self) -> CpiContext<'_, '_, '_, 'info, token::Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = token::Transfer {
            from: self.user_quote.to_account_info(),
            to: self.quote_vault.to_account_info(),
            authority: self.user.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }

    pub fn transfer_quote_vault(&self) -> CpiContext<'_, '_, '_, 'info, token::Transfer<'info>> {
        let program = self.token_program.to_account_info();
        let accounts = token::Transfer {
            from: self.quote_vault.to_account_info(),
            to: self.user_quote.to_account_info(),
            authority: self.market.to_account_info(),
        };
        CpiContext::new(program, accounts)
    }
}

pub fn new_order(ctx: Context<NewOrder>, side: Side, limit_price: u64, max_base_qty: u64, is_broker: bool) -> Result<()> {
    
    

    let post_only;
    let post_allowed;

    // Check the order size

    // Broker should be only a maker and other users should be always a taker
    if is_broker {
        
        (post_only, post_allowed)=(true, true);
    } else {
        
        (post_only, post_allowed)=(false, false);
    }

    msg!("is Broker?: {:?}, Side: {:?}, max base qty: {:?}, limit price in FP32: {:?}",is_broker,  side, max_base_qty, limit_price);

    let callback_info = BasicCallBack {
        user_account: ctx.accounts.user_account.key(),
    };

    let invoke_params = agnostic_orderbook::instruction::new_order::Params {
        max_base_qty: max_base_qty,
        max_quote_qty: u64::MAX,
        limit_price: limit_price,
        side: AobSide::from(side),
        match_limit: 1,
        callback_info: callback_info,
        post_only: post_only,
        post_allowed: post_allowed,
        self_trade_behavior: SelfTradeBehavior::AbortTransaction,
    };

    let mut order_summary = match 
        agnostic_orderbook::instruction::new_order::process(ctx.program_id, agnostic_orderbook::instruction::new_order::Accounts {
            market: &ctx.accounts.orderbook,
            asks: &ctx.accounts.asks,
            bids: &ctx.accounts.bids,
            event_queue: &ctx.accounts.event_queue,
        }, invoke_params,
    ) {
        Err(error) => {
            let error_display = error.print::<AoError>();
            msg!("Error: {:?}", error_display) ;
            return Err(error!(CustomErrors::InvalidOrder))
        }
        Ok(s) => s,        
    };

    let abort;
     if is_broker { // is a post only
        abort = order_summary.posted_order_id.is_none() | (order_summary.total_base_qty_posted != max_base_qty ) ;
    } else {   // is a FillOrKill
        abort = !order_summary.posted_order_id.is_none() | (order_summary.total_base_qty < max_base_qty) ; 
    }

    if abort {
        msg!(
            "The order has caused an abort, broker: {:?}",
            is_broker
        );
        return Err(error!(CustomErrors::AbortedOrder));
    }

    let user_account = &mut *ctx.accounts.user_account;

    if let Some(order_id) = order_summary.posted_order_id {
        
        user_account
            .orders
            .push(order_summary.posted_order_id.unwrap());
        user_account.number_of_orders += 1;
    }

    match side {
        Side::Bid => { // Buy Fiat for Crypto
            msg!("Bid"); 
            user_account.quote_token_locked = user_account
                .quote_token_locked
                .checked_add(order_summary.total_quote_qty)
                .unwrap();
            user_account.quote_token_as_caution_fee = user_account
                .quote_token_as_caution_fee
                .checked_add(order_summary.total_base_qty)
                .unwrap();
            let total_transfered = order_summary.total_quote_qty.checked_add(order_summary.total_base_qty).unwrap();
            msg!("Total Transfered: {:?}", total_transfered);
            token::transfer(
                ctx.accounts.transfer_user_quote(),
                total_transfered,
            )?;
        }
        Side::Ask => { // Sell Fiat for Crypto
            msg!("Ask");
            user_account.quote_token_as_caution_fee = user_account
                .quote_token_as_caution_fee
                .checked_add(order_summary.total_base_qty)
                .unwrap();
                msg!("Total Transfered: {:?}", order_summary.total_base_qty) ;
                token::transfer(
                ctx.accounts.transfer_user_quote(),
                order_summary.total_base_qty, // quote_base
            )?;
            
        }
    }

    Ok(())
}
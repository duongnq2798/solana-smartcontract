use anchor_lang::prelude::*;

use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::consts::*;
use crate::error::CustomErrors;
use crate::program_accounts::*;
use crate::types::*;

use agnostic_orderbook::state::{SelfTradeBehavior};
use agnostic_orderbook::state::market_state::MarketState;

use agnostic_orderbook::{
    error::AoError,
    state::{
        event_queue::{EventQueue, EventQueueHeader, EventRef, FillEvent, FillEventRef, OutEvent, OutEventRef},
        AccountTag, Side,
    },
};

use std::rc::Rc;

use anchor_lang::solana_program::program_error::PrintProgramError;


#[derive(Accounts)]
pub struct ConsumeOrderEvents<'info> {
    #[account(mut)]
    /// CHECK: all good
    pub event_queue: UncheckedAccount<'info>,

    #[account(mut)]
    /// CHECK: all good
    pub orderbook: UncheckedAccount<'info>,

    #[account()]
    /// CHECK: all good
    pub system_program: Program<'info, System>, // Later could be used for paying rewards and maybe transaction fee
}

pub fn consume_order_events(ctx: Context<ConsumeOrderEvents>, max_iterations: u64) -> Result<()> {
    let user_accounts: &[AccountInfo] = ctx.remaining_accounts;

    if user_accounts.is_empty() {
        msg!("No user account provided");
        return Ok(());
    }

    let mut event_queue_guard = ctx.accounts.event_queue.data.borrow_mut();

    let event_queue =
        EventQueue::<[u8; 32]>::from_buffer(&mut event_queue_guard, AccountTag::EventQueue)?;

    let mut total_iterations = 0;

    for event in event_queue.iter().take(max_iterations as usize) {
        if let Err(err) = consume_event(user_accounts, event) {
            msg!("{}", err);
            break;
        }
        total_iterations += 1;
    }
    

    Ok(())
}

fn consume_event(
    accounts_slice: &[AccountInfo],
    event: EventRef<[u8; 32]>,
) -> Result<()> {

    let mut user_accounts: Vec<&AccountInfo> = accounts_slice.iter().collect();

    user_accounts.sort_unstable_by_key(|a| a.key());

    match event {
        EventRef::Fill(FillEventRef {
            event,
            maker_callback_info,
            taker_callback_info,
        }) => {
            msg!("FILL!!: {:?}, {:?}, {:?}", event, maker_callback_info, taker_callback_info);
            
            let maker_pubkey = Pubkey::new(&maker_callback_info[..]);
            let maker_account_id = user_accounts.binary_search_by_key(&maker_pubkey, |acc| acc.key()).unwrap();

            let mut maker_account: Account<UserAccount> = Account::try_from(&user_accounts[maker_account_id])?;

            let taker_pubkey = Pubkey::new(&taker_callback_info[..]);
            let taker_account_id = user_accounts.binary_search_by_key(&taker_pubkey, |acc| acc.key()).unwrap();

            let mut taker_account: Account<UserAccount> = Account::try_from(&user_accounts[taker_account_id])?;

        }
        EventRef::Out(OutEventRef {
            event,
            callback_info,
        }) => {
            msg!("OUT!");
        }
    };
    
    Ok(())
}
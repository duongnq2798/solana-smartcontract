#![allow(warnings)]
use anchor_lang::prelude::*;

pub mod bid;
pub mod cancel;
pub mod create_cookie_cutter;
pub mod execute_sale;
pub mod sell;
pub mod constants;
pub mod errors;
pub mod state;
pub mod utils;

use crate::bid::*;
use crate::cancel::*;
use crate::create_cookie_cutter::*;
use crate::execute_sale::*;
use crate::sell::*;

use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use crate::utils::*;


declare_id!("5ZCWy1KnjskpikJGTrbRVNLw6pyRmS1GjbQfqwwqgG5X");

#[program]
pub mod cookie_cutter {
    use super::*;

    pub fn create_cookie_cutter<'info> (
        ctx: Context<'_, '_,'_,'info, CreateCookieCutter<'info>>, 
        args : CreateCookieCutterArgs
    ) -> Result<()> {

        msg!("{:?}", es_token_metadata::id());
        create_cookie_cutter::create_cookie_cutter(ctx, args)
    }

    pub fn sell <'info> (
        ctx : Context<'_, '_,'_,'info,  Sell<'info>>,
        metadata_bump : u8,
        program_as_signer_bump : u8,
        buyer_price : u64,
        token_size : u64
    ) -> Result<()>{
        msg!("metadata_bump = {:?}", metadata_bump);
        msg!("program_as_signer_bump = {:?}", program_as_signer_bump);
        msg!("buyer_price = {:?}", buyer_price);
        msg!("token_size = {:?}", token_size);

        let args = SellArgs { metadata_bump: metadata_bump, program_as_signer_bump: program_as_signer_bump, buyer_price: buyer_price, token_size: token_size};
        sell::sell(ctx, args)
    }

    pub fn bid<'info> (
        ctx : Context<'_, '_,'_,'info,  Bid<'info>>,
        buyer_price : u64,
        token_size : u64,
        escrow_payment_bump : u8,
        seller_trade_state_bump: u8
    ) -> Result<()> {
        bid::bid(ctx,buyer_price,token_size,escrow_payment_bump)
    }

    pub fn execute_sale<'info> (
        ctx : Context<'_, '_,'_,'info,  ExecuteSale<'info>>,
        program_as_signer_bump: u8,
        buyer_price: u64,
        token_size: u64,
    ) -> Result<()> {

        execute_sale::execute_sale(
            ctx,
            program_as_signer_bump,
            buyer_price,
            token_size,
        )
    }
}

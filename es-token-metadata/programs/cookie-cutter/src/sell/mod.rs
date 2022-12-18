
use anchor_lang::prelude::*;
use solana_program::program::invoke;
use spl_token::instruction::approve;
use anchor_spl::token::{Token, TokenAccount};
use es_token_metadata::constants::*;

use crate::constants::*;
use crate::state::*;


#[derive(Accounts)]
#[instruction(
    metadata_bump : u8,
    program_as_signer_bump : u8,
    buyer_price : u64,
    token_size : u64
)]
pub struct Sell <'info> {
    /// CHECK: Validated in sell_logic.
    /// User wallet account 
    #[account(mut)]
    pub wallet: Signer<'info>,

    /// SPL token account containing token for sale
    #[account(mut)]
    pub token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: validate via seeds
    /// Custom es-metadata account
    pub metadata_account: UncheckedAccount<'info>,

    /// CHECK: Validated as a signer i n sell_logic.
    /// authority account.
    #[account(mut)]
    pub authority: UncheckedAccount<'info>,

    /// Auction House instance PDA account.
    /// PDA was seeded from PREFIX + Auction house's creator + Auction house's treasury mint
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(), 
            cookie_cutter.creator.as_ref(), 
            cookie_cutter.treasury_mint.as_ref()
        ], 
        bump = cookie_cutter.bump,
        has_one = authority, 
        has_one = cookie_cutter_fee_account
    )]
    pub cookie_cutter: Box<Account<'info, CookieCutter>>,

    /// CHECK: validate via seeds
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            cookie_cutter.key().as_ref(),
            FEE_PAYER.as_bytes()
        ],
        bump = cookie_cutter.fee_payer_bump
    )]
    pub cookie_cutter_fee_account :  UncheckedAccount<'info>,

    #[account(
        init,
        seeds = [
            PREFIX.as_bytes(),
            wallet.key().as_ref(),
            cookie_cutter.key().as_ref(),
            token_account.key().as_ref(),
            cookie_cutter.treasury_mint.as_ref(),
            token_account.mint.as_ref(),
            &buyer_price.to_le_bytes(),
            &token_size.to_le_bytes()
        ],
        space = TRADE_STATE_SIZE,
        payer = wallet,
        bump
    )]
    pub seller_trade_state: Account<'info, SellerTradeState>,

     /// CHECK: Not dangerous. Account seeds checked in constraint.
     #[account(
         seeds=[
             PREFIX.as_bytes(), 
             SIGNER.as_bytes()
             ], 
        bump=program_as_signer_bump
    )]
     pub program_as_signer: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,

    pub rent: Sysvar<'info, Rent>,
}

pub fn sell<'info> (
    ctx :Context<'_, '_, '_, 'info, Sell<'info>>,
    args : SellArgs
) -> Result<()> {
    msg!("METADATA_SEED_KEY : {:?}", METADATA_SEED_KEY);
    msg!("es_token_metadata::id() : {:?}", es_token_metadata::id());
    msg!(" token_account.mint.key() : {:?}",   &ctx.accounts.token_account.mint.key());

    
    sell_logic(ctx, args)
}

pub fn sell_logic<'info> (
    ctx :Context<'_, '_, '_, 'info, Sell<'info>>,
    args : SellArgs
) -> Result<()>{
    let SellArgs {
        metadata_bump ,
        program_as_signer_bump ,
        buyer_price ,
        token_size ,
    } = args;

    // NOTE: extract all variables from ctx (Sell struct)
    let wallet = &ctx.accounts.wallet;
    let token_account = &ctx.accounts.token_account;
    let metadata_account = &ctx.accounts.metadata_account;
    let authority = &ctx.accounts.authority;
    let cookie_cutter = &ctx.accounts.cookie_cutter;
    let cookie_cutter_fee_account = &ctx.accounts.cookie_cutter_fee_account;
    let seller_trade_state = &mut ctx.accounts.seller_trade_state;
    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let rent = &ctx.accounts.rent;
    let program_as_signer = &ctx.accounts.program_as_signer;

    
    seller_trade_state.ata =  token_account.key();
    seller_trade_state.price = buyer_price;
    seller_trade_state.metadata_account = metadata_account.key();

    if wallet.is_signer {

        msg!("Delegated the transfer authority to program_as_signer");
        invoke(
            &approve(
                &token_program.key(),
                &token_account.key(),
                &program_as_signer.key(),
                &wallet.key(),
                &[],
                token_size,
            )
            .unwrap(),
            &[
                token_program.to_account_info(),
                token_account.to_account_info(),
                program_as_signer.to_account_info(),
                wallet.to_account_info(),
            ],
        )?;
    }

    
    
    Ok(())
}
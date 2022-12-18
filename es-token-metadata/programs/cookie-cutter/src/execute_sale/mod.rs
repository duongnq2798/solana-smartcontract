use anchor_lang::{
    prelude::*,
    solana_program::{program::invoke, system_instruction},
    AnchorDeserialize,
};

use anchor_spl::token::{Mint, Token, TokenAccount, };
use anchor_spl::associated_token::*;
use solana_program::program::invoke_signed;
use crate::state::*;
use crate::constants::*;
use crate::errors::*;
use crate::utils::*;

#[derive(Accounts)]
#[instruction(
    program_as_signer_bump: u8,
    buyer_price: u64,
    token_size: u64,
)]
pub struct ExecuteSale <'info> {
    /// CHECK: Validated in execute_sale_logic.
    /// Buyer's wallet account
    #[account(mut)]
    pub buyer: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Seller's wallet account
    #[account(mut)]
    pub seller: Signer<'info>,

    /// CHECK : Validated in execute_sale_logic.
    /// Token account where the SPL token is being held
    #[account(mut)]
    pub token_account: Box<Account<'info, TokenAccount>>,


    /// CHECK: Validated in execute_sale_logic.
    /// Token mint account for the SPL token.
    pub token_mint: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Metaplex metaplex account holding extra infos.
    pub metadata_account: Box<Account<'info, es_token_metadata::Metadata>>,

     /// CHECK: Not dangerous. validate via seeds check.
    /// Buyer escrow payment account.
    #[account (
        mut,
        seeds = [
            PREFIX.as_bytes(),
            cookie_cutter.key().as_ref(),
            buyer.key().as_ref()
        ],
        bump = cookie_cutter.escrow_payment_bump
    )]
    pub escrow_payment_account: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Seller SOL or SPL account to receive payment at,
    #[account(mut)]
    pub seller_payment_receipt_account: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Buyer SOL or SPL account to receive the purchased item at.
    #[account(mut)]
    pub buyer_receipt_token_account: UncheckedAccount<'info>,

    /// CHECK: Validated in execute_sale_logic.
    /// Auction House instance authority
    pub authority: Signer<'info>,

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

    /// CHECK: validate via seeds
    #[account(
        mut,
        seeds = [
            PREFIX.as_bytes(),
            cookie_cutter.key().as_ref(),
            TREASURY.as_bytes()
        ],
        bump = cookie_cutter.treasury_bump
    )]
    pub cookie_cutter_treasury: UncheckedAccount<'info>,


     /// CHECK: Not dangerous. Validate in execute_sale_logic.
    /// Buyer trade state PDA account encoding the buy order.
    #[account(mut)]
    pub buyer_trade_state:  Box<Account<'info, BuyerTradeState>>,

    /// CHECK: Not dangerous. Validate via seeds check.
    /// Seller trade state PDA account encoding the sell order.
    #[account(mut)]
    pub seller_trade_state: Box<Account<'info, SellerTradeState>>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub ata_program: Program<'info, AssociatedToken>,

    /// CHECK: Not dangerous. Validate via seeds check.
    #[account(
        seeds = [
            PREFIX.as_bytes(),
            SIGNER.as_bytes()
        ],
        bump = program_as_signer_bump
    )]
    pub program_as_signer: UncheckedAccount<'info>,

    pub rent: Sysvar<'info, Rent>,
}


pub fn execute_sale<'info>(
    ctx: Context<'_, '_, '_, 'info, ExecuteSale<'info>>,
    program_as_signer_bump: u8,
    buyer_price: u64,
    token_size: u64,
) -> Result<()> {

    // TODO: add assertions

    execute_sale_logic(
        ctx,
        program_as_signer_bump,
        buyer_price,
        token_size,
    )
}

pub fn execute_sale_logic<'info>(
    ctx: Context<'_, '_, '_, 'info, ExecuteSale<'info>>,
    program_as_signer_bump: u8,
    buyer_price: u64,
    token_size: u64,

) -> Result<()> {

    // NOTE: extract data from the context
    let buyer = &ctx.accounts.buyer;
    let seller = &ctx.accounts.seller;
    let token_account = &ctx.accounts.token_account;
    let token_mint = &ctx.accounts.token_mint;
    let metadata_account = &ctx.accounts.metadata_account;
    let seller_payment_receipt_account = &ctx.accounts.seller_payment_receipt_account;
    let buyer_receipt_token_account = &ctx.accounts.buyer_receipt_token_account;
    let escrow_payment_account = &ctx.accounts.escrow_payment_account;
    let authority = &ctx.accounts.authority;
    let cookie_cutter = &ctx.accounts.cookie_cutter;
    let cookie_cutter_fee_account = &ctx.accounts.cookie_cutter_fee_account;
    let cookie_cutter_treasury = &ctx.accounts.cookie_cutter_treasury;
    let buyer_trade_state = &ctx.accounts.buyer_trade_state;
    let seller_trade_state = &ctx.accounts.seller_trade_state;
    let token_program = &ctx.accounts.token_program;
    let system_program = &ctx.accounts.system_program;
    let ata_program = &ctx.accounts.ata_program;
    let program_as_signer = &ctx.accounts.program_as_signer;
    let rent = &ctx.accounts.rent;

    let treasury_mint = cookie_cutter.treasury_mint;

    let is_native = treasury_mint.key() == spl_token::native_mint::id();

    msg!("metadata_account data {:?}", metadata_account.data);

    if seller_trade_state.highest_bidder.is_none() {
        return Err(CookieCutterError::NoHighestBidder.into());
    }

    // TODO: add assertion
    
    // For native purchases, verify that the amount in escrow is sufficient to actually purchase the token.
    // This is intended to cover the migration from pre-rent-exemption checked accounts to rent-exemption checked accounts.
    // The fee payer makes up the shortfall up to the amount of rent for an empty account.

    let cookie_cutter_key = cookie_cutter.key();

    let seeds = [
        PREFIX.as_bytes(),
        cookie_cutter_key.as_ref(),
        FEE_PAYER.as_bytes(),
        &[cookie_cutter.fee_payer_bump],
    ];


    if is_native {
        let diff = rent_checked_sub(escrow_payment_account.to_account_info(), buyer_price)?;

        msg!("diff => {:?}", diff);

        if diff != buyer_price {
             // Return the shortfall amount (if greater than 0 but less than rent), but don't exceed the minimum rent the account should need.
             let short_fall = std::cmp::min(
                 buyer_price.checked_sub(
                     diff
                 ).ok_or(CookieCutterError::NumericalOverflow)?,
                 rent.minimum_balance(escrow_payment_account.data_len())
             );

             msg!("short_fall => {:?}", short_fall);

             msg!("Transfering from {:?} to {:?} with the amount of {:?}", cookie_cutter_fee_account.key, escrow_payment_account.key, short_fall);

             invoke_signed(&system_instruction::transfer(cookie_cutter_fee_account.key, escrow_payment_account.key, short_fall), &[
                cookie_cutter_fee_account.to_account_info(),
                escrow_payment_account.to_account_info(),
                system_program.to_account_info(),
            ], &[
                &seeds
            ])?;


            msg!("Transferation Completed");
        }

        msg!("NO TRANSFERATION");
    }

    msg!("PAYING CREATORS THE FEE...");
    // TODO: pay the creators the fee



    // TODO: pay the house 

    // TODO: pay the remaining lamport to the 
    Ok(())
}


pub fn pay_creator_fee <'info> (
    metadata: &Account<'info, es_token_metadata::Metadata>
) -> Result<(u64)> {

    // { 
    //     name: "name_str", 
    //     symbol: "symbol_str", 
    //     uri: "uri_str", 
    //     seller_fee_basis_points: 10, 
    //     share_insurance_token_amount: 0, 
    //     share_insurance_mint: None, 
    //     creators: Some([
    //             Creator { 
    //                 address: FJGgtFvujZsNvCTyDPjGfph2GFZXpsQELgmXsgZmsW48, 
    //                 verified: false, 
    //                 share: 10 
    //             }, 
    //             Creator { 
    //                 address: 6e71RfbpCJMWrWmCNBaJQLJqgEH9nfkV39nVyDRZhddc, 
    //                 verified: false, 
    //                 share: 10 
    //             }, 
    //             Creator { 
    //                 address: GjricYB1eZHSVvNmPp78K2gdRouvDW63i7Kt2AgceSq2, 
    //                 verified: false, 
    //                 share: 30 
    //             }, 
    //             Creator { 
    //                 address: Cb3XPi59iN7PuiafWYzLDKAkn2GSMWhosWMNB7zwMgUr, 
    //                 verified: false, 
    //                 share: 40 
    //             }, 
    //             Creator { 
    //                 address: HYrXAhCVuhqtnZWua5gcAyJm5MCA4mC2v5kM4WmzreH7, 
    //                 verified: false, 
    //                 share: 10 
    //             }
    //         ]
    //     ), 
    //     referrers: TO_ANOTHER_METADATA_ACCOUNT 
    // }

    // NOTE: initially add the token amount from the header metadata
    let mut total_share_insurance_token_amount = metadata.data.share_insurance_token_amount;

   
    let header_referrers = metadata.data.referrers.as_ref().unwrap();

    for reference in header_referrers {
        let current_reference_metadata = reference.address;
    }

    Ok((55))
}
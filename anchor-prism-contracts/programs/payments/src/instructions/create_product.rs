use crate::state::product::*;
use crate::modules::fees;
use crate::events::create_product_event;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

pub fn create_product(
    ctx: Context<CreateProduct>,
    product_id: u64,
    price: u64,
    cancellable: bool,
    bump: u8,
) -> Result<()> {
    ctx.accounts.product.create(
        product_id,
        ctx.accounts.merchant.key(),
        ctx.accounts.merchant_receive_token_account.key(),
        ctx.accounts.mint.key(),
        price,
        cancellable,
        bump,
    )?;
    let fee: u64 = fees::compute_fee_lamports();
    let fee_instruction = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.merchant.key(),
        &ctx.accounts.treasury.key(),
        fee,
    );
    anchor_lang::solana_program::program::invoke(
        &fee_instruction,
        &[
            ctx.accounts.merchant.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
        ],
    )?;
    create_product_event::emit(
        product_id,
        ctx.accounts.product.mint,
        ctx.accounts.product.merchant,
        ctx.accounts.product.merchant_receive_token_account,
        ctx.accounts.product.price,
        ctx.accounts.product.deleted,
        ctx.accounts.product.cancellable,
        ctx.accounts.product.bump
    )?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(product_id: u64, bump: u8)]
pub struct CreateProduct<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        signer,
        constraint = *merchant.key == merchant_receive_token_account.owner
    )]
    pub merchant: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        constraint = merchant_receive_token_account.owner == *merchant.key
    )]
    pub merchant_receive_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(
        init, 
        seeds = [
            b"product".as_ref(),
            product_id.to_string().as_bytes().as_ref()
        ],
        bump,
        payer = merchant,
        space = 8 + 40 + 40 + 60 + 60 + 60,
    )]
    pub product: Account<'info, Product>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

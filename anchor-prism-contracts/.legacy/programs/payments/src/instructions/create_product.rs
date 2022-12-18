use crate::state::infrastructure::*;
use crate::state::product::*;
use anchor_spl::token::{ Mint, TokenAccount};
use anchor_lang::prelude::*;


#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateProductPayload {
    name: String,
    description: String,
    price: u64,
    inventory: u64,
}

pub fn create_product(
    ctx: Context<CreateProduct>, 
    payload: CreateProductPayload
) -> Result<()> {
    let infrastructure: Pubkey = ctx.accounts.infrastructure.key();
    let name: Vec<u8> = payload.name.try_to_vec()?;
    let description: Vec<u8> = payload.description.try_to_vec()?;
    let currency: Pubkey = ctx.accounts.currency.key();
    let merchant_token_account: Pubkey = ctx.accounts.merchant_token_account.key();
    let inventory: u64 = payload.inventory;
    let price: u64 = payload.price;
    let bump: u8 = *ctx.bumps.get("product").unwrap();
    ctx.accounts.product.create(
        infrastructure,
        name,
        description,
        currency,
        merchant_token_account,
        price,
        inventory,
        bump,
    )?;
    Ok(())
}

#[derive(Accounts)]
pub struct CreateProduct<'info> {
    #[account(
        init, 
        seeds = [
            b"product".as_ref(),
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump, 
        payer = merchant,
        space = 8 + 40 + 40 + 60 + 60 + 60,
        constraint = infrastructure.authority == *merchant.key
    )]
    pub product: Account<'info, Product>,
    #[account(
        mut,
        seeds = [
            b"infrastructure".as_ref(),
            merchant.key().as_ref()
        ],
        bump = infrastructure.bump
    )]
    pub infrastructure: Account<'info, Infrastructure>,
    pub currency: Account<'info, Mint>,
    pub merchant_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub merchant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

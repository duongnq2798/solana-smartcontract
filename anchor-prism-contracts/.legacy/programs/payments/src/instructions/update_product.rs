use crate::state::infrastructure::*;
use crate::state::product::*;
// use crate::errors::ProgramError;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateProductPayload {
    name: String,
    description: String,
    active: bool,
    price: u64,
    inventory: u64,
}

pub fn update_product(ctx: Context<UpdateProduct>, payload: UpdateProductPayload) -> Result<()> {
    let name: Vec<u8> = payload.name.try_to_vec()?;
    let description: Vec<u8> = payload.description.try_to_vec()?;
    let _ = ctx.accounts.product.update(
        name,
        description,
        payload.active,
        payload.price,
        payload.inventory,
    );
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateProduct<'info> {
    #[account(
        mut,
        seeds = [
            b"infrastructure",
            merchant.key().as_ref()
        ],
        bump = infrastructure.bump
    )]
    pub infrastructure: Account<'info, Infrastructure>,
    #[account(
        mut,
        seeds = [
            b"product",
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump = product.bump
    )]
    pub product: Account<'info, Product>,
    #[account(mut)]
    pub merchant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

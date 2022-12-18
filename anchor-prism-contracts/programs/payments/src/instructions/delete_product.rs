use crate::state::product::*;
use crate::events::delete_product_event;
use anchor_lang::prelude::*;

pub fn delete_product(
    ctx: Context<DeleteProduct>,
    product_id: u64
) -> Result<()> {
    ctx.accounts.product.delete()?;
    delete_product_event::emit(
        product_id,
        ctx.accounts.product.mint,
        ctx.accounts.product.merchant,
        ctx.accounts.product.merchant_receive_token_account,
        ctx.accounts.product.price,
        ctx.accounts.product.deleted,
        ctx.accounts.product.cancellable,
        ctx.accounts.product.bump,
    )?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(product_id: u64)]
pub struct DeleteProduct<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        signer,
        constraint = *merchant.key == product.merchant
    )]
    pub merchant: AccountInfo<'info>,
    #[account(
        mut, 
        seeds = [
            b"product".as_ref(),
            product_id.to_string().as_bytes().as_ref()
        ],
        bump = product.bump,
        constraint = product.merchant == *merchant.key,
        constraint = product.deleted == false,
    )]
    pub product: Account<'info, Product>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>
}

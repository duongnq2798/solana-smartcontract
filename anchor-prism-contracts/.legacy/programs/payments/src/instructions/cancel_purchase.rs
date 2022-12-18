use crate::state::infrastructure::*;
use crate::state::product::*;
use crate::state::product_escrow::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, TokenAccount, Transfer, Token};

pub fn cancel_purchase(ctx: Context<CancelPurchase>) -> Result<()> {
    token::transfer(
        ctx.accounts.into_transfer_to_customer_context(),
        ctx.accounts.product_escrow.amount,
    )?;
    token::close_account(ctx.accounts.into_close_account_context())?;
    ctx.accounts.product_escrow.mark_cancelled()?;
    Ok(())
}

#[derive(Accounts)]
pub struct CancelPurchase<'info> {
    #[account(
        mut, 
        seeds = [
            b"product",
            infrastructure.key().as_ref(),
            infrastructure.authority.as_ref()
        ],
        bump = product.bump
    )]
    pub product: Account<'info, Product>,
    #[account(
        mut,
        seeds = [
            b"infrastructure",
            infrastructure.key().as_ref(),
            infrastructure.authority.as_ref()
        ],
        bump = infrastructure.bump
    )]
    pub infrastructure: Account<'info, Infrastructure>,
    #[account(mut)]
    pub customer: Signer<'info>,
    #[account(mut)]
    pub customer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = product_escrow.customer == *customer.key,
        constraint = product_escrow.customer_token_account == * customer_token_account.to_account_info().key,
        constraint = product_escrow.delivered == false, // product has not been delivered
        constraint = product_escrow.cancelled == false, // product has not been cancelled
        constraint = product_escrow.refunded == false // product has not been refunded
    )]
    pub product_escrow: Account<'info, ProductEscrow>,
    pub token_program: Program<'info, Token>,
}

impl<'info> CancelPurchase<'info> {
    fn into_transfer_to_customer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.customer_token_account.to_account_info(),
            authority: self.vault.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }

    fn into_close_account_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.customer.to_account_info(),
            authority: self.vault.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info().clone(), cpi_accounts)
    }
}

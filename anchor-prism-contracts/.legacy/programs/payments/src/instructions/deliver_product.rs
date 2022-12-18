use crate::state::infrastructure::*;
use crate::state::product::*;
use crate::state::product_escrow::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, CloseAccount, Transfer, Token};

pub fn deliver_product(ctx: Context<DeliverProduct>) -> Result<()> {
    token::transfer(
        ctx.accounts.into_transfer_to_merchant_context(),
        ctx.accounts.product_escrow.amount,
    )?;
    token::close_account(ctx.accounts.into_close_context())?;
    ctx.accounts.product_escrow.mark_delivered()?;
    Ok(())
}

#[derive(Accounts)]
pub struct DeliverProduct<'info> {
    #[account(
        seeds = [
            b"infrastructure",
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump = infrastructure.bump,
        constraint = infrastructure.authority == merchant.key() // infrastructure authority must match supplied merchant 
    )]
    pub infrastructure: Box<Account<'info, Infrastructure>>,
    #[account(
        seeds = [
            b"product",
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump = product.bump,
        constraint = product.infrastructure == infrastructure.key() // product infrastructure must match supplied infrastructure
    )]
    pub product: Box<Account<'info, Product>>,
    /// CHECK: Figure this out later
    #[account(mut)]
    pub customer: AccountInfo<'info>,
    pub customer_token_account: Account<'info, TokenAccount>,
    /// CHECK: Figure this out later
    #[account(signer)]
    pub merchant: AccountInfo<'info>,
    pub merchant_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = product_escrow.customer == *customer.key, // escrow customer pubkey is same as signer (customer)
        constraint = product_escrow.customer_token_account == *customer_token_account.to_account_info().key, // escrow customer token account is same as supplied  customer token account
        constraint = product_escrow.merchant == *merchant.key, // escrow merchant pubkey is same as supplied merchant
        constraint = product_escrow.merchant_token_account == *merchant_token_account.to_account_info().key, // escrow merchant token account is same as supplied merchant token account
        constraint = product_escrow.delivered == false // escrow account must be in shipping status
    )]
    pub product_escrow: Account<'info, ProductEscrow>,
    #[account(
        mut,
        seeds = [
            b"vault",
            infrastructure.key().as_ref(),
            product.key().as_ref(),
            product_escrow.key().as_ref(),
            merchant.key().as_ref(),
            customer.key().as_ref(),
        ],
        bump = product_escrow.bump
    )]
    pub vault: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

impl<'info> DeliverProduct<'info> {
    fn into_transfer_to_merchant_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info(),
            to: self.merchant_token_account.to_account_info(),
            authority: self.vault.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.customer.to_account_info(),
            authority: self.vault.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

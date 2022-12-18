use crate::state::infrastructure::*;
use crate::state::product::*;
use crate::state::product_escrow::*;
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use anchor_spl::token::{self, CloseAccount, Transfer, Token};

pub fn refund_purchase(ctx: Context<RefundPurchase>) -> Result<()> {
    token::transfer(
        ctx.accounts.into_transfer_to_seller_context(),
        ctx.accounts.product_escrow.amount,
    )?;
    token::close_account(ctx.accounts.into_close_context())?;
    ctx.accounts.product_escrow.mark_refunded()?;
    Ok(())
}

#[derive(Accounts)]
pub struct RefundPurchase<'info> {
    #[account(
        seeds = [
            b"infrastructure",
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump = infrastructure.bump,
        constraint = infrastructure.authority == merchant.key(), // merchant supplied matches infrastructure authority supplied.
        constraint = infrastructure.authority == merchant_token_account.owner, // Checks that the supplied merchant token account belongs to the infrastructures' authority.
        constraint = customer.key() == customer_token_account.owner // Checks that the supplied customer token account belongs to the signer (customer)
    )]
    pub infrastructure: Account<'info, Infrastructure>,
    #[account(
        seeds = [
            b"product",
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump = product.bump,
        constraint = product.infrastructure == infrastructure.key() // product supplied belongs to infrastructure supplied.
    )]
    pub product: Account<'info, Product>,
    /// CHECK: Figure this out later
    pub customer: AccountInfo<'info>,
    pub customer_token_account: Account<'info, TokenAccount>,
    #[account(signer)]
    /// CHECK: Figure this out later
    pub merchant: AccountInfo<'info>,
    pub merchant_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = product_escrow.customer_token_account == *customer_token_account.to_account_info().key,
        constraint = product_escrow.customer == *customer.key,
        constraint = product_escrow.merchant_token_account == *merchant_token_account.to_account_info().key,
        constraint = product_escrow.merchant == *merchant.key,
        constraint = product_escrow.cancelled == false, // escrow is not cancelled.
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
        bump
    )]
    vault: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>
}

impl<'info> RefundPurchase<'info> {
    fn into_transfer_to_seller_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault.to_account_info().clone(),
            to: self.merchant_token_account.to_account_info().clone(),
            authority: self.vault.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault.to_account_info().clone(),
            destination: self.customer.clone(),
            authority: self.vault.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

use crate::state::payment::*;
use crate::state::product::*;
use crate::events::cancel_purchase_event;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, TokenAccount, Transfer};

pub fn cancel_purchase(ctx: Context<CancelPurchase>, _product_id: u64) -> Result<()> {
    let (_vault_authority, vault_authority_bump) =
        Pubkey::find_program_address(&[b"payment"], ctx.program_id);
    let authority_seeds = &[&b"payment"[..], &[vault_authority_bump]];
    token::transfer(
        ctx.accounts
            .into_transfer_from_vault_to_customer_context()
            .with_signer(&[&authority_seeds[..]]),
        ctx.accounts.payment.amount,
    )?;
    token::close_account(
        ctx.accounts
            .into_close_context()
            .with_signer(&[&authority_seeds[..]]),
    )?;
    ctx.accounts.payment.cancelled = true;
    cancel_purchase_event::emit(
        ctx.accounts.payment.product_id,
        ctx.accounts.payment.order_id,
        ctx.accounts.payment.merchant,
        ctx.accounts.payment.merchant_receive_token_account,
        ctx.accounts.payment.customer,
        ctx.accounts.payment.customer_deposit_token_account,
        ctx.accounts.payment.currency,
        ctx.accounts.payment.amount,
        ctx.accounts.payment.delivered,
        ctx.accounts.payment.cancelled,
        ctx.accounts.payment.refunded,
    )?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(product_id: u64)]
pub struct CancelPurchase<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut, 
        signer,
        constraint = *customer.key == customer_deposit_token_account.owner,
        constraint = *customer.key == payment.customer, 
    )]
    pub customer: AccountInfo<'info>,

    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_authority: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = customer_deposit_token_account.owner == *customer.key,
        constraint = customer_deposit_token_account.owner == payment.customer
    )]
    pub customer_deposit_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = payment.product_id == product_id,
        constraint = payment.merchant == product.merchant,
        constraint = payment.currency == product.mint,
        constraint = payment.customer == *customer.key,
        constraint = payment.customer == payment.customer,
        constraint = payment.delivered == false,
        constraint = payment.cancelled == false,
        constraint = payment.refunded == false
    )]
    pub payment: Box<Account<'info, Payment>>,
    
    #[account(
        mut,
        seeds = [
            b"product",
            product_id.to_string().as_ref(),
        ],
        bump = product.bump,
        constraint = product.merchant == payment.merchant,
        constraint = product.mint == payment.currency,
        constraint = product.cancellable == true,
    )]
    pub product: Box<Account<'info, Product>>,
    
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

impl<'info> CancelPurchase<'info> {
    fn into_transfer_from_vault_to_customer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self
                .customer_deposit_token_account
                .to_account_info()
                .clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_close_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.vault_account.to_account_info().clone(),
            destination: self.customer.clone(),
            authority: self.vault_authority.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}
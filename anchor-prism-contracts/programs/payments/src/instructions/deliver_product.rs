use crate::state::payment::*;
use crate::state::product::*;
use crate::events::deliver_product_event;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, TokenAccount, Transfer};

pub fn deliver_product(ctx: Context<DeliverProduct>, _product_id: u64) -> Result<()> {
    let (_vault_authority, vault_authority_bump) =
        Pubkey::find_program_address(&[b"payment"], ctx.program_id);
    let authority_seeds = &[&b"payment"[..], &[vault_authority_bump]];
    token::transfer(
        ctx.accounts
            .into_transfer_from_vault_to_merchant_context()
            .with_signer(&[&authority_seeds[..]]),
        ctx.accounts.payment.amount,
    )?;
    token::close_account(
        ctx.accounts
            .into_close_context()
            .with_signer(&[&authority_seeds[..]]),
    )?;
    ctx.accounts.payment.delivered = true;
    deliver_product_event::emit(
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
pub struct DeliverProduct<'info> {
    #[account(
        signer,
        constraint = *merchant.key == payment.merchant,
        constraint = *merchant.key == merchant_receive_token_account.owner
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub merchant: AccountInfo<'info>,
    #[account(
        mut,
        constraint = merchant_receive_token_account.owner == *merchant.key
    )]
    pub merchant_receive_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub customer: AccountInfo<'info>,
    #[account(
        mut,
        constraint = payment.product_id == product_id,
        constraint = payment.merchant == product.merchant,
        constraint = payment.currency == product.mint,
        constraint = payment.customer == *customer.key,
        constraint = payment.merchant == *merchant.key,
        constraint = payment.delivered == false,
        constraint = payment.refunded == false,
        constraint = payment.cancelled == false,
        // close = customer
    )]
    pub payment: Box<Account<'info, Payment>>,
    #[account(
        mut,
        seeds = [
            b"product",
            product_id.to_string().as_ref(),
        ],
        bump = product.bump,
        constraint = product.product_id == product_id,
        constraint = product.merchant == payment.merchant,
        constraint = product.mint == payment.currency,
        constraint = product.merchant == *merchant.key,
    )]
    pub product: Box<Account<'info, Product>>,
    #[account(mut)]
    pub vault_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub vault_authority: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

impl<'info> DeliverProduct<'info> {

    fn into_transfer_from_vault_to_merchant_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.vault_account.to_account_info().clone(),
            to: self
                .merchant_receive_token_account
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
use crate::state::payment::*;
use crate::state::product::*;
use anchor_lang::prelude::*;
use crate::events::purchase_product_event;
use anchor_spl::token::{self, Mint, SetAuthority, TokenAccount, Transfer};
use spl_token::instruction::AuthorityType;

pub fn purchase_product(
    ctx: Context<PurchaseProduct>,
    order_id: u64,
    product_id: u64,
    _price: u64,
    _vault_account_bump: u8) -> Result<()> {
    ctx.accounts.payment.create(
        product_id,
        order_id,
        ctx.accounts.product.merchant,
        ctx.accounts.product.merchant_receive_token_account,
        ctx.accounts.customer.key(),
        ctx.accounts.customer_deposit_token_account.key(),
        ctx.accounts.product.mint,
        ctx.accounts.product.price,
    )?;
    let (vault_authority, _vault_authority_bump) =
        Pubkey::find_program_address(&[b"payment"], ctx.program_id);
    token::set_authority(
        ctx.accounts.into_set_authority_context(),
        AuthorityType::AccountOwner,
        Some(vault_authority),
    )?;
    token::transfer(
        ctx.accounts.into_transfer_from_customer_to_vault_context(),
        ctx.accounts.product.price,
    )?;
    purchase_product_event::emit(
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
#[instruction(order_id: u64, product_id: u64, price: u64, vault_account_bump: u8)]
pub struct PurchaseProduct<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        constraint = *merchant.key == merchant_receive_token_account.owner
    )]
    pub merchant: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        constraint = merchant_receive_token_account.owner == *merchant.key
    )]
    pub merchant_receive_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut, 
        signer,
        constraint = *customer.key == customer_deposit_token_account.owner
    )]
    pub customer: AccountInfo<'info>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        seeds = [
            b"token-vault".as_ref(),
            product_id.to_string().as_ref(),
            order_id.to_string().as_ref(),
        ],
        bump,
        payer = customer,
        token::mint = mint,
        token::authority = customer,
    )]
    pub vault_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = customer_deposit_token_account.amount >= price,
        constraint = customer_deposit_token_account.owner == *customer.key
    )]
    pub customer_deposit_token_account: Account<'info, TokenAccount>,
    #[account(zero)]
    pub payment: Box<Account<'info, Payment>>,
    #[account(
        mut,
        seeds = [
            b"product",
            product_id.to_string().as_ref(),
        ],
        bump = product.bump,
        constraint = product.deleted == false,
        constraint = product.price == price,
        constraint = product.mint == mint.key(),
        constraint = product.merchant == *merchant.key,
    )]
    pub product: Box<Account<'info, Product>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub system_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_program: AccountInfo<'info>,
}

impl<'info> PurchaseProduct<'info> {
    fn into_transfer_from_customer_to_vault_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self
                .customer_deposit_token_account
                .to_account_info()
                .clone(),
            to: self.vault_account.to_account_info().clone(),
            authority: self.customer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.vault_account.to_account_info().clone(),
            current_authority: self.customer.clone(),
        };
        CpiContext::new(self.token_program.clone(), cpi_accounts)
    }
}
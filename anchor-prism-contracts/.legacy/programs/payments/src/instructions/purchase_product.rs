use crate::state::infrastructure::*;
use crate::state::product::*;
use crate::state::product_escrow::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, SetAuthority, TokenAccount, Transfer};
use spl_token::instruction::AuthorityType;

pub fn purchase_product(ctx: Context<PurchaseProduct>) -> Result<()> {
    let bump: u8 = *ctx.bumps.get("vault").unwrap();
    let amount: u64 = ctx.accounts.product.price;
    let customer: Pubkey = ctx.accounts.customer.key();
    let customer_token_account: Pubkey = ctx.accounts.customer_token_account.key();
    let merchant: Pubkey = ctx.accounts.merchant.key();
    let merchant_token_account: Pubkey = ctx.accounts.merchant_token_account.key();
    ctx.accounts.product_escrow.create(
        customer,
        customer_token_account,
        merchant,
        merchant_token_account,
        amount,
        bump
    )?;
    token::set_authority(
        ctx.accounts.into_set_authority_context(),
        AuthorityType::AccountOwner,
        Some(ctx.accounts.vault.key())
    )?;
    token::transfer(
        ctx.accounts.into_transfer_to_pda_context(),
        ctx.accounts.product_escrow.amount,
    )?;
    ctx.accounts.product.decrease_inventory(1)?;
    Ok(())
}

#[derive(Accounts)]
pub struct PurchaseProduct<'info> {
    #[account(
        mut,
        seeds = [
            b"infrastructure",
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump = infrastructure.bump,
        // constraint = infrastructure.authority == merchant.key(), // merchant supplied matches infrastructure authority supplied.
        // constraint = infrastructure.authority == merchant_token_account.owner, // Checks that the supplied merchant token account belongs to the infrastructures' authority.
        // constraint = customer.key() == customer_token_account.owner // Checks that the supplied customer token account belongs to the signer (customer)
    )]
    pub infrastructure: Box<Account<'info, Infrastructure>>,
    #[account(
        mut,
        seeds = [
            b"product",
            infrastructure.key().as_ref(),
            merchant.key().as_ref()
        ],
        bump = product.bump,
        // constraint = product.infrastructure == infrastructure.key() // product supplied belongs to infrastructure supplied.
    )]
    pub product: Box<Account<'info, Product>>,
    /// CHECK: Figure this out later
    #[account(mut, signer)]
    pub customer: AccountInfo<'info>,
    /// CHECK: Figure this out later
    #[account(mut)]
    pub merchant: AccountInfo<'info>,
    #[account(mut)]
    pub currency: Account<'info, Mint>,
    #[account(
        init,
        seeds = [
            b"vault",
            infrastructure.key().as_ref(),
            product.key().as_ref(),
            merchant.key().as_ref(),
            customer.key().as_ref(),
        ],
        bump,
        payer = customer, 
        token::mint = currency,
        token::authority = customer,
        // constraint = product.price > 0, // The product's price must be greater than 0.
        // constraint = product.currency == customer_token_account.mint, // The product's currency must match the customer's supplied token account.
        // constraint = product.currency == merchant_token_account.mint, // The product's currency must match the customer's supplied merchant token account.
    )]
    vault: Account<'info, TokenAccount>,
    #[account(
        mut, 
        constraint = customer_token_account.amount >= product.price // checks that customer token account has enough tokens to purchase product.
    )]
    pub customer_token_account: Account<'info, TokenAccount>,
    pub merchant_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        seeds = [
            b"product_escrow",
            infrastructure.key().as_ref(),
            product.key().as_ref(),
            merchant.key().as_ref(),
            customer.key().as_ref(),
        ],
        bump,
        payer = customer,
        space = 40 + 40 + 40 + 40 + 40
    )]
    pub product_escrow: Box<Account<'info, ProductEscrow>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>
}


impl<'info> PurchaseProduct<'info> {

    fn into_set_authority_context(&self) -> CpiContext<'_, '_, '_, 'info, SetAuthority<'info>> {
        let cpi_accounts = SetAuthority {
            account_or_mint: self.vault.to_account_info().clone(),
            current_authority: self.customer.to_account_info().clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    fn into_transfer_to_pda_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.customer_token_account.to_account_info().clone(),
            to: self.vault.to_account_info().clone(),
            authority: self.customer.clone(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

}
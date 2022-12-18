use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::{CloseAccount, Mint, Token, TokenAccount, Transfer}};

declare_id!("SCFgJXMztHKD3iPPtQpo4P8uGKRn9GWu1zhkeJ6fQTZ");

#[program]
// Create a function that initializes an Escrow
// Escrow will have price of the NFT
// Escrow will have the payment mint
// Buyer will pay using price and payment mint info
// Payment will be split between the owner's ATA and the company ATA
// Buyer can close account
// Seller can retrieve SPL token if it doesn't work out.
 
pub mod nft_escrow_spl {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.mint_address = ctx.accounts.nft_mint.key();
        escrow_account.owner_address = ctx.accounts.owner.key();
        escrow_account.payment_token_mint = ctx.accounts.currency_token.key();
        escrow_account.company_account_address = ctx.accounts.company_token_address.key();
        Ok(())
    }

    pub fn list_collectible(ctx: Context<ListCollectible>, price:u64, company_account: Pubkey) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;
        escrow_account.price = price;
        escrow_account.company_account_address = company_account;
        msg!("starting tokens: {}", ctx.accounts.nft_token_account.amount);

        let ix = Transfer {
            from: ctx.accounts.nft_mint.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.owner.to_account_info()
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();

        let cpi_ctx = CpiContext::new(cpi_program, ix);

        anchor_spl::token::transfer(cpi_ctx, 1)?;
        ctx.accounts.nft_token_account.reload()?;
        msg!("ending tokens: {}", ctx.accounts.nft_token_account.amount);

        Ok(())
    }

    pub fn buy_collectible(ctx: Context<BuyCollectible>, lock_account_bump: u8, escrow_token_bump: u8) -> Result<()>{
        let escrow_account = &mut ctx.accounts.escrow_account;
        
        let due_company = (escrow_account.price * 4)/100; //4% marketplace fee

        let due_seller = escrow_account.price - due_company; //96% to the customer

        if ctx.accounts.seller.key() != escrow_account.owner_address {
            return Err(error!(ErrorCode::InvalidSeller))
        }

        let first_tx = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.company_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };

        let second_tx = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };

        let cpi_ctx1 = CpiContext::new(ctx.accounts.token_program.to_account_info(), first_tx);
        let cpi_ctx2 = CpiContext::new(ctx.accounts.token_program.to_account_info(), second_tx);
        anchor_spl::token::transfer(cpi_ctx1, due_company)?;
        anchor_spl::token::transfer(cpi_ctx2, due_seller)?;

        let mint = ctx.accounts.nft_mint.key();
        let bump_vector = lock_account_bump.to_le_bytes();
        let inner = vec![
            b"owner".as_ref(),
            ctx.accounts.seller.key.as_ref(),
            mint.as_ref(),
            bump_vector.as_ref(),
        ];
        let outer = vec![inner.as_slice()];
        let nft_transfer_ix = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.buyer_nft_token_account.to_account_info(),
            authority: escrow_account.to_account_info()
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            nft_transfer_ix, 
            outer.as_slice());

        // Execute anchor's helper function to transfer tokens
        anchor_spl::token::transfer(cpi_ctx, 1)?;

        let close_account_ix = CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info().clone(),
            destination: ctx.accounts.seller.to_account_info().clone(),
            authority: ctx.accounts.escrow_account.to_account_info().clone(), 
        };
        
        let new_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            close_account_ix, 
            outer.as_slice());
        
        anchor_spl::token::close_account(new_cpi_ctx)?;

        Ok(())
    }

    pub fn cancel_escrow(ctx: Context<CancelEscrow>, lock_account_bump: u8, escrow_token_bump: u8) -> Result<()> {
        let escrow_account = &mut ctx.accounts.escrow_account;

        let mint = ctx.accounts.nft_mint.key();
        let bump_vector = lock_account_bump.to_le_bytes();
        let inner = vec![
            b"owner".as_ref(),
            ctx.accounts.owner.key.as_ref(),
            mint.as_ref(),
            bump_vector.as_ref(),
        ];
        let outer = vec![inner.as_slice()];
        let nft_transfer_ix = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.owner.to_account_info(),
            authority: escrow_account.to_account_info()
        };

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), 
            nft_transfer_ix, 
            outer.as_slice());

        // Execute anchor's helper function to transfer tokens
        anchor_spl::token::transfer(cpi_ctx, 1)?;

        let close_account_ix = CloseAccount {
            account: ctx.accounts.escrow_token_account.to_account_info().clone(),
            destination: ctx.accounts.owner.to_account_info().clone(),
            authority: ctx.accounts.escrow_account.to_account_info().clone(), 
        };
        
        let new_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            close_account_ix, 
            outer.as_slice());
        
        anchor_spl::token::close_account(new_cpi_ctx)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    //create your respective PDA's
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(init, payer = owner, space=8+32+32+32+32+8, seeds=[b"owner",owner.key().as_ref(),nft_mint.key().as_ref()], bump)]
    pub escrow_account: Account<'info, HolderAccount>,
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    #[account(init, payer = owner, seeds=[b"token",owner.key().as_ref(),nft_mint.key().as_ref()], bump, token::mint = nft_mint, token::authority=escrow_account)]
    pub escrow_token_account: Account<'info, TokenAccount>,    

    pub currency_token: Account<'info, Mint>, //USDC

    #[account(mut)]
    /// CHECK: Does not need to be demoralized
    pub company_token_address: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(lock_account_bump: u8, escrow_token_bump: u8)]
pub struct ListCollectible<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, seeds=[b"owner",owner.key().as_ref(),nft_mint.key().as_ref()],bump = lock_account_bump)]
    pub escrow_account:Account<'info, HolderAccount>,
    #[account(mut, seeds=[b"token",owner.key().as_ref(),nft_mint.key().as_ref()],bump = escrow_token_bump)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub nft_mint: Account<'info, Mint>,

    #[account(mut)]
    pub nft_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(lock_account_bump: u8, escrow_token_bump: u8)]
pub struct BuyCollectible<'info> {
    #[account(signer)]
    /// CHECK: Buyer is the signer, and thus payer.
    pub buyer: AccountInfo<'info>,

    #[account(mut, seeds=[b"owner",seller.key().as_ref(),nft_mint.key().as_ref()],bump = lock_account_bump)]
    pub escrow_account: Box<Account<'info, HolderAccount>>,

    #[account(mut, seeds = [b"token", seller.key().as_ref(), nft_mint.key().as_ref()], bump = escrow_token_bump)]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    ///CHECK:
    pub seller: AccountInfo<'info>,

    #[account(mut)]
    pub nft_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub buyer_nft_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub payment_token_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub buyer_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub seller_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub company_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub mint_address: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(lock_account_bump: u8, escrow_token_bump: u8)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut, seeds=[b"owner",owner.key().as_ref(),nft_mint.key().as_ref()],bump = lock_account_bump)]
    pub escrow_account: Box<Account<'info, HolderAccount>>,

    #[account(mut, seeds = [b"token", owner.key().as_ref(), nft_mint.key().as_ref()], bump = escrow_token_bump)]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub nft_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub nft_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}


// #[account]
// pub struct HolderAccount {
//     pub owner_address: Pubkey, //32 bytes
//     pub mint_address: Pubkey, //32 bytes
//     pub payment_token_mint: Pubkey, //32 bytes
//     pub company_account_address: Pubkey, //32 bytes
//     pub price: u64 //8 bytes
// }

#[account]
pub struct HolderAccount {
    pub owner_address: Pubkey, //32 bytes
    pub mint_address: Pubkey, //32 bytes
    pub payment_token_mint: Pubkey, //32 bytes
    pub company_account_address: Pubkey, //32 bytes
    pub price: u64 //8 bytes
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid seller account, please send the right account again")]
    InvalidSeller
}



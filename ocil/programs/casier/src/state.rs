use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(
        seeds = [ b"config".as_ref() ],
        bump,
        has_one = admin,
        constraint = !config.is_frozen
    )]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [ owner.key().as_ref() ],
        bump,
        has_one = owner,
    )]
    pub locker: Account<'info, Locker>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        has_one = owner,
        has_one = mint,
    )]
    pub user_ta: Account<'info, TokenAccount>,
    #[account(mut)]
    /// CHECK:
    pub vault_ta: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        seeds = [ b"config".as_ref() ],
        bump,
        has_one = admin,
        constraint = !config.is_frozen
    )]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [ owner.key().as_ref() ],
        bump,
        has_one = owner,
    )]
    pub locker: Account<'info, Locker>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut)]
    /// CHECK:
    pub user_ta: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = mint,
        constraint = vault_ta.owner == vault_ta.key(),
    )]
    pub vault_ta: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawAndBurn<'info> {
    #[account(
        seeds = [ b"config".as_ref() ],
        bump,
        has_one = admin,
        constraint = !config.is_frozen
    )]
    pub config: Account<'info, Config>,
    #[account(
        mut,
        seeds = [ owner.key().as_ref() ],
        bump,
        has_one = owner,
    )]
    pub locker: Account<'info, Locker>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(mut)]
    /// CHECK:
    pub user_ta: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK:
    pub burn_ta: UncheckedAccount<'info>,
    #[account(
        mut,
        has_one = mint,
        constraint = vault_ta.owner == vault_ta.key(),
    )]
    pub vault_ta: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InitConfig<'info> {
    #[account(
        init,
        seeds = [ b"config".as_ref() ],
        bump,
        payer = fee_payer,
        space = 8 + 32 + 1
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub fee_payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_space: u64)]
pub struct InitLocker<'info> {
    #[account(
        init,
        seeds = [ owner.key().as_ref() ],
        bump,
        payer = owner,
        space = _space as usize
    )]
    pub locker: Account<'info, Locker>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(_space: u64)]
pub struct IncreaseLockerSize {
    // #[account(
//     mut,
//     seeds = [ fee_payer.key().as_ref() ],
//     bump,
//     realloc = _space
//     payer = fee_payer,
//     space = _space as usize
// )]
// locker: Account<'info, Locker>,
// #[account(mut)]
// fee_payer: Signer<'info>,
// system_program: Program<'info, System>,
// rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(Default)]
pub struct Config {
    pub admin: Pubkey,
    pub is_frozen: bool,
}
#[account]
#[derive(Default)]
pub struct Locker {
    pub owner: Pubkey,
    pub mints: Vec<Pubkey>,
    pub amounts: Vec<u32>,
    pub version: u8,
    pub space: u64,
}

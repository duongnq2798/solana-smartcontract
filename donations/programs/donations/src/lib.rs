use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    system_instruction::transfer,
    program::invoke,
};

declare_id!("don2A9YodeAqq83ZGUjrXWTvjFBD7FeTUDQMA8XRX3Z");

#[program]
pub mod donations {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let donation_platform = &mut ctx.accounts.donation_platform;
        donation_platform.authority = ctx.accounts.authority.key();
        donation_platform.amount = 0;
        donation_platform.counter = 0;
        
        let donators = &mut ctx.accounts.donators;
        donators.donators = vec![];

        msg!("Donation platform is initialized");

        Ok(())
    }

    pub fn donate(ctx: Context<Donate>, _id: u64, amount: u64) -> Result<()> {
        require!(amount > 0, DonationError::InvalidLamportsAmount);

        let authority = &ctx.accounts.authority;
        let donation_platform = &ctx.accounts.donation_platform;

        invoke(
            &transfer(&authority.key(), &donation_platform.key(), amount),
            &[authority.to_account_info(), donation_platform.to_account_info()]
        )?;

        msg!("{:?} successfully donated {} lamports to {:?}", authority.key(), amount, donation_platform.key());

        let donation = &mut ctx.accounts.donation;
        let donation_platform = &mut ctx.accounts.donation_platform;

        donation.authority = authority.key();
        donation.amount = amount;
        donation_platform.amount += amount;
        donation_platform.counter += 1;

        let donators = &mut ctx.accounts.donators;
        let (mut found, mut idx) = (false, 0);

        for (i, dntr) in donators.donators.iter().enumerate() {
            if dntr.authority == donation.authority {
                found = true;
                idx = i;
                break;
            }
        }

        if found {
            donators.donators[idx].amount += donation.amount;
        } else {
            donators.donators.push(Donator {
                authority: donation.authority,
                amount: donation.amount
            });
        }

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let donation_platform = &mut ctx.accounts.donation_platform;
        let amount = donation_platform.amount;
        require!(amount > 0, DonationError::NoDonations);

        let from = donation_platform.to_account_info();
        let to = ctx.accounts.authority.to_account_info();

        **from.try_borrow_mut_lamports()? -= amount;
        **to.try_borrow_mut_lamports()? += amount;

        donation_platform.amount = 0;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = DonationPlatform::SIZE,
        seeds = [b"donation_platform", authority.key().as_ref()],
        bump
    )]
    pub donation_platform: Account<'info, DonationPlatform>,
    #[account(
        init,
        payer = authority,
        space = Donators::SIZE,
        seeds = [b"donators", authority.key().as_ref()],
        bump
    )]
    pub donators: Account<'info, Donators>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct Donate<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = Donation::SIZE,
        seeds = [b"donation", donation_platform.key().as_ref(), id.to_string().as_bytes()],
        bump
    )]
    pub donation: Account<'info, Donation>,
    #[account(
        mut,
        seeds = [b"donation_platform", donation_platform.authority.key().as_ref()],
        bump
    )]
    pub donation_platform: Account<'info, DonationPlatform>,
    #[account(
        mut,
        seeds = [b"donators", donation_platform.authority.key().as_ref()],
        bump
    )]
    pub donators: Account<'info, Donators>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
        seeds = [b"donation_platform", donation_platform.authority.key().as_ref()],
        bump
    )]
    pub donation_platform: Account<'info, DonationPlatform>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DonationPlatform {
    pub authority: Pubkey,
    pub amount: u64,
    pub counter: u64,
}

impl DonationPlatform {
    pub const SIZE: usize = 8 + 32 + 8 + 8;
}

#[account]
pub struct Donation {
    pub authority: Pubkey,
    pub amount: u64,
}

impl Donation {
    pub const SIZE: usize = 8 + 32 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct Donator {
    pub authority: Pubkey,
    pub amount: u64,
}

#[account]
pub struct Donators {
    pub donators: Vec<Donator>
}

impl Donators {
    pub const MAX_DONATORS: usize = 100;
    pub const SIZE: usize = 8 + 4 + (32 + 8) * Donators::MAX_DONATORS;
}

#[error_code]
pub enum DonationError {
    #[msg("Amount of lamports must be more than zero")]
    InvalidLamportsAmount,
    #[msg("There is no lamports to withdraw")]
    NoDonations,
}

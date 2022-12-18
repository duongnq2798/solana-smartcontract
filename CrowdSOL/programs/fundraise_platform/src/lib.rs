use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::solana_program::system_instruction::transfer;

declare_id!("4bXnBxEYTg5UB3qQHDtswBKQpYAyDqNC9E1qGQnQmK5e");

#[program]
pub mod fundraise_platform {
    use super::*;
    use std::u64;

    pub fn initialize(ctx: Context<Initialize>, goal: u64) -> Result<()> {
        require!(goal > 0, FundraiseErrors::ZeroLamports);
        let fundraise_platform = &mut ctx.accounts.fundraise_platform;
        fundraise_platform.authority = ctx.accounts.authority.key();
        fundraise_platform.goal = goal;
        fundraise_platform.raised = 0;
        fundraise_platform.id_counter = 0;

        let top_ten_contributors = &mut ctx.accounts.top_ten_contributors;
        top_ten_contributors.contributors = vec![];

        Ok(())
    }

    pub fn contribute(ctx: Context<Contribute>, id: u64, amount: u64) -> Result<()> {
        require!(amount > 0, FundraiseErrors::ZeroLamports);
        let fundraise_platform = &ctx.accounts.fundraise_platform;
        require!(
            id <= fundraise_platform.id_counter,
            FundraiseErrors::IDGreaterThanCounter
        );

        let contributor = &ctx.accounts.contributor;

        let raised = fundraise_platform.raised;
        let goal = fundraise_platform.goal;
        require!(goal > raised, FundraiseErrors::GoalAchieved);

        let (from, from_info) = (&contributor.key(), contributor.to_account_info());
        let (to, to_info) = (
            &fundraise_platform.key(),
            fundraise_platform.to_account_info(),
        );
        invoke(&transfer(from, to, amount), &[from_info, to_info])?;

        let fundraise_platform = &mut ctx.accounts.fundraise_platform;
        let contributor_acc = &mut ctx.accounts.contributor_acc;

        let mut _id = id;
        if _id == 0 {
            _id = fundraise_platform.id_counter;
        }

        if _id == fundraise_platform.id_counter {
            contributor_acc.address = ctx.accounts.contributor.key();
            contributor_acc.amount = 0;

            fundraise_platform.id_counter += 1;
        }

        contributor_acc.amount += amount;
        fundraise_platform.raised += amount;

        let top_ten_contributors = &mut ctx.accounts.top_ten_contributors;
        let (current_balance, mut current_i) = (contributor_acc.amount, 0);
        let (mut min, mut min_i) = (u64::MAX, TopTenContributors::MAX_CONTRIBUTORS);
        let mut found = false;
        for (i, cont) in top_ten_contributors.contributors.iter().enumerate() {
            if cont.amount < min {
                min = cont.amount;
                min_i = i;
            }
            if cont.address == contributor_acc.address {
                current_i = i;
                found = true;
                break;
            }
        }

        if !found {
            let contributor_instance = ContributorStruct {
                amount: contributor_acc.amount,
                address: contributor_acc.address,
            };

            if top_ten_contributors.contributors.len() < TopTenContributors::MAX_CONTRIBUTORS {
                top_ten_contributors.contributors.push(contributor_instance);
            } else if min < current_balance {
                top_ten_contributors.contributors[min_i] = contributor_instance;
            }
        } else {
            top_ten_contributors.contributors[current_i].amount = current_balance;
        }

        emit!(ContributionEvent {
            at: Clock::get()?.unix_timestamp,
            amount: amount,
            platform_after: fundraise_platform.raised,
            from: contributor_acc.address
        });
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let raised = ctx.accounts.fundraise_platform.raised;
        require!(raised > 0, FundraiseErrors::ZeroLamportsRaised);

        let from = ctx.accounts.fundraise_platform.to_account_info();
        let to = ctx.accounts.authority.to_account_info();

        let rent_exemption = Rent::get()?.minimum_balance(Funds::SIZE);
        let withdraw_amount = **from.lamports.borrow() - rent_exemption;
        // require!(withdraw_amount < raised, FundraiseErrors::InsufficientBalance);

        **from.try_borrow_mut_lamports()? -= withdraw_amount;
        **to.try_borrow_mut_lamports()? += withdraw_amount;
        ctx.accounts.fundraise_platform.raised = 0;

        emit!(WithdrawEvent {
            at: Clock::get()?.unix_timestamp,
            amount: withdraw_amount
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(goal: u64)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = Funds::SIZE,
        seeds = [b"fundraise_platform", authority.key().as_ref()],
        bump
    )]
    pub fundraise_platform: Account<'info, Funds>,

    #[account(
        init,
        payer = authority,
        space = TopTenContributors::SIZE,
        seeds = [b"top_ten_contributors", authority.key().as_ref()],
        bump
    )]
    pub top_ten_contributors: Account<'info, TopTenContributors>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
        seeds = [b"fundraise_platform", fundraise_platform.authority.key().as_ref()],
        bump
    )]
    pub fundraise_platform: Account<'info, Funds>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64, amount: u64)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub contributor: Signer<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        init_if_needed,
        payer = contributor,
        space = Contributor::SIZE,
        seeds = [
            b"fundraise_platform_contributor",
            fundraise_platform.key().as_ref(),
            id.to_string().as_bytes()
        ],
        bump
    )]
    pub contributor_acc: Account<'info, Contributor>,

    #[account(
        mut,
        seeds = [b"fundraise_platform", fundraise_platform.authority.key().as_ref()],
        bump
    )]
    pub fundraise_platform: Account<'info, Funds>,

    #[account(
        mut,
        seeds = [b"top_ten_contributors", fundraise_platform.authority.key().as_ref()],
        bump
    )]
    pub top_ten_contributors: Account<'info, TopTenContributors>,
}

#[account]
pub struct Funds {
    pub authority: Pubkey,
    pub goal: u64,
    pub raised: u64,
    pub id_counter: u64,
}
impl Funds {
    pub const SIZE: usize = 8 + 32 + 8 * 3;
}

#[account]
pub struct Contributor {
    pub address: Pubkey,
    pub amount: u64,
}

impl Contributor {
    pub const SIZE: usize = 8 + 32 + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct ContributorStruct {
    pub address: Pubkey,
    pub amount: u64,
}

#[account]
pub struct TopTenContributors {
    pub contributors: Vec<ContributorStruct>,
}

impl TopTenContributors {
    pub const MAX_CONTRIBUTORS: usize = 10;
    pub const SIZE: usize = 8 + 4 + (32 + 8) * TopTenContributors::MAX_CONTRIBUTORS;
}

// possible error scenarios to log from anchor prelude
#[error_code]
pub enum FundraiseErrors {
    #[msg("Lamports amount must be greater than zero!")]
    ZeroLamports,
    #[msg("0 amount of lamports were raised!")]
    ZeroLamportsRaised,
    #[msg("The goal was achieved!")]
    GoalAchieved,
    #[msg("Insufficient balance to pay the rent!")]
    InsufficientBalance,
    #[msg("Entered ID is greter than current ID counter")]
    IDGreaterThanCounter,
}

#[event]
pub struct ContributionEvent {
    at: i64,
    amount: u64,
    platform_after: u64,
    from: Pubkey,
}

#[event]
pub struct WithdrawEvent {
    at: i64,
    amount: u64,
}

pub mod state;
pub mod utils;

use crate::state::*;
use crate::utils::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{pubkey::Pubkey, rent::Rent};
use anchor_spl;
use std::collections::BTreeMap;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod casier {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn init_config(ctx: Context<InitConfig>) -> Result<()> {
        ctx.accounts.config.admin = ctx.accounts.fee_payer.key();
        ctx.accounts.config.is_frozen = false;
        Ok(())
    }

    pub fn init_locker(ctx: Context<InitLocker>, _space: u64) -> Result<()> {
        ctx.accounts.locker.owner = ctx.accounts.owner.key();
        ctx.accounts.locker.space = ctx.accounts.locker.to_account_info().data_len() as u64;
        Ok(())
    }

    pub fn increase_locker_size(ctx: Context<IncreaseLockerSize>, _new_size: u64) -> Result<()> {
        Ok(())
    }

    /*
     * Deposits deposit_amount into the vault if the current mint's amount in the locker is before_amount.
     */
    pub fn deposit<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, Deposit>,
        vault_bump: u8,
        deposit_amount: u32,
        before_amount: u32,
    ) -> Result<()> {
        let locker = &mut ctx.accounts.locker;
        let mk = ctx.accounts.mint.key();
        match locker.mints.iter().position(|&lm| lm == mk) {
            None => {
                if before_amount > 0 {
                    return Err(error!(ErrorCode::InvalidBeforeState));
                }
                locker.mints.push(mk);
                locker.amounts.push(deposit_amount);
            }
            Some(i) => {
                if before_amount != locker.amounts[i] {
                    return Err(error!(ErrorCode::InvalidBeforeState2));
                }
                locker.amounts[i] += deposit_amount;
            }
        }
        if *(ctx.accounts.vault_ta.to_account_info().owner) != ctx.accounts.token_program.key() {
            let mc = &ctx.accounts.mint.clone();
            let pk = &mc.key().clone();
            let pkr = pk.as_ref();
            let oc = &ctx.accounts.owner.clone();
            let opk = &oc.key().clone();
            let opkr = opk.as_ref();

            let vault_account_seeds = &[pkr, opkr, &[vault_bump]];
            let vault_account_signer = &vault_account_seeds[..];

            // initialize nft vault account
            spl_init_token_account(InitializeTokenAccountParams {
                account: ctx.accounts.vault_ta.to_account_info(),
                account_signer_seeds: vault_account_signer,
                mint: ctx.accounts.mint.to_account_info(),
                owner: ctx.accounts.vault_ta.to_account_info(),
                payer: ctx.accounts.owner.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            })?;
        }

        let vault_ta = Account::<'_, anchor_spl::token::TokenAccount>::try_from(
            &ctx.accounts.vault_ta.to_account_info(),
        )?;
        let is_valid_vault =
            vault_ta.owner == vault_ta.key() && vault_ta.mint == ctx.accounts.mint.key();

        if !is_valid_vault {
            return Err(error!(ErrorCode::InvalidVault));
        }

        spl_token_transfer(TokenTransferParams {
            source: ctx.accounts.user_ta.to_account_info(),
            destination: ctx.accounts.vault_ta.to_account_info(),
            amount: deposit_amount.into(),
            authority: ctx.accounts.owner.to_account_info(),
            authority_signer_seeds: &[],
            token_program: ctx.accounts.token_program.to_account_info(),
        })?;

        Ok(())
    }

    /*
     * To be called if final_amount >= vault_ta.amount - withdraw_amount (no burning).
     * Params:
     * * withdraw_amount: amount to transfer from vault_ta to user_ta
     * * before_amount: mint's corresponding amount from locker.amounts. Returns an error if they are different.
     * * final_amount: mint's new amount to set in locker.amounts.
     */
    pub fn withdraw<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, Withdraw>,
        vault_bump: u8,
        withdraw_amount: u32,
        before_amount: u32,
        final_amount: u32,
        with_transfer: bool,
    ) -> Result<()> {
        let locker = &mut ctx.accounts.locker;
        let mk = ctx.accounts.mint.key();
        match locker.mints.iter().position(|&lm| lm == mk) {
            None => {
                return Err(error!(ErrorCode::WithdrawForMintNotInLocker));
            }
            Some(i) => {
                if locker.amounts[i] != before_amount {
                    return Err(error!(ErrorCode::InvalidBeforeState));
                // if final amount is lower than the amounts of tokens that will be left, we should call withdraw_and_burn
                } else if (final_amount as u64)
                    < ctx.accounts.vault_ta.amount - (withdraw_amount as u64)
                {
                    return Err(error!(ErrorCode::BurnRequired));
                }
                if final_amount > 0 {
                    locker.amounts[i] = final_amount;
                } else {
                    locker.mints.remove(i);
                    locker.amounts.remove(i);
                }
            }
        }
        if *ctx.accounts.user_ta.to_account_info().owner != ctx.accounts.token_program.key() {
            let cpi_program = ctx.accounts.associated_token_program.to_account_info();
            let cpi_accounts = anchor_spl::associated_token::Create {
                payer: ctx.accounts.owner.to_account_info(),
                associated_token: ctx.accounts.user_ta.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            };
            let cpi_ctx = anchor_lang::context::CpiContext::new(cpi_program, cpi_accounts);
            anchor_spl::associated_token::create(cpi_ctx)?;
        }

        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.vault_ta.to_account_info(),
                    to: ctx.accounts.user_ta.to_account_info(),
                    authority: ctx.accounts.vault_ta.to_account_info(),
                },
                &[&[
                    ctx.accounts.mint.key().as_ref(),
                    ctx.accounts.owner.key().as_ref(),
                    &[vault_bump],
                ]],
            ),
            withdraw_amount.into(),
        )?;

        ctx.accounts.vault_ta.reload()?;
        if ctx.accounts.vault_ta.amount == 0 {
            anchor_spl::token::close_account(CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::CloseAccount {
                    account: ctx.accounts.vault_ta.to_account_info(),
                    destination: ctx.accounts.owner.to_account_info(),
                    authority: ctx.accounts.vault_ta.to_account_info(),
                },
                &[&[
                    ctx.accounts.mint.key().as_ref(),
                    ctx.accounts.owner.key().as_ref(),
                    &[vault_bump],
                ]],
            ))?;
        }

        Ok(())
    }

    /*
     * To be called if final_amount < vault_ta.amount. Does a soft burn by sending the tokens in a locked owned token account.
     */
    pub fn withdraw_and_burn<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, WithdrawAndBurn>,
        vault_bump: u8,
        burn_bump: u8,
        withdraw_amount: u32,
        before_amount: u32,
        final_amount: u32,
        with_transfer: bool,
    ) -> Result<()> {
        if ctx.accounts.vault_ta.amount <= final_amount.into() {
            return Err(error!(ErrorCode::BurnNotRequired));
        }
        let withdrawAccounts = &mut Withdraw {
            config: ctx.accounts.config.clone(),
            locker: ctx.accounts.locker.clone(),
            mint: ctx.accounts.mint.clone(),
            owner: ctx.accounts.owner.clone(),
            admin: ctx.accounts.admin.clone(),
            user_ta: ctx.accounts.user_ta.clone(),
            vault_ta: ctx.accounts.vault_ta.clone(),
            system_program: ctx.accounts.system_program.clone(),
            token_program: ctx.accounts.token_program.clone(),
            associated_token_program: ctx.accounts.associated_token_program.clone(),
            rent: ctx.accounts.rent.clone(),
        };
        let pid = id();
        let withdrawCtx =
            anchor_lang::context::Context::new(&pid, withdrawAccounts, &[], BTreeMap::new());

        let locker = &mut ctx.accounts.locker;
        let mk = ctx.accounts.mint.key();
        match locker.mints.iter().position(|&lm| lm == mk) {
            None => {
                return Err(error!(ErrorCode::WithdrawForMintNotInLocker));
            }
            Some(i) => {
                if locker.amounts[i] != before_amount {
                    return Err(error!(ErrorCode::InvalidBeforeState));
                }
                // if final amount is lower than the amounts of tokens that will be left, we should call withdraw_and_burn
                // } else if (final_amount as u64)
                //     < ctx.accounts.vault_ta.amount - (withdraw_amount as u64)
                // {
                //     return Err(error!(ErrorCode::BurnRequired));
                // }
                if final_amount > 0 {
                    locker.amounts[i] = final_amount;
                } else {
                    locker.mints.remove(i);
                    locker.amounts.remove(i);
                }
            }
        }
        if *ctx.accounts.user_ta.to_account_info().owner != ctx.accounts.token_program.key() {
            let cpi_program = ctx.accounts.associated_token_program.to_account_info();
            let cpi_accounts = anchor_spl::associated_token::Create {
                payer: ctx.accounts.owner.to_account_info(),
                associated_token: ctx.accounts.user_ta.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            };
            let cpi_ctx = anchor_lang::context::CpiContext::new(cpi_program, cpi_accounts);
            anchor_spl::associated_token::create(cpi_ctx)?;
        }

        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.vault_ta.to_account_info(),
                    to: ctx.accounts.user_ta.to_account_info(),
                    authority: ctx.accounts.vault_ta.to_account_info(),
                },
                &[&[
                    ctx.accounts.mint.key().as_ref(),
                    ctx.accounts.owner.key().as_ref(),
                    &[vault_bump],
                ]],
            ),
            withdraw_amount.into(),
        )?;

        ctx.accounts.vault_ta.reload()?;
        if ctx.accounts.vault_ta.amount == 0 && final_amount == 0 {
            anchor_spl::token::close_account(CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::CloseAccount {
                    account: ctx.accounts.vault_ta.to_account_info(),
                    destination: ctx.accounts.owner.to_account_info(),
                    authority: ctx.accounts.vault_ta.to_account_info(),
                },
                &[&[
                    ctx.accounts.mint.key().as_ref(),
                    ctx.accounts.owner.key().as_ref(),
                    &[vault_bump],
                ]],
            ))?;
        }

        if *(ctx.accounts.burn_ta.to_account_info().owner) != ctx.accounts.token_program.key() {
            let mc = &ctx.accounts.mint.clone();
            let pk = &mc.key().clone();
            let pkr = pk.as_ref();

            let vault_account_seeds = &[pkr, &[burn_bump]];
            let vault_account_signer = &vault_account_seeds[..];

            // initialize nft vault account
            spl_init_token_account(InitializeTokenAccountParams {
                account: ctx.accounts.burn_ta.to_account_info(),
                account_signer_seeds: vault_account_signer,
                mint: ctx.accounts.mint.to_account_info(),
                owner: ctx.accounts.burn_ta.to_account_info(),
                payer: ctx.accounts.owner.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            })?;
        }
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.vault_ta.to_account_info(),
                    to: ctx.accounts.burn_ta.to_account_info(),
                    authority: ctx.accounts.vault_ta.to_account_info(),
                },
                &[&[
                    ctx.accounts.mint.key().as_ref(),
                    ctx.accounts.owner.key().as_ref(),
                    &[vault_bump],
                ]],
            ),
            ctx.accounts.vault_ta.amount - final_amount as u64,
        )?;
        ctx.accounts.vault_ta.reload()?;
        if ctx.accounts.vault_ta.amount == 0 {
            anchor_spl::token::close_account(CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::CloseAccount {
                    account: ctx.accounts.vault_ta.to_account_info(),
                    destination: ctx.accounts.owner.to_account_info(),
                    authority: ctx.accounts.vault_ta.to_account_info(),
                },
                &[&[
                    ctx.accounts.mint.key().as_ref(),
                    ctx.accounts.owner.key().as_ref(),
                    &[vault_bump],
                ]],
            ))?;
        }
        Ok(())
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid vault.")]
    InvalidVault,
    #[msg("Invalid before state.")]
    InvalidBeforeState,
    #[msg("Invalid before state.")]
    InvalidBeforeState2,
    #[msg("Invalid before state.")]
    InvalidBeforeState3,
    #[msg("Invalid before state.")]
    InvalidBeforeState4,
    #[msg("Trying to withdraw a mint not in locker..")]
    WithdrawForMintNotInLocker,
    #[msg("InvalidFinalState: FinalState.")]
    InvalidFinalState,
    #[msg("BurnNotRequired")]
    BurnNotRequired,
    #[msg("BurnRequired")]
    BurnRequired,
}

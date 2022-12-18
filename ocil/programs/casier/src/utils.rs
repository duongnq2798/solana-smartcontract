use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
};
use anchor_spl;

pub fn create_pda_account<'a>(
    payer: &AccountInfo<'a>,
    space: usize,
    owner: &Pubkey,
    system_program: &AccountInfo<'a>,
    new_pda_account: &AccountInfo<'a>,
    new_pda_signer_seeds: &[&[u8]],
) -> ProgramResult {
    let rent = Rent::get()?;

    if new_pda_account.lamports() > 0 {
        let required_lamports = rent
            .minimum_balance(space)
            .max(1)
            .saturating_sub(new_pda_account.lamports());

        if required_lamports > 0 {
            invoke(
                &system_instruction::transfer(payer.key, new_pda_account.key, required_lamports),
                &[
                    payer.clone(),
                    new_pda_account.clone(),
                    system_program.clone(),
                ],
            )?;
        }

        invoke_signed(
            &system_instruction::allocate(new_pda_account.key, space as u64),
            &[new_pda_account.clone(), system_program.clone()],
            &[new_pda_signer_seeds],
        )?;

        invoke_signed(
            &system_instruction::assign(new_pda_account.key, owner),
            &[new_pda_account.clone(), system_program.clone()],
            &[new_pda_signer_seeds],
        )
    } else {
        invoke_signed(
            &system_instruction::create_account(
                payer.key,
                new_pda_account.key,
                rent.minimum_balance(space).max(1),
                space as u64,
                owner,
            ),
            &[
                payer.clone(),
                new_pda_account.clone(),
                system_program.clone(),
            ],
            &[new_pda_signer_seeds],
        )
    }
}

pub struct InitializeTokenAccountParams<'a: 'b, 'b> {
    /// CHECK: account
    pub account: AccountInfo<'a>,
    /// account_signer_seeds
    pub account_signer_seeds: &'b [&'b [u8]],
    /// CHECK: mint
    pub mint: AccountInfo<'a>,
    /// CHECK: owner
    pub owner: AccountInfo<'a>,
    /// CHECK: payer
    pub payer: AccountInfo<'a>,
    /// CHECK: system_program
    pub system_program: AccountInfo<'a>,
    /// CHECK: token_program
    pub token_program: AccountInfo<'a>,
    /// CHECK: rent
    pub rent: AccountInfo<'a>,
}

pub fn spl_init_token_account(params: InitializeTokenAccountParams<'_, '_>) -> Result<()> {
    let InitializeTokenAccountParams {
        account,
        account_signer_seeds,
        mint,
        owner,
        payer,
        system_program,
        token_program,
        rent,
    } = params;

    create_pda_account(
        &payer,
        anchor_spl::token::TokenAccount::LEN,
        token_program.key,
        &system_program,
        &account,
        account_signer_seeds,
    )?;

    let result = invoke(
        &spl_token::instruction::initialize_account(
            token_program.key,
            account.key,
            mint.key,
            owner.key,
        )?,
        &[account, mint, owner, token_program, rent],
    );
    return result.map_err(|_| ErrorCode2::TransferFail2.into());
}

pub fn spl_init_token_account2(params: InitializeTokenAccountParams<'_, '_>) -> Result<()> {
    let InitializeTokenAccountParams {
        account,
        account_signer_seeds,
        mint,
        owner,
        payer,
        system_program,
        token_program,
        rent,
    } = params;

    let result = invoke(
        &spl_token::instruction::initialize_account(
            token_program.key,
            account.key,
            mint.key,
            owner.key,
        )?,
        &[account, mint, owner, token_program, rent],
    );
    return result.map_err(|_| ErrorCode2::TransferFail2.into());
}

pub struct TokenTransferParams<'a: 'b, 'b> {
    /// CHECK: source
    pub source: AccountInfo<'a>,
    /// CHECK: destination
    pub destination: AccountInfo<'a>,
    /// amount
    pub amount: u64,
    /// CHECK: authority
    pub authority: AccountInfo<'a>,
    /// authority_signer_seeds
    pub authority_signer_seeds: &'b [&'b [u8]],
    /// CHECK: token_program
    pub token_program: AccountInfo<'a>,
}

pub fn spl_token_transfer(params: TokenTransferParams<'_, '_>) -> Result<()> {
    let TokenTransferParams {
        source,
        destination,
        authority,
        token_program,
        amount,
        authority_signer_seeds,
    } = params;

    let result = invoke_signed(
        &spl_token::instruction::transfer(
            token_program.key,
            source.key,
            destination.key,
            authority.key,
            &[],
            amount,
        )?,
        &[source, destination, authority, token_program],
        &[authority_signer_seeds],
    );

    return result.map_err(|_| ErrorCode2::TransferFail2.into());
}

#[error_code]
pub enum ErrorCode2 {
    #[msg("Transfer failed2.")]
    TransferFail2,
}

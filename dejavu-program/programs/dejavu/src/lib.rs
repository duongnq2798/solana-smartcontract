mod utils;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_lang::prelude::*;
use crate::utils::create_prediction;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod dejavu {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, _timestamp: i64, prediction: i8) -> Result<()> {
        create_prediction(
            &mut ctx.accounts.players,
             *ctx.accounts.user.key, 
             prediction
        )?;

        Ok(())
    }
}

#[account]
pub struct Players {
    players: [Option<Pubkey>; 10],
    players_predictions: [Option<i8>; 10]
}

#[account]
pub struct Room {
    players: u8,
    created_by: Pubkey,
    prediction: i8,
    mint_account: Pubkey,
    vault_account: Pubkey
}

#[derive(Accounts)]
#[instruction(timestamp: i64)]
pub struct Initialize<'info> {
    mint: Account<'info, Mint>,
    #[account(
        init, 
        payer = user, 
        space = 8 + 1 + 32 + 1 + 32 + 32,
        seeds = [user.key().as_ref(), format!("room-{}", timestamp).as_bytes().as_ref()], 
        bump
    )]
    room: Account<'info, Room>,
    #[account(
        init, 
        payer = user, 
        space = 8 + 320 + 10,
        seeds = [room.key().as_ref(), b"players".as_ref()], 
        bump
    )]
    players: Account<'info, Players>,
    #[account(
        init,
        payer = user,
        token::mint = mint,
        token::authority = room,
        seeds = [room.key().as_ref(), b"vault".as_ref()],
        bump
    )]
    vault_account: Account<'info, TokenAccount>,
    #[account(mut)]
    user: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    rent: Sysvar<'info, Rent>
}

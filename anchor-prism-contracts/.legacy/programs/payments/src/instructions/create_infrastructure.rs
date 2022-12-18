use crate::state::infrastructure::*;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateInfrastructurePayload {
    name: String,
    description: String,
    self_custody: bool,
}

pub fn create_infrastructure(
    ctx: Context<CreateInfrastructure>,
    payload: CreateInfrastructurePayload,
) -> Result<()> {
    let name: Vec<u8> = payload.name.try_to_vec()?;
    let description: Vec<u8> = payload.description.try_to_vec()?;
    let self_custody: bool = payload.self_custody;
    let authority: Pubkey = ctx.accounts.merchant.key();
    let bump: u8 = *ctx.bumps.get("infrastructure").unwrap();
    let _ = ctx
        .accounts
        .infrastructure
        .create(name, description, self_custody, authority, bump);
    Ok(())
}

#[derive(Accounts)]
pub struct CreateInfrastructure<'info> {
    #[account(
        init, 
        seeds = [
            b"infrastructure".as_ref(),
            merchant.key().as_ref()
        ],
        bump, 
        payer = merchant, 
        space = 8 + 40 + 40 + 60,
    )]
    pub infrastructure: Account<'info, Infrastructure>,
    #[account(mut)]
    pub merchant: Signer<'info>,
    pub system_program: Program<'info, System>,
}

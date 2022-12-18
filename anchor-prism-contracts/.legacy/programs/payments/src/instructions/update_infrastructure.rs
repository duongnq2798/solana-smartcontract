use crate::state::infrastructure::*;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateInfrastructurePayload {
    name: String,
    description: String,
    active: bool,
}

pub fn update_infrastructure(
    ctx: Context<UpdateInfrastructure>,
    payload: UpdateInfrastructurePayload,
) -> Result<()> {
    let name: Vec<u8> = payload.name.try_to_vec()?;
    let description: Vec<u8> = payload.description.try_to_vec()?;
    let active: bool = payload.active;
    let _ = ctx
        .accounts
        .infrastructure
        .update(name, description, active);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateInfrastructure<'info> {
    #[account(
        mut,
        seeds = [
            b"infrastructure",
            payer.key().as_ref()
        ],
        bump = infrastructure.bump)]
    pub infrastructure: Account<'info, Infrastructure>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

use anchor_lang::prelude::*;
use crate::model::{CaterItem, CaterList, Group};

#[derive(Accounts)]
#[instruction(name: String, url: String)]
pub struct PushCater <'info> {
    #[account(mut, seeds=[b"cater_list", group.key().as_ref()], bump=cater_list.bump)]
    cater_list: Account<'info, CaterList>,
    #[account(
        init, 
        payer=owner, 
        space=CaterItem::SIZE,
        seeds=[b"cater", cater_list.key().as_ref(), name.as_ref()],
        bump
    )]
    cater: Account<'info, CaterItem>,
    group: Account<'info, Group>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}

pub fn handle(ctx: Context<PushCater>, name: String, url: String) -> Result<()> {
    require!(name.len() < CaterItem::MAX_CATER_NAME_LENGTH, StringTooLong);
    let cater = &mut ctx.accounts.cater;
    cater.name = name.to_string();
    cater.url = url.to_string();
    let cater_list = &mut ctx.accounts.cater_list;
    cater_list.push_cater(&cater.key())?;
    cater.cater_list = cater_list.key();
    cater.bump = *ctx.bumps.get("cater").unwrap();
    Ok(())
}
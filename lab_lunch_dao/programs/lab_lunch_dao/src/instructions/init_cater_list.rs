use anchor_lang::prelude::*;
use crate::model::{CaterList, Group};

#[derive(Accounts)]
pub struct InitCaterList<'info> {
    #[account(
        init, 
        payer=owner, 
        space=CaterList::SIZE,
        seeds=[b"cater_list", group.key().as_ref()],
        bump
        )]
    list: Account<'info, CaterList>,
    group: Account<'info, Group>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}

pub fn handler(ctx:Context<InitCaterList>) -> Result<()>{
    let list = &mut ctx.accounts.list;
    list.bump = *ctx.bumps.get("list").unwrap();

    Ok(())
}
use anchor_lang::prelude::*;
use crate::model::Group;

pub fn handler(ctx: Context<InitGroup>, name:String) -> Result<()> {
        let group = &mut ctx.accounts.group;
        let owner = &ctx.accounts.owner;
        group.name = name;
        group.members.push(owner.key());
        group.quorum = 1;
        group.bump = *ctx.bumps.get("group").unwrap();
        Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitGroup <'info> {
    #[account(init, 
        payer=owner,
        space=Group::SIZE,
        seeds=[b"group", name.as_bytes()],
        bump,
    )]
    group: Account<'info, Group>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}
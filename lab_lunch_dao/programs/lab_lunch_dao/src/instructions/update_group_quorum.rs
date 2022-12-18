use anchor_lang::prelude::*;
use crate::model::Group;

pub fn handler(ctx: Context<UpdateQuorum>, new_quorum: u8) -> Result<()> {
        let group = &mut ctx.accounts.group;
        let owner = &ctx.accounts.owner;
        require!(group.members[0] == owner.key(), NotAllowedToUpdateGroup);
        require!(new_quorum != 0, InvalidQuorum);
        require!(new_quorum < Group::MAX_GROUP_MEMBERS as u8, InvalidQuorum);
        require!(new_quorum <= group.members.len() as u8, InvalidQuorum);
        group.quorum = new_quorum;
        Ok(())
}

#[derive(Accounts)]
pub struct UpdateQuorum <'info> {
    #[account(mut)]
    group: Account<'info, Group>,
    #[account(mut)]
    owner: Signer<'info>,
}
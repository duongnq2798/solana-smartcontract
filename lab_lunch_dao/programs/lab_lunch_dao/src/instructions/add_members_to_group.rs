use anchor_lang::prelude::*;
use crate::model::Group;

pub fn handler(ctx: Context<AddMembersToGroup>, new_members: Vec<Pubkey>) -> Result<()> {
        let group = &mut ctx.accounts.group;
        let owner = &ctx.accounts.owner;

        require!(group.members[0] == owner.key(), NotAllowedToUpdateGroup);
        require!(group.members.len() + new_members.len() < Group::MAX_GROUP_MEMBERS, FullGroup);
        group.members.extend_from_slice(&new_members);
        assert_members_uniquness(&group.members)?;

        group.seq_no += 1;
        Ok(())
}

#[derive(Accounts)]
pub struct AddMembersToGroup <'info> {
    #[account(mut)]
    group: Account<'info, Group>,
    #[account(mut)]
    owner: Signer<'info>,
}

fn assert_members_uniquness(members: &Vec<Pubkey>) -> Result<()>  {
    for (i, k) in members.iter().enumerate() {
        require!(!members.iter().skip(i+1).any(|key| key==k), GroupNotUnique);
    }
    Ok(())
}
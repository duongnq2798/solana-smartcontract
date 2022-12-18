use anchor_lang::prelude::*;
use crate::model::{Group, Topic, Ballot};

#[derive(Accounts)]
pub struct Vote <'info> {
    #[account(
        init, 
        payer=voter, 
        space=Ballot::SIZE,
        seeds=[b"ballot", voter.key().as_ref(), topic.key().as_ref()],
        bump
    )]
    pub ballot : Account<'info, Ballot>,
    #[account(mut)]    
    pub voter : Signer<'info>,
    pub system_program: Program<'info, System>,
    pub group : Account<'info, Group>,
    #[account(mut)]
    pub topic : Account<'info, Topic>,
}

pub fn handle(ctx: Context<Vote>, votes: Vec<bool>) -> Result<()> {
    let group = &ctx.accounts.group;
    let topic = &mut ctx.accounts.topic;
    let voter = &ctx.accounts.voter;
    let ballot = &mut ctx.accounts.ballot;
    require!(!topic.finalized, TopicClosed);
    require!(group.seq_no == topic.seq_no, SeqNoMismatch);
    require!(group.members.iter().any(|k|k == voter.key), VoterNotMember);
    require!(topic.options.len() == votes.len(), OptionVotesMismatch);
    ballot.approvals = votes;
    ballot.topic = topic.key();
    ballot.voter = voter.key();
    // I trust anchor people...
    ballot.bump = *ctx.bumps.get("ballot").unwrap();
    topic.vote_num += 1;
    Ok(())
}
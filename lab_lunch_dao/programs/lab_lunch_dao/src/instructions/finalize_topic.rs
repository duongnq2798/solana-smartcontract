use anchor_lang::prelude::*;

use crate::model::{Group, FinalizedTopic, Topic, Ballot};

#[derive(Accounts)]
pub struct FinalizeTopic<'info> {
    #[account(mut)]
    pub topic: Account<'info, Topic>,
    #[account(init, 
        space=FinalizedTopic::SIZE, 
        payer=payer,
        seeds=[b"result", topic.key().as_ref()],
        bump
    )]
    pub result: Account<'info, FinalizedTopic>,
    pub group: Account<'info, Group>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn handle(ctx: Context<FinalizeTopic>) -> Result<()> {
    let topic = &mut ctx.accounts.topic;
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;
    require!(now > topic.vote_due, TopicStillRunning);
    require!(topic.quorum <= topic.vote_num, TopicDidNotReachQuorum);
    require!(!topic.finalized, TopicStillRunning);
    let result = &mut ctx.accounts.result;

    result.votes.resize(topic.options.len(), 0u8);
    // FIXME: this relies on the client to provide the 'right' ballots
    require!(topic.vote_num == ctx.remaining_accounts.len() as u8, OptionVotesMismatch);
    for a in ctx.remaining_accounts {
        let ballot:Account<Ballot> =  Account::try_from(a)?;
        for (i ,v) in ballot.approvals.iter().enumerate() {
            if *v {
                result.votes[i] += 1;                
            }
        }
    }
    result.bump = *ctx.bumps.get("result").unwrap();
    topic.finalized = true;
    Ok(())
}
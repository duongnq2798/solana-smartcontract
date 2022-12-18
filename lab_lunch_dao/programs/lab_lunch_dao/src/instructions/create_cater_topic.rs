use crate::model::{Group, PubkeyOptions, Topic, CaterList};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateCaterTopic<'info> {
    #[account(init, payer=owner, space=Topic::SIZE)]
    topic: Account<'info, Topic>,
    #[account(mut)]
    owner: Signer<'info>,
    cater_list: Account<'info, CaterList>,
    group: Account<'info, Group>,
    system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CreateCaterTopic>, vote_due: i64) -> Result<()>{
    let topic = &mut ctx.accounts.topic;
    let group = &ctx.accounts.group;
    let cater_list = &ctx.accounts.cater_list;

    topic.options = cater_list.options();
    topic.name = "Choose Caters".to_string();
    topic.description = "decide which cater to use next time".to_string();
    topic.vote_due = vote_due;
    topic.group = group.key();
    topic.seq_no = group.seq_no;
    topic.quorum = group.quorum;
    topic.finalized = false;

    Ok(())
}

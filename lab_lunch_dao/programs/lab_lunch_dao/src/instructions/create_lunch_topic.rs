use crate::model::{CaterItem, Group, PubkeyOptions, Topic};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct CreateLunchTopic<'info> {
    #[account(init, payer=owner, space=Topic::SIZE)]
    topic: Account<'info, Topic>,
    #[account(mut)]
    owner: Signer<'info>,
    cater: Account<'info, CaterItem>,
    group: Account<'info, Group>,
    system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<CreateLunchTopic>, vote_due: i64, when: String ) -> Result<()> {
    let topic = &mut ctx.accounts.topic;
    let group = &ctx.accounts.group;
    let cater = &ctx.accounts.cater;

    topic.options = cater.options();
    topic.name=format!("Lunch Vote ({})", &when);
    topic.description = format!("select menu item from {}", cater.name);
    topic.vote_due = vote_due;
    topic.group = group.key();
    topic.seq_no = group.seq_no;
    topic.quorum = group.quorum;
    topic.finalized = false;

    Ok(())
}

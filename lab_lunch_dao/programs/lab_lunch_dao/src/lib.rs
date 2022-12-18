mod error;
mod instructions;
mod model;

use anchor_lang::prelude::*;
pub use error::ErrorCode;
use instructions::*;
declare_id!("HtZAJbfvjxWGgMSQh9Aht28sPNX1EC5jsGoeoq9DDqkA");

#[program]
pub mod lab_lunch_dao {
    use super::*;

    pub fn init_group(ctx: Context<InitGroup>, name: String) -> Result<()> {
        init_group::handler(ctx, name)
    }

    pub fn add_members_to_group(
        ctx: Context<AddMembersToGroup>,
        new_members: Vec<Pubkey>,
    ) -> Result<()> {
        add_members_to_group::handler(ctx, new_members)
    }

    pub fn update_quorum(ctx: Context<UpdateQuorum>, new_quorum: u8) -> Result<()> {
        update_group_quorum::handler(ctx, new_quorum)
    }

    pub fn init_cater_list(ctx: Context<InitCaterList>) -> Result<()> {
        init_cater_list::handler(ctx)
    }

    pub fn push_cater(ctx: Context<PushCater>, name: String, url: String) -> Result<()> {
        push_cater::handle(ctx, name, url)
    }

    pub fn push_menu(
        ctx: Context<PushMenu>,
        name: String,
        foot_print: f32,
        cost: f32,
    ) -> Result<()> {
        push_menu::handle(ctx, name, foot_print, cost)
    }

    pub fn create_lunch_topic(
        ctx: Context<CreateLunchTopic>,
        vote_due: i64,
        when: String,
    ) -> Result<()> {
        create_lunch_topic::handle(ctx, vote_due, when)
    }

    pub fn create_cater_topic(ctx: Context<CreateCaterTopic>, vote_due: i64) -> Result<()> {
        create_cater_topic::handle(ctx, vote_due)
    }

    pub fn vote(ctx: Context<Vote>, votes: Vec<bool>) -> Result<()> {
        vote::handle(ctx, votes)
    }

    pub fn update_ballot(ctx: Context<UpdateBallot>, votes: Vec<bool>) -> Result<()> {
        update_ballot::handle(ctx, votes)
    }

    pub fn finalize_topic(ctx: Context<FinalizeTopic>) -> Result<()> {
        finalize_topic::handle(ctx)
    }
}

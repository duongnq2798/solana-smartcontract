use anchor_lang::prelude::*;
use crate::model::{CaterItem, MenuItem};

#[derive(Accounts)]
#[instruction(name: String, foot_print: f32, cost:f32)]
pub struct PushMenu <'info> {
    #[account(mut)]
    cater: Account<'info, CaterItem>,
    #[account(init, 
        payer=owner, 
        space=MenuItem::SIZE,
        seeds=[b"menu", cater.key().as_ref(), name.as_ref()],
        bump
    )]
    menu: Account<'info, MenuItem>,
    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>
}

pub fn handle(ctx: Context<PushMenu>, name: String, foot_print: f32, cost: f32) -> Result<()> {
    require!(name.len() < MenuItem::MAX_MENU_ITEM_NAME_LENGTH, StringTooLong);
    let menu = &mut ctx.accounts.menu;
    menu.name = name.to_string();
    menu.foot_print = foot_print;
    menu.cost = cost;
    menu.bump = *ctx.bumps.get("menu").unwrap();
    let cater = &mut ctx.accounts.cater;
    cater.push_menu(&menu.key())?;
    menu.cater = cater.key();
    Ok(())
}
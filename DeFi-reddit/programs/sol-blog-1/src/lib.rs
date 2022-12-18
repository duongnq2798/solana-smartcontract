use anchor_lang::prelude::*;

const MAX_TITLE_LEN: usize = 80;
const MAX_TEXT_LEN: usize = 577;
const MAX_TOPIC_LEN: usize = 40;
const MAX_IMG_LEN: usize = 20;

declare_id!("HT1SvEi8Ku988kYZMe7MF85YtdmYWiZ6vS2A2ky8jDrH");

#[program]
pub mod sol_blog {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        text: String,
        title: String,
        topics: Vec<String>,
        img: String,
    ) -> Result<()> {
        msg!("Initial program execution");
        let blog_account = &mut ctx.accounts.blog_account;
        blog_account.text = text;
        blog_account.title = title;
        blog_account.topics = topics;
        blog_account.img = img;
        blog_account.authority =  *ctx.accounts.user.key;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + MAX_TITLE_LEN + MAX_TEXT_LEN + MAX_TOPIC_LEN + MAX_IMG_LEN + 32)]
    pub blog_account: Account<'info, BlogAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct BlogAccount {
    pub text: String,
    pub title: String,
    pub topics: Vec<String>,
    pub img: String,
    pub authority: Pubkey,
}

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;
use mpl_token_metadata::instruction::{set_and_verify_collection};
//test
declare_id!("JdYddF4jrjzBrWtdy6LkVbPfLvx3FQgqTokjT1ov8C4");

#[program]
pub mod create_collection {
    use super::*;
    
    pub fn setcollectionduringmint(ctx: Context<SetCollectionDuringMint>) -> Result<()> {
        


        let set_collection_infos = vec![
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.collection_authority.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.collection_mint.to_account_info(),
            ctx.accounts.collection_metadata.to_account_info(),
            ctx.accounts.collection_master_edition.to_account_info(),
            ctx.accounts.collection_authority_record.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
            ctx.accounts.token_metadata_program.to_account_info()
            
        ];
        invoke(
            &set_and_verify_collection(
                ctx.accounts.token_metadata_program.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.collection_authority.key(),
                ctx.accounts.payer.key(),
                ctx.accounts.update_authority.key(),
                ctx.accounts.collection_mint.key(),
                ctx.accounts.collection_metadata.key(),
                ctx.accounts.collection_master_edition.key(),
                Some(ctx.accounts.collection_authority_record.key()),
            ),
            set_collection_infos.as_slice()
        )?;
        Ok(())
    }
}

/// Sets and verifies the collection during a candy machine mint
#[derive(Accounts)]
pub struct SetCollectionDuringMint<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub token_metadata_program: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub collection_authority: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: Signer<'info>,

     /// CHECK: This is not dangerous because we don't read or write from this account
     #[account(mut)]
     pub update_authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    collection_mint: UncheckedAccount<'info>,

     /// CHECK: This is not dangerous because we don't read or write from this account
     collection_metadata: UncheckedAccount<'info>,

     /// CHECK: This is not dangerous because we don't read or write from this account
    collection_master_edition: UncheckedAccount<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    collection_authority_record: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

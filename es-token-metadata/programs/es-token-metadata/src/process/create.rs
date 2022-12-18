use crate::{state::*, utils::*};
use anchor_lang::prelude::*;
use anchor_spl::token::spl_token;

pub fn process_create_metadata(
    ctx: Context<CreateMetadata>,
    args: CreateMetadataArgs,
) -> Result<()> {
    msg!("Creating Metadata...");
    msg!("{:?}", args);

    let metadata = &mut ctx.accounts.metadata;

    let mint_authority = get_mint_authority(&ctx.accounts.mint.to_account_info())?;

    assert_mint_authority_matches_mint(&mint_authority, &ctx.accounts.mint_authority)?;

    assert_owned_by(&ctx.accounts.mint, &spl_token::id())?;

    assert_data_valid(
        &args.data,
        ctx.accounts.update_authority.key,
        &metadata,
        args.allow_direct_creator_writes,
        ctx.accounts.update_authority.is_signer,
        false,
    )?;

    metadata.mint = ctx.accounts.mint.key();
    metadata.update_authority = ctx.accounts.update_authority.key();
    metadata.data = args.data;
    metadata.is_mutable = args.is_mutable;

    Ok(())
}

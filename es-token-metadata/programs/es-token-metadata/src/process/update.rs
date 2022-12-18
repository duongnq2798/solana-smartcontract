use crate::errors::*;
use crate::state::*;
use crate::utils::*;
use anchor_lang::prelude::*;

pub fn process_update_metadata(
    ctx: Context<UpdateMetadata>,
    args: UpdateMetadataArgs,
) -> Result<()> {
    msg!("Updating Metadata...");
    msg!("{:?}", args);

    let metadata = &mut ctx.accounts.metadata;

    assert_owned_by(&metadata.to_account_info(), &crate::id())?;
    assert_update_authority_is_correct(metadata, &ctx.accounts.update_authority)?;

    if !metadata.is_mutable {
        return Err(ESTokenMetadataError::DataIsImmutable.into());
    }

    assert_data_valid(
        &args.data,
        ctx.accounts.update_authority.key,
        &metadata,
        false,
        ctx.accounts.update_authority.is_signer,
        true,
    )?;

    metadata.mint = ctx.accounts.mint.key();
    metadata.update_authority = ctx.accounts.update_authority.key();
    metadata.data = args.data;
    metadata.is_mutable = args.is_mutable;

    Ok(())
}

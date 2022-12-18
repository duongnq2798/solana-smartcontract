#![allow(warnings)]
pub mod constants;
pub mod errors;
pub mod process;
pub mod state;
pub mod utils;

use anchor_lang::prelude::*;
pub use constants::*;
pub use errors::*;
pub use process::*;
pub use solana_program;
pub use state::*;
pub use utils::*;


solana_program::declare_id!("4fhHqbNqYXmGVgYtff1y75BGczADSq3vB9nNnzfDRNwi");

#[program]
pub mod es_token_metadata {
    use super::*;

    pub fn mint_nft(ctx: Context<MintNft>) -> Result<()> {
        process_mint_nft(ctx)
    }

    pub fn create_metadata(ctx: Context<CreateMetadata>, args: CreateMetadataArgs) -> Result<()> {
        process_create_metadata(ctx, args)
    }

    pub fn update_metadata(ctx: Context<UpdateMetadata>, args: UpdateMetadataArgs) -> Result<()> {
        process_update_metadata(ctx, args)
    }

    pub fn get_metadata(ctx: Context<GetMetadata>) -> Result<Metadata> {
        let metadata = &ctx.accounts.metadata;
        let _metadata = Metadata{
            mint:  metadata.mint,
            update_authority: metadata.update_authority,
            data: metadata.data.clone(),
            is_mutable: metadata.is_mutable
        };

        Ok(_metadata)
    }
}


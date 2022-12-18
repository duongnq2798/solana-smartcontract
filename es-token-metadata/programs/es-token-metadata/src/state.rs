use crate::constants::*;
use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use solana_program::stake::state::Meta;

#[repr(C)]
#[derive(Accounts)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,
    // #[account(mut)]
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub payer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub rent: AccountInfo<'info>,
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct MintNFTArgs {
    pub creator_key: Pubkey,
    pub uri: String,
    pub title: String,
}

#[repr(C)]
#[derive(Accounts)]
pub struct CreateMetadata<'info> {
    /// CHECK:
    #[account(
        init,
        seeds = [
            METADATA_SEED_KEY.as_bytes(),
            crate::id().as_ref(),
            mint.key().as_ref()
        ],
        bump,
        space = 8 + METADATA_SIZE,
        payer = payer
    )]
    pub metadata: Account<'info, Metadata>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_authority: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub update_authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>,
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct CreateMetadataArgs {
    pub data: Data,
    pub allow_direct_creator_writes: bool,
    pub is_mutable: bool,
}

#[repr(C)]
#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    /// CHECK:
    #[account(mut)]
    pub metadata: Account<'info, Metadata>,
    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint: UncheckedAccount<'info>,
    pub update_authority: Signer<'info>,
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct UpdateMetadataArgs {
    pub data: Data,
    pub allow_direct_creator_writes: bool,
    pub is_mutable: bool,
}

#[repr(C)]
#[account]
pub struct Metadata {
    pub mint: Pubkey,
    pub update_authority: Pubkey,
    pub data: Data,
    pub is_mutable: bool,
}

// Jee's comment#1: I suggested that we should drop the `seller_fee_basis_points` field since the revenue share logic will make no sense with the existing `share_insurance_token_amount` field.

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct Data {
    /// The name of the asset
    pub name: String,
    /// The symbol for the asset
    pub symbol: String,
    /// URI pointing to JSON representing the asset
    pub uri: String,
    /// Royalty basis points that goes to creators in secondary sales (0-10000)
    pub seller_fee_basis_points: u16,
    /// Amount of insurance token that owner mint for this nft
    pub share_insurance_token_amount: u64,
    // /// mint insurance token address
    pub share_insurance_mint: Option<Pubkey>,
    /// Array of creators, optional
    pub creators: Option<Vec<Creator>>,
    // /// Array of referrer, optional
    pub referrers: Option<Vec<Referrer>>,
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct Creator {
    // creator
    pub address: Pubkey,
    pub verified: bool,
    // In weight
    pub share: u64,
}



// Jee's comment#1: I suggested that we should change the `Referrer` struct name to something like `Reference` since this struct holds a list of what I suppose is metadata's address. The some goes for the Data struct as well.


#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Debug, Clone)]
pub struct Referrer {
    pub address: Pubkey,
}


#[derive(Accounts)]
pub struct GetMetadata<'info> {
    #[account(mut)]
    pub metadata: Account<'info, Metadata>,
}

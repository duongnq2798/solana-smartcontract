use crate::{constants::*, errors::*, state::*};
use anchor_lang::{
    prelude::*,
    solana_program::{program_memory::sol_memcmp, pubkey::PUBKEY_BYTES},
};
use anchor_spl::token::*;

use arrayref::{array_ref, array_refs};
use solana_program::program_pack::Pack;

pub fn get_mint_authority(account_info: &AccountInfo) -> Result<Option<Pubkey>> {
    // In token program, 36, 8, 1, 1 is the layout, where the first 36 is mint_authority
    // so we start at 0.
    let data = account_info.try_borrow_data().unwrap();
    msg!("{:?}", data);
    let authority_bytes = array_ref![data, 0, 36];

    // let result = spl_token::state::Account::unpack(&data)
    //     // .map(anchor_spl::token::TokenAccount)
    //     //.map_err(Into::into)
    // ;
    // msg!("result");
    // msg!("{:?}", result);

    unpack_coption_key(authority_bytes)
}

fn unpack_coption_key(src: &[u8; 36]) -> Result<Option<Pubkey>> {
    let (tag, body) = array_refs![src, 4, 32];
    match *tag {
        [0, 0, 0, 0] => Ok(Option::None),
        [1, 0, 0, 0] => Ok(Option::Some(Pubkey::new_from_array(*body))),
        _ => Err(ESTokenMetadataError::InvalidAccountData.into()),
    }
}

pub fn assert_mint_authority_matches_mint(
    mint_authority: &Option<Pubkey>,
    mint_authority_info: &AccountInfo,
) -> Result<()> {
    match mint_authority {
        None => {
            return Err(ESTokenMetadataError::InvalidMintAuthority.into());
        }
        Some(key) => {
            if !cmp_pubkeys(mint_authority_info.key, key) {
                return Err(ESTokenMetadataError::InvalidMintAuthority.into());
            }
        }
    }

    if !mint_authority_info.is_signer {
        return Err(ESTokenMetadataError::NotMintAuthority.into());
    }

    Ok(())
}

pub fn assert_owned_by(account: &AccountInfo, owner: &Pubkey) -> Result<()> {
    if !cmp_pubkeys(account.owner, owner) {
        Err(ESTokenMetadataError::IncorrectOwner.into())
    } else {
        Ok(())
    }
}

pub fn assert_update_authority_is_correct(
    metadata: &Metadata,
    update_authority_info: &AccountInfo,
) -> Result<()> {
    if !cmp_pubkeys(&metadata.update_authority, &update_authority_info.key()) {
        return Err(ESTokenMetadataError::UpdateAuthorityIncorrect.into());
    }

    if !update_authority_info.is_signer {
        return Err(ESTokenMetadataError::UpdateAuthorityIsNotSigner.into());
    }

    Ok(())
}

pub fn cmp_pubkeys(a: &Pubkey, b: &Pubkey) -> bool {
    sol_memcmp(a.as_ref(), b.as_ref(), PUBKEY_BYTES) == 0
}

pub fn assert_data_valid(
    data: &Data,
    update_authority: &Pubkey,
    existing_metadata: &Metadata,
    allow_direct_creator_writes: bool,
    update_authority_is_signer: bool,
    is_updating: bool,
) -> Result<()> {
    if data.name.len() > MAX_NAME_LENGTH {
        return Err(ESTokenMetadataError::NameTooLong.into());
    }

    if data.symbol.len() > MAX_SYMBOL_LENGTH {
        return Err(ESTokenMetadataError::SymbolTooLong.into());
    }

    if data.uri.len() > MAX_URI_LENGTH {
        return Err(ESTokenMetadataError::UriTooLong.into());
    }

    if data.seller_fee_basis_points > MAX_BASIS_POINT {
        return Err(ESTokenMetadataError::InvalidBasisPoints.into());
    }

    if data.share_insurance_mint.is_some() {
    } else {
        if data.share_insurance_token_amount > 0 {
            return Err(ESTokenMetadataError::InvalidTokenAmount.into());
        }
    }

    if data.creators.is_some() {
        if let Some(creators) = &data.creators {
            if creators.len() > MAX_CREATOR_LENGTH {
                return Err(ESTokenMetadataError::CreatorsTooLong.into());
            }

            if creators.is_empty() {
                return Err(ESTokenMetadataError::CreatorsMustBeAtleastOne.into());
            } else {
                let mut found = false;
                let mut total: u64 = 0;
                for i in 0..creators.len() {
                    let creator = &creators[i];
                    for iter in creators.iter().skip(i + 1) {
                        if iter.address == creator.address {
                            return Err(ESTokenMetadataError::DuplicateCreatorAddress.into());
                        }
                    }

                    total = total
                        .checked_add(creator.share)
                        .ok_or(ESTokenMetadataError::NumericalOverflowError)?;

                    if creator.address == *update_authority {
                        found = true;
                    }

                    // Dont allow metadata owner to unilaterally say a creator verified...
                    // cross check with array, only let them say verified=true here if
                    // it already was true and in the array.
                    // Conversely, dont let a verified creator be wiped.
                    if (!update_authority_is_signer || creator.address != *update_authority)
                        && !allow_direct_creator_writes
                    {
                        if let Some(existing_creators) = &existing_metadata.data.creators {
                            match existing_creators
                                .iter()
                                .find(|c| c.address == creator.address)
                            {
                                Some(existing_creator) => {
                                    if creator.verified && !existing_creator.verified {
                                        return Err(
                                            ESTokenMetadataError::CannotVerifyAnotherCreator.into(),
                                        );
                                    } else if !creator.verified && existing_creator.verified {
                                        return Err(
                                            ESTokenMetadataError::CannotUnverifyAnotherCreator
                                                .into(),
                                        );
                                    }
                                }
                                None => {
                                    if creator.verified {
                                        return Err(
                                            ESTokenMetadataError::CannotVerifyAnotherCreator.into(),
                                        );
                                    }
                                }
                            }
                        } else if creator.verified {
                            return Err(ESTokenMetadataError::CannotVerifyAnotherCreator.into());
                        }
                    }
                }

                if !found && !allow_direct_creator_writes && !is_updating {
                    return Err(ESTokenMetadataError::MustBeOneOfCreators.into());
                }
            }
        }
    }

    Ok(())
}

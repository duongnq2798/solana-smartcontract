use anchor_lang::prelude::*;

#[error_code]
pub enum ESTokenMetadataError {
    #[msg("Failed to update metadata")]
    UpdateMetadataFailed,

    #[msg("You must be the mint authority and signer on this transaction")]
    NotMintAuthority,
    #[msg("Mint authority provided does not match the authority on the mint")]
    InvalidMintAuthority,

    #[msg("Data is immutable")]
    DataIsImmutable,
    #[msg("Account does not have correct owner!")]
    IncorrectOwner,
    #[msg("Update Authority given does not match")]
    UpdateAuthorityIncorrect,
    #[msg("Update Authority needs to be signer to update metadata")]
    UpdateAuthorityIsNotSigner,

    #[msg("Name too long")]
    NameTooLong,
    #[msg("Symbol too long")]
    SymbolTooLong,
    #[msg("URI too long")]
    UriTooLong,
    #[msg("Basis points cannot be more than 10000")]
    InvalidBasisPoints,

    #[msg("Invalid token amount")]
    InvalidTokenAmount,
    #[msg("Creators list too long")]
    CreatorsTooLong,
    #[msg("Creators must be at least one if set")]
    CreatorsMustBeAtleastOne,
    #[msg("If using a creators array, you must be one of the creators listed")]
    MustBeOneOfCreators,
    #[msg("No duplicate creator addresses")]
    DuplicateCreatorAddress,
    #[msg("You cannot unilaterally verify another creator, they must sign")]
    CannotVerifyAnotherCreator,
    #[msg("You cannot unilaterally unverify another creator")]
    CannotUnverifyAnotherCreator,

    #[msg("Numerical Overflow Error")]
    NumericalOverflowError,

    #[msg("Invalid Account Data")]
    InvalidAccountData,
}

use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    // 0x1770 - 0
    #[msg("Invalid Super Owner")]
    InvalidSuperOwner,
    // 0x1772
    #[msg("Invalid Global Pool Address")]
    InvalidGlobalPool,
    // 0x1773
    #[msg("Marketplace Fee is Permyriad")]
    InvalidFeePercent,

    // 0x1775 - 5
    #[msg("Treasury Wallet Not Configured")]
    NoTeamTreasuryYet,
    // 0x1776
    #[msg("Treasury Address Not Exist")]
    TreasuryAddressNotFound,
    // 0x1778
    #[msg("Total Treasury Rate Sum Should Less Than 100%")]
    MaxTreasuryRateSumExceed,
    // 0x1779
    #[msg("Team Treasury Wallet Count Mismatch")]
    TeamTreasuryCountMismatch,
    // 0x177a - 10
    #[msg("Team Treasury Wallet Address Mismatch")]
    TeamTreasuryAddressMismatch,

    // 0x177b
    #[msg("Uninitialized Account")]
    Uninitialized,
    // 0x177c-----------
    #[msg("Instruction Parameter is Invalid")]
    InvalidParamInput,

    // 0x177d
    #[msg("Insufficient User SOL Balance")]
    InsufficientUserBalance,
    //
    #[msg("Invalid token amount in the wallet")]
    InvalidUserTokenBalance,
    #[msg("Insufficient SOL Balance in the Escrow Vault")]
    InsufficientEscrowVaultSolBalance,
    #[msg("Insufficient Token Balance in the Escrow Vault")]
    InsufficientEscrowVaultTokenAmount,
    #[msg("Insufficient Token Balance To Sell")]
    InsufficientSupplyForSellToken,
    #[msg("Invalid Token Amount")]
    InvalidTokenAmount,
    #[msg("Invalid NFT Token Account")]
    InvalidNftTokenAccount,
    #[msg("Invalid Metadata Address")]
    InvaliedMetadata,
    #[msg("Unknown Collection Or The Collection Is Not Allowed")]
    UnkownOrNotAllowedNFTCollection,
    #[msg("Can't Parse The NFT's Creators")]
    MetadataCreatorParseError,
    #[msg("Not Found Nft")]
    InvalidNFTAddress,
    // 0x1774
    #[msg("Max Team Count is 16")]
    MaxGamePlayerCountExceed,
    // 0x1777
    #[msg("Game Player Already Exist")]
    GamePlayerAlreadyAdded,
    #[msg("Invalid Claim Time")]
    InvalidClaimTime,
    #[msg("Too Low XP")]
    InvalidLowXp,
    #[msg("Invalid XP Claim")]
    InvalidXPClaim,
    // 0x1771
    #[msg("Invalid Owner")]
    InvalidOwner,
}

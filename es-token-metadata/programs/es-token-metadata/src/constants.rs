pub const PROGRAM_ID: &str = "";
pub const METADATA_SEED_KEY: &str = "es-metadata";

// Data Sizes
// ref: https://book.anchor-lang.com/anchor_references/space.html

pub const MAX_NAME_LENGTH: usize = 32;
pub const MAX_SYMBOL_LENGTH: usize = 10;
pub const MAX_URI_LENGTH: usize = 200;
pub const MAX_CREATOR_LENGTH: usize = 5;
pub const MAX_REFERRER_LENGTH: usize = 5;
pub const MAX_BASIS_POINT: u16 = 10000;

pub const METADATA_SIZE: usize =
32 // pub mint: Pubkey,
+ 32 // pub update_authority: Pubkey,
+ DATA_SIZE// pub data: Data,
+ 1 // pub is_mutable: bool,
;

pub const DATA_SIZE:usize = 
4 + MAX_NAME_LENGTH // pub name: String,
+ 4 + MAX_SYMBOL_LENGTH // pub symbol: String,
+ 4 + MAX_URI_LENGTH // pub uri: String,
+ 16 // pub seller_fee_basis_points: u16,
+ 64 // pub share_insurance_token_amount: u64,
+ 32 // pub share_insurance_mint: Pubkey,
+ 1 + 4 + (MAX_CREATOR_LENGTH * CREATOR_SIZE) //pub creators: Option<Vec<Creator>>,
+ 1 + 4 + (MAX_REFERRER_LENGTH * REFERRER_SIZE) //pub creators: Option<Vec<Creator>>,
;

pub const CREATOR_SIZE: usize = 
32 // pub address: Pubkey,
+ 1 // pub verified: bool,
+ 64 // pub share: u64,
;

pub const REFERRER_SIZE: usize = 
32 // pub address: Pubkey,
;
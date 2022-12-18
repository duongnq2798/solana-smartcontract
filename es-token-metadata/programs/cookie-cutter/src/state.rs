
use anchor_lang::{prelude::*, AnchorDeserialize, AnchorSerialize};

#[account]
pub struct CookieCutter {
    pub cookie_cutter_fee_account: Pubkey,
    pub cookie_cutter_treasury: Pubkey,
    pub treasury_withdrawal_destination: Pubkey,
    pub fee_withdrawal_destination: Pubkey,
    pub treasury_mint: Pubkey,
    pub authority: Pubkey,
    pub creator: Pubkey,
    pub bump: u8,
    pub treasury_bump: u8,
    pub fee_payer_bump: u8,
    pub seller_fee_basis_points: u16,
    pub requires_sign_off: bool,
    pub can_change_sale_price: bool,
    pub escrow_payment_bump: u8,

}



#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct CreateCookieCutterArgs {
    pub cookie_cutter_bump: u8,
    pub cookie_cutter_treasury_bump: u8,
    pub cookie_cutter_fee_payer_bump: u8,
    pub seller_fee_basis_points: u16,
    pub requires_sign_off: bool,
    pub can_change_sale_price: bool,
}


#[account]
pub struct SellerTradeState {
    pub ata: Pubkey,
    pub price: u64,
    pub highest_bidder: Option<Pubkey>,
    pub metadata_account: Pubkey
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug)]
pub struct SellArgs {
    pub metadata_bump : u8,
    pub program_as_signer_bump : u8,
    pub buyer_price : u64,
    pub token_size : u64
}

#[account]
pub struct BuyerTradeState {
    pub bidder: Pubkey,
    pub bid_price: u64,
    pub ata: Pubkey,
}
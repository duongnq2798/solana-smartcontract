
pub const PREFIX : &str = "cookie_cutter";
pub const FEE_PAYER: &str = "fee_payer";
pub const TREASURY: &str = "treasury";
pub const SIGNER: &str = "signer";



pub const COOKIE_CUTTER_SIZE: usize = 
8 +                                                         // key
32 +                                                        // fee Payer
32 +                                                        // treasury
32 +                                                        // treasury_withdrawal_destination
32 +                                                        // fee withdrawal destination
32 +                                                        // treasury mint
32 +                                                        // authority
32 +                                                        // creator
1 +                                                         // bump
1 +                                                         // treasury_bump
1 +                                                         // fee_payer_bump
2 +                                                         // seller fee basis points
1 +                                                         // requires sign off
1 +                                                         // can change sale price
8 +                                                         // escrow payment bump
1 +                                                         // has external auctioneer program as an authority
8 +                                                         // auctioneer pda bump
203                                                         // padding
;

pub const COOKIE_CUTTER_FEE_PAYER_SIZE: usize = 
4       // 
+ 32    // public key
;

pub const COOKIE_CUTTER_TREASURY_SIZE: usize = 
4       // default allocation
+ 32    // public key
;

pub const ESCROW_PAYMENT_ACCOUNT_SIZE: usize = 
4       // default allocation
+ 32    // public key
;

pub const TRADE_STATE_SIZE: usize = 
4       // default allocation
+ 32    // seller pubkey
+ 32    // mint key
+ 32    // metadata key
+ 32    // the highest bidding trade state address
+ 100   // padding
;





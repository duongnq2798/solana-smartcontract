use anchor_lang::prelude::*;

#[event]
pub struct DeleteProductEvent {
    #[index]
    pub topic: String,
    pub product_id: u64,
    pub currency: Pubkey,
    pub merchant: Pubkey,
    pub merchant_receive_token_account: Pubkey,
    pub price: u64,
    pub deleted: bool,
    pub cancellable: bool,
    pub bump: u8,
}

pub fn emit(
    product_id: u64,
    currency: Pubkey,
    merchant: Pubkey,
    merchant_receive_token_account: Pubkey,
    price: u64,
    deleted: bool,
    cancellable: bool,
    bump: u8,
) -> Result<()> {
    emit!(
        DeleteProductEvent {
            topic: "web3.genoa.v1.delete_product".to_string(),
            product_id: product_id,
            currency: currency,
            merchant: merchant,
            merchant_receive_token_account: merchant_receive_token_account,
            price: price,
            deleted: deleted,
            cancellable: cancellable,
            bump: bump
        }
    );
    Ok(())
}
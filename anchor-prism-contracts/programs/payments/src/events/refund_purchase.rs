use anchor_lang::prelude::*;

#[event]
pub struct RefundPurchaseEvent {
    #[index]
    pub topic: String,
    pub product_id: u64,
    pub order_id: u64,
    pub merchant: Pubkey,
    pub merchant_receive_token_account: Pubkey,
    pub customer: Pubkey,
    pub customer_deposit_token_account: Pubkey,
    pub currency: Pubkey,
    pub amount: u64,
    pub delivered: bool,
    pub cancelled: bool,
    pub refunded: bool
}

pub fn emit(
    product_id: u64,
    order_id: u64,
    merchant: Pubkey,
    merchant_receive_token_account: Pubkey,
    customer: Pubkey,
    customer_deposit_token_account: Pubkey,
    currency: Pubkey,
    amount: u64,
    delivered: bool,
    cancelled: bool,
    refunded: bool
) -> Result<()> {
    emit!(
        RefundPurchaseEvent {
            topic: "web3.genoa.v1.refund_purchase".to_string(),
            product_id: product_id,
            order_id: order_id,
            merchant: merchant,
            merchant_receive_token_account: merchant_receive_token_account,
            customer: customer,
            customer_deposit_token_account: customer_deposit_token_account,
            currency: currency,
            amount: amount,
            delivered: delivered,
            cancelled: cancelled,
            refunded: refunded,
        }
    );
    Ok(())
}
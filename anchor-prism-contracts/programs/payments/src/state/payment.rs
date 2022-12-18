use anchor_lang::prelude::*;

#[account]
pub struct Payment {
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

impl Payment {

    pub fn create(
        &mut self,
        product_id: u64,
        order_id: u64,
        merchant: Pubkey,
        merchant_receive_token_account: Pubkey,
        customer: Pubkey,
        customer_deposit_token_account: Pubkey,
        currency: Pubkey,
        amount: u64,
    ) -> Result<()>{
        self.product_id = product_id;
        self.order_id = order_id;
        self.merchant = merchant;
        self.merchant_receive_token_account = merchant_receive_token_account;
        self.customer = customer;
        self.customer_deposit_token_account = customer_deposit_token_account;
        self.currency = currency;
        self.amount = amount;
        self.delivered = false;
        self.cancelled = false;
        self.refunded = false;
        Ok(())
    }

    pub fn mark_delivered(&mut self) -> Result<()> {
        self.delivered = true;
        Ok(())
    }

    pub fn mark_refunded(&mut self) -> Result<()> {
        self.refunded = true;
        Ok(())
    }

    pub fn mark_cancelled(&mut self) -> Result<()> {
        self.cancelled = true;
        Ok(())
    }

} 


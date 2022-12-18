use anchor_lang::prelude::*;

#[account]
pub struct ProductEscrow {
    pub customer: Pubkey,
    pub customer_token_account: Pubkey,
    pub merchant: Pubkey,
    pub merchant_token_account: Pubkey,
    pub amount: u64,
    pub delivered: bool,
    pub cancelled: bool,
    pub refunded: bool,
    pub cancel_time: i64,
    pub refund_time: i64,
    pub purchase_time: i64,
    pub delivered_time: i64,
    pub bump: u8,
}

impl ProductEscrow {
    pub fn create(
        &mut self,
        customer: Pubkey,
        customer_token_account: Pubkey,
        merchant: Pubkey,
        merchant_token_account: Pubkey,
        amount: u64,
        bump: u8,
    ) -> Result<()> {
        let clock: Clock = Clock::get().unwrap();
        self.customer = customer;
        self.customer_token_account = customer_token_account;
        self.merchant = merchant;
        self.merchant_token_account = merchant_token_account;
        self.amount = amount;
        self.delivered = false;
        self.cancelled = false;
        self.refunded = false;
        self.bump = bump;
        self.purchase_time = clock.unix_timestamp;
        Ok(())
    }

    pub fn mark_delivered(&mut self) -> Result<()> {
        let clock: Clock = Clock::get().unwrap();
        self.delivered_time = clock.unix_timestamp;
        self.delivered = true;
        Ok(())
    }

    pub fn mark_cancelled(&mut self) -> Result<()> {
        let clock: Clock = Clock::get().unwrap();
        self.cancel_time = clock.unix_timestamp;
        self.cancelled = true;
        Ok(())
    }

    pub fn mark_refunded(&mut self) -> Result<()> {
        let clock: Clock = Clock::get().unwrap();
        self.refund_time = clock.unix_timestamp;
        self.refunded = true;
        Ok(())
    }
}

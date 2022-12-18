use anchor_lang::prelude::*;

#[account]
pub struct SubscriptionEscrow {
    pub customer: Pubkey,
    pub customer_token_account: Pubkey,
    pub merchant: Pubkey,
    pub merchant_token_account: Pubkey,
    pub period: i64,
    pub price: u64,
    pub amount_owed: u64,
    pub cancelled: bool,
    pub refunded: bool,
    pub next_payment_due: i64,
    pub cancel_time: i64,
    pub refund_time: i64,
    pub subscribe_time: i64,
    pub bump: u8,
}

impl SubscriptionEscrow {
    pub fn create(
        &mut self,
        customer: Pubkey,
        customer_token_account: Pubkey,
        merchant: Pubkey,
        merchant_token_account: Pubkey,
        period: i64,
        price: u64,
        bump: u8,
    ) -> Result<()> {
        let clock: Clock = Clock::get().unwrap();
        let now = clock.unix_timestamp;
        self.customer = customer;
        self.customer_token_account = customer_token_account;
        self.merchant = merchant;
        self.merchant_token_account = merchant_token_account;
        self.period = period;
        self.price = price;
        self.amount_owed = 0;
        self.cancelled = false;
        self.refunded = false;
        self.next_payment_due = now + period;
        self.subscribe_time = now;
        self.bump = bump;
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

    pub fn has_payment_due(&mut self) -> bool {
        let clock: Clock = Clock::get().unwrap();
        self.next_payment_due <= clock.unix_timestamp
    }

    pub fn charge_arrears_account(&mut self) -> Result<()> {
        self.amount_owed += self.price;
        Ok(())
    }

    pub fn iterate_next_payment(&mut self) -> Result<()> {
        self.next_payment_due = self.next_payment_due + self.period;
        Ok(())
    }
}

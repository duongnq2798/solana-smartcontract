use anchor_lang::prelude::*;

#[account]
pub struct Subscription {
    pub infrastructure: Pubkey,
    pub name: Vec<u8>,
    pub description: Vec<u8>,
    pub active: bool,
    pub currency: Pubkey,
    pub merchant_token_account: Pubkey,
    pub price: u64,
    pub period: i64,
    pub max_supply: u64,
    pub active_supply: u64,
    pub bump: u8,
}

impl Subscription {
    pub fn create(
        &mut self,
        name: Vec<u8>,
        description: Vec<u8>,
        currency: Pubkey,
        merchant_token_account: Pubkey,
        price: u64,
        period: i64,
        max_supply: u64,
        bump: u8,
    ) -> Result<()> {
        self.name = name;
        self.description = description;
        self.active = true;
        self.currency = currency;
        self.merchant_token_account = merchant_token_account;
        self.price = price;
        self.period = period;
        self.max_supply = max_supply;
        self.active_supply = 0;
        self.bump = bump;
        Ok(())
    }

    pub fn update(&mut self, name: Vec<u8>, description: Vec<u8>, active: bool, max_supply: u64) -> Result<()> {
        self.name = name;
        self.description = description;
        self.active = active;
        self.max_supply = max_supply;
        Ok(())
    }
}

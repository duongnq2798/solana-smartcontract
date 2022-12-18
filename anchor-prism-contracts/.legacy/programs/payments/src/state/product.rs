use anchor_lang::prelude::*;

#[account]
pub struct Product {
    pub infrastructure: Pubkey,
    pub name: Vec<u8>,
    pub description: Vec<u8>,
    pub active: bool,
    pub currency: Pubkey,
    pub merchant_token_account: Pubkey,
    pub price: u64,
    pub inventory: u64,
    pub bump: u8,
}

impl Product {
    pub fn create(
        &mut self,
        infrastructure: Pubkey,
        name: Vec<u8>,
        description: Vec<u8>,
        currency: Pubkey,
        merchant_token_account: Pubkey,
        price: u64,
        inventory: u64,
        bump: u8,
    ) -> Result<()> {
        self.infrastructure = infrastructure;
        self.name = name;
        self.description = description;
        self.active = true;
        self.currency = currency;
        self.merchant_token_account = merchant_token_account;
        self.price = price;
        self.inventory = inventory;
        self.bump = bump;
        Ok(())
    }

    pub fn update(
        &mut self,
        name: Vec<u8>,
        description: Vec<u8>,
        active: bool,
        price: u64,
        inventory: u64,
    ) -> Result<()> {
        self.name = name;
        self.description = description;
        self.active = active;
        self.price = price;
        self.inventory = inventory;
        Ok(())
    }

    pub fn increase_inventory(&mut self, quantity: u64) -> Result<()> {
        self.inventory = self.inventory + quantity;
        Ok(())
    }

    pub fn decrease_inventory(&mut self, quantity: u64) -> Result<()> {
        self.inventory = self.inventory - quantity;
        Ok(())
    }
}

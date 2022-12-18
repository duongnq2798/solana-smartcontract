use anchor_lang::prelude::*;

#[account]
pub struct Product {
    pub product_id: u64,
    pub merchant: Pubkey,
    pub merchant_receive_token_account: Pubkey,
    pub mint: Pubkey,
    pub price: u64,
    pub deleted: bool,
    pub cancellable: bool,
    pub bump: u8,
}

impl Product {

    pub fn create(
        &mut self,
        product_id: u64,
        merchant: Pubkey,
        merchant_receive_token_account: Pubkey,
        mint: Pubkey,
        price: u64,
        cancellable: bool,
        bump: u8
    ) -> Result<()>{
        self.product_id = product_id;
        self.merchant = merchant;
        self.merchant_receive_token_account = merchant_receive_token_account;
        self.mint = mint;
        self.price = price;
        self.deleted = false;
        self.cancellable = cancellable;
        self.bump = bump;
        Ok(())
    }

    pub fn delete(
        &mut self
    ) -> Result<()> {
        self.deleted = true;
        Ok(())
    }

}


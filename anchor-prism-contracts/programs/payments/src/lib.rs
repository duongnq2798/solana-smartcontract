use anchor_lang::prelude::*;
use instructions::*;

pub mod events;
pub mod instructions;
pub mod modules;
pub mod state;

// declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Mainnet
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); // Localnet
// declare_id!("A6t6oiVdncWrbM98YcVbu3fVDsZYrVtj7h2HDqc3Bo7R"); // Devnet

#[program]
pub mod payments {
    use super::*;

    pub fn cancel_purchase(ctx: Context<CancelPurchase>, product_id: u64) -> Result<()> {
        instructions::cancel_purchase(ctx, product_id)
    }

    pub fn create_product(ctx: Context<CreateProduct>, product_id: u64, price: u64, cancellable: bool, bump: u8) -> Result<()> {
        instructions::create_product(ctx, product_id, price, cancellable, bump)
    }

    pub fn delete_product(ctx: Context<DeleteProduct>, product_id: u64) -> Result<()> {
        instructions::delete_product(ctx, product_id)
    }

    pub fn deliver_product(ctx: Context<DeliverProduct>, product_id: u64) -> Result<()> {
        instructions::deliver_product(ctx, product_id)
    }

    pub fn purchase_product(ctx: Context<PurchaseProduct>, order_id: u64, product_id: u64, price: u64, _vault_account_bump: u8) -> Result<()> {
        instructions::purchase_product(ctx, order_id, product_id, price, _vault_account_bump)
    }

    pub fn refund_purchase(ctx: Context<RefundPurchase>, product_id: u64) -> Result<()> {
        instructions::refund_purchase(ctx, product_id)
    }
    
}

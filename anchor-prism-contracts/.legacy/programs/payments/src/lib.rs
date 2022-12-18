use anchor_lang::prelude::*;
use instructions::*;

// pub mod enums;
pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod payments {
    use super::*;

    pub fn cancel_purchase(ctx: Context<CancelPurchase>) -> Result<()> {
        instructions::cancel_purchase(ctx)
    }

    pub fn cancel_subscription(ctx: Context<CancelSubscription>) -> Result<()> {
        instructions::cancel_subscription(ctx)
    }

    pub fn create_infrastructure(
        ctx: Context<CreateInfrastructure>,
        payload: CreateInfrastructurePayload,
    ) -> Result<()> {
        instructions::create_infrastructure(ctx, payload)
    }
    pub fn create_product(
        ctx: Context<CreateProduct>,
        payload: CreateProductPayload,
    ) -> Result<()> {
        instructions::create_product(ctx, payload)
    }

    pub fn create_subscription(
        ctx: Context<CreateSubscription>,
        payload: CreateSubscriptionPayload,
    ) -> Result<()> {
        instructions::create_subscription(ctx, payload)
    }

    pub fn deliver_product(ctx: Context<DeliverProduct>) -> Result<()> {
        instructions::deliver_product(ctx)
    }

    pub fn fund_subscription(
        ctx: Context<FundSubscription>,
        payload: FundSubscriptionPayload,
    ) -> Result<()> {
        instructions::fund_subscription(ctx, payload)
    }

    pub fn harvest_subscription(ctx: Context<HarvestSubscription>) -> Result<()> {
        instructions::harvest_subscription(ctx)
    }

    pub fn purchase_product(ctx: Context<PurchaseProduct>) -> Result<()> {
        instructions::purchase_product(ctx)
    }

    pub fn purchase_subscription(ctx: Context<PurchaseSubscription>) -> Result<()> {
        instructions::purchase_subscription(ctx)
    }

    pub fn refund_purchase(ctx: Context<RefundPurchase>) -> Result<()> {
        instructions::refund_purchase(ctx)
    }

    pub fn update_infrastructure(
        ctx: Context<UpdateInfrastructure>,
        payload: UpdateInfrastructurePayload,
    ) -> Result<()> {
        instructions::update_infrastructure(ctx, payload)
    }

    pub fn update_product(
        ctx: Context<UpdateProduct>,
        payload: UpdateProductPayload,
    ) -> Result<()> {
        instructions::update_product(ctx, payload)
    }

    pub fn update_subscription(
        ctx: Context<UpdateSubscription>,
        payload: UpdateSubscriptionPayload,
    ) -> Result<()> {
        instructions::update_subscription(ctx, payload)
    }
}

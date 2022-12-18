use anchor_lang::prelude::*;

declare_id!("5oNYKYde3DjHez2efUMYyPzR5E27oBzP2FUwyg5f67uk");

#[program]
pub mod plugin {

    use super::*;

    pub fn initialize(ctx: Context<InitializeContext>) -> Result<()> {
        msg!("initialize begin");
        ctx.accounts.plugin_state.owner = *ctx.accounts.owner.key;
        msg!("initialize end");
        Ok(())
    }

    pub fn update(ctx: Context<UpdateContext>, new_delta: u64) -> Result<()> {
        msg!("initialize begin");
        ctx.accounts.plugin_state.delta = new_delta;
        msg!("initialize end");
        Ok(())
    }

    pub fn execute(ctx: Context<ExecuteContext>, input_data: PluginExecuteInput) -> Result<()> {
        msg!("execute begin");

        let result = input_data.value_a + input_data.value_b + ctx.accounts.plugin_state.delta;
        let data = result.try_to_vec().ok().unwrap();
        anchor_lang::solana_program::program::set_return_data(&data);
        
        msg!("execute end");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeContext<'info> {
    
    /// CHECK: 
    #[account(init, payer = payer, space = 8+8+32)]
    pub plugin_state: Account<'info, PluginState>,
    
    /// CHECK:
    #[account()]
    pub owner: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateContext<'info> {
    
    /// CHECK: 
    #[account(mut, has_one = owner)]
    pub plugin_state: Account<'info, PluginState>,
    
    // CHECK: 
    #[account()]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteContext<'info> {
    /// CHECK:
    #[account()]
    pub plugin_state: Account<'info, PluginState>,
}

#[account]
pub struct PluginState {
    pub owner: Pubkey,
    pub delta: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PluginExecuteInput {
    value_a: u64,
    value_b: u64,
}
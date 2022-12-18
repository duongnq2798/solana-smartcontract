use anchor_lang::prelude::*;


declare_id!("EnNAUhQEdDNtNszfguvK5RSkSLDStPLtUqeLpbjayoNq");

#[program]
mod supply_chain_tokenized {

    use super::*;

    pub fn initialize_contract_for_material(ctx: Context<InitializeContract>) -> Result<()> {
       let marketplaceowner: &mut Account<MarketplaceOwner> = &mut ctx.accounts.marketplace_owner;

       marketplaceowner.authority = ctx.accounts.admin.key();
       marketplaceowner.number_of_open_contracts = 0;

        Ok(())
    }

    pub fn purchase_forward_contract(ctx:Context<Contract>,types_of_material: TypesOfMaterial, forward_month: ForwardMonth, oracle_pubkey: Pubkey)-> Results<()> {
        let contract: &mut Account<Contract> =  &mut ctx.accounts.contract;
        let marketplaceowner: &mut Account<MarketplaceOwner> = &mut ctx.accounts.marketplace_owner;
        let interestaccumulated: &mut Account<InterestAccumulated> = &mut ctx.accounts.interest;  
        contract.owner = ctx.accounts.owner.key(); 
        // this is when user click on the contract
        contract.types_of_material = types_of_material;
        contract.forward_month = forward_month;
        contract.contract_index = marketplaceowner.number_of_open_contracts;
        marketplaceowner.number_of_open_contracts += 1;
        // use placeholder value first. TODO: Implement: get_world_price_from_oracle
        contract.contract_price = 1800.00; //get_world_price_from_oracle(oracle_pubkey, types_of_material,forward_month);
        //placeholder value below:
        contract.purchase_date = 312121211; //Local::now().timestamp(); 
        //placeholder value below:
        interestaccumulated.length_of_hold =  0; //Local::now().timestamp();  - contract.purchase_date;
        interestaccumulated.total_interest_accumulated = 0 ; // starts with 0 interest
        contract.interest = interestaccumulated;
        Ok(())
    }
    
    // User earns interest on forward contract purchases.
    pub fn earn_interest_from_staking_contract(ctx:Context<InterestAccumulated>,staking_pool_interest: u64)-> Results<()> {
        let contract: &mut Account<Contract> =  &mut ctx.accounts.contract;
        //placeholder value below:
        interestaccumulated.length_of_hold = 121211; //Local::now().timestamp() - contract.purchase_date;

        //TODO: Implement staking pool interest function
        interestaccumulated.total_interest_accumulated += staking_pool_interest;
        Ok(())
}


    pub fn sell_forward_contract(ctx:Context<Contract>,oracle_pubkey: Pubkey)-> Results<()> {
        let contract: &mut Account<Contract> =  &mut ctx.accounts.contract;
        let marketplaceowner: &mut Account<MarketplaceOwner> = &mut ctx.accounts.marketplace_owner;
        let interestaccumulated: &mut Account<InterestAccumulated> = &mut ctx.accounts.interest;  
        contract.owner = ctx.accounts.owner.key(); 
        marketplaceowner.number_of_open_contracts -= 1;
        // Use Placeholder value at the moment
        let contract_trading_profit_or_loss= 2000.23; //get_world_price_from_oracle(oracle_pubkey, types_of_material,forward_month) - contract.contract_price;
        let contract_total_profit_loss = contract_trading_profit_or_loss + contract.interest;
        Ok(())
    }
}
// Contexts
////////////////////////////////////////////////////////////////
#[derive(Accounts)]
pub struct InitializeContract<'info> {
    // TODO: to recount space
    #[account(init, payer = admin, space = 20)]
    pub marketplace_owner : Account<'info, MarketplaceOwner>,
    #[account(mut)]
    admin: Signer<'info>,
    system_program: Program<'info, System>,
}




#[derive(Accounts)]
// this is suppose to be a PDA
pub struct Contract<'info>  {
    // TODO: to recount space
    #[account(init, seed = [&marketplace_owner.number_of_open_contracts,to_be_bytes(), owner.key().as_ref()], bump, payer = owner, space= 40)]
    pub owner: Signer<'info>,
    pub types_of_material: TypesOfMaterial,
    pub forward_month: ForwardMonth,
    pub contract_index: u64,
    pub marketplace_owner : Account<'info, MarketplaceOwner>,
    pub oracle: Pubkey,
    pub contract_price: f64,
    pub purchase_date: i64,
    pub interest: InterestAccumulated<'info>,
    pub system_program: Program<'info, System>, 
}


// Interest Account
#[account]
struct InterestAccumulated<'info>  {
    pub length_of_hold: i64,
    pub total_interest_accumulated: u64,
}

// Accounts
////////////////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct MarketplaceOwner {
    pub authority: Pubkey,
    pub number_of_open_contracts: u64 // keep tally of open contracts
}


// //TODO: 
// pub fn get_world_price_from_oracle(oracle: Pubkey, material: TypesOfMaterial, month: ForwardMonth){
//     pass;
// }


pub enum ForwardMonth {
  August,
  September,
  October  
} 

pub enum TypesOfMaterial {
    Aluminium(ForwardMonth),
    Wood(ForwardMonth),
    Steel(ForwardMonth)  
} 

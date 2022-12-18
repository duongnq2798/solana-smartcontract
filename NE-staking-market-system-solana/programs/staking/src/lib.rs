use {
    anchor_lang::{
        prelude::*,
        solana_program::program::invoke,
        system_program,
    },
    anchor_spl::{
        associated_token,
        token,
    },
    mpl_token_metadata::{
        ID as TOKEN_METADATA_ID,
        instruction as token_instruction,
        state::DataV2,
    },
    workspace::program::Workspace,
};

declare_id!("7bKzGRwzjfeDNafZh7iQZziHRznbXRLHqq27VVzs9fHa");

#[program]
mod staking {
    use super::*;
    pub fn stake(
        ctx: Context<MintNft>, 
    ) -> Result<()> {
        
        let testNftTitle = String::from("Beta");
        let testNftSymbol = String::from("BETA");
        let testNftUri = String::from("https://raw.githubusercontent.com/rowlanja/NFTPrinter/boog/outputDir/json/example.json");
        
        
        // let cpi_program = ctx.accounts.puppet_program.to_account_info();
        // let cpi_accounts = MintNft {
        //     puppet: ctx.accounts.puppet.to_account_info(),
        // };
        // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        // workspace::cpi::set_data(cpi_ctx, data)



        // let data = DataV2 {
        //     name: testNftTitle,
        //     symbol: testNftSymbol,
        //     uri: testNftUri,
        //     seller_fee_basis_points: 0,
        //     creators: None,
        //     collection: None,
        //     uses: None,
        // };
       
        // msg!("Updating metadata account...");
        // msg!("Metadata account address: {}", &ctx.accounts.metadata.to_account_info().key());
        // invoke(
        //     &token_instruction::update_metadata_accounts_v2(
        //         TOKEN_METADATA_ID, 
        //         ctx.accounts.metadata.key(), 
        //         ctx.accounts.mint_authority.key(), 
        //         None,
        //         Some(data),
        //         None,
        //         Some(true)
        //     ),
        //     &[
        //         ctx.accounts.metadata.to_account_info(),
        //         ctx.accounts.mint.to_account_info(),
        //         ctx.accounts.token_account.to_account_info(),
        //         ctx.accounts.mint_authority.to_account_info(),
        //         ctx.accounts.rent.to_account_info(),
        //     ],
        // )?;
        
        msg!("Token update process completed successfully.");
        Ok(())
    }
}

// #[derive(Accounts)]
// pub struct Stake<'info> {
//     #[account(mut)]
//     pub staking: Account<'info, MintNft>,
//     pub staking_program: Program<'info, Workspace>,
// }

#[derive(Accounts)]
pub struct ReturnContext {}

#[derive(Accounts)]
pub struct MintNft<'info> {
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,
    #[account(mut)]
    pub mint: Signer<'info>,
    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    /// CHECK: Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
}

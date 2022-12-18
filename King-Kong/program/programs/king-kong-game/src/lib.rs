use anchor_lang::prelude::*;
// use solana_program::borsh::try_from_slice_unchecked;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use metaplex_token_metadata::state::Metadata;
use solana_program::program::{invoke, invoke_signed};
use solana_program::system_instruction;
use spl_associated_token_account;

pub mod account;
pub mod constants;
pub mod error;

use account::*;
use constants::*;
use error::*;

declare_id!("GoXDkhj7go3dJBxyHJc5PNiFnbVt7s8k2REcKPXEdsQf");

#[program]
pub mod king_kong_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, _global_bump: u8, _escrow_bump: u8) -> Result<()> {
        let global_authority = &mut ctx.accounts.global_authority;
        global_authority.super_admin = ctx.accounts.admin.key();
        Ok(())
    }
    pub fn create_game_pool(
        ctx: Context<CreateGamePool>,
        _global_bump: u8,
        _game_config_bump: u8,
        _winner_pda_bump: u8,
    ) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.global_authority.super_admin,
            GameError::InvalidSuperOwner
        );
        let game_pool = ctx.accounts.game_pool.load_init()?;
        Ok(())
    }
    pub fn register_game_pool_data(
        ctx: Context<InitGamePool>,
        _global_bump: u8,
        _game_config_bump: u8,
        game_entry_fee: u64,
        tx_fee: u64,
        reward_amount: u64,
        banana_mint: Pubkey,
        banana_price: u64,
        banana_decimal: u64,
        banana_max_nums: u64,
    ) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.global_authority.super_admin,
            GameError::InvalidSuperOwner
        );
        let game_pool = &mut ctx.accounts.game_config_vault;
        game_pool.winner = COLLECTION_ADDRESS.parse::<Pubkey>().unwrap();
        game_pool.entry_fee = game_entry_fee;
        game_pool.tx_fee = tx_fee;
        game_pool.banana_price = banana_price;
        game_pool.banana_max_nums = banana_max_nums;
        game_pool.banana_decimal = banana_decimal;
        game_pool.reward_amount = reward_amount;
        game_pool.banana_mint = banana_mint;
        Ok(())
    }

    /**
     * Initialize User PDA for Escrow & Traded Volume
     */
    pub fn init_user_pool(ctx: Context<InitUserPool>, _bump: u8) -> Result<()> {
        let user_pool = &mut ctx.accounts.user_pool;
        user_pool.address = ctx.accounts.owner.key();
        Ok(())
    }

    pub fn play_game(
        ctx: Context<PlayGame>,
        _game_bump: u8,
        _escrow_bump: u8,
        _userpool_bump: u8,
        round1_banana: u64,
        round2_banana: u64,
        round3_banana: u64,
        round4_banana: u64,
    ) -> Result<()> {
        let player = ctx.accounts.owner.key();
        let game_config_vault = &mut ctx.accounts.game_config_vault;
        let mut game_pool = ctx.accounts.game_pool.load_mut()?;
        let banana_tokens = (round1_banana + round2_banana + round3_banana + round4_banana)*game_config_vault.banana_decimal;
        let user_pool = &mut ctx.accounts.user_pool;
        msg!("Deposit: {}", game_config_vault.entry_fee);
        msg!("Banana Usage: {}", banana_tokens);
        require!(
            ctx.accounts.owner.to_account_info().lamports()
                > game_config_vault.entry_fee * (100 + game_config_vault.tx_fee) / 100,
            GameError::InsufficientUserBalance
        );
        require!(
            ctx.accounts.user_token_account.amount >= banana_tokens,
            GameError::InvalidUserTokenBalance
        );
        msg!("maxlimit tokens: {}, user token: {}, playtokens: {}, {}, {}, {}, {},{}", game_config_vault.banana_max_nums, ctx.accounts.user_token_account.amount, banana_tokens, round1_banana, round2_banana, round3_banana, round4_banana, game_config_vault.banana_decimal * game_config_vault.banana_max_nums >= banana_tokens);
        require!(
            game_config_vault.banana_decimal * game_config_vault.banana_max_nums >= banana_tokens,
            GameError::InvalidParamInput
        );

        // require!(
        //     round1_banana % 1 == 0,
        //     GameError::InvalidParamInput
        // );
        // require!(
        //     round2_banana % 1 == 0,
        //     GameError::InvalidParamInput
        // );
        // require!(
        //     round3_banana % 1 == 0,
        //     GameError::InvalidParamInput
        // );
        // require!(
        //     round4_banana % 1 == 0,
        //     GameError::InvalidParamInput
        // );


        // require!(game_pool.members < 16, GameError::MaxGamePlayerCountExceed);
        if game_pool.members == 16 {// ========================== must fix 4 => 16
            game_pool.members = 0;
            if game_config_vault.winner != COLLECTION_ADDRESS.parse::<Pubkey>().unwrap() {
                ctx.accounts.winner_pda.winner_last = 1;
                game_config_vault.winner = COLLECTION_ADDRESS.parse::<Pubkey>().unwrap();
            }
        }
        
        let mut exist: u8 = 0;
        for i in 0..game_pool.members {
            let index = i as usize;
            if game_pool.players[index].eq(&player) {
                exist = 1;
            }
        }
        require!(exist == 0, GameError::GamePlayerAlreadyAdded);

        // entry fee transfer
        invoke(
            &system_instruction::transfer(
                ctx.accounts.owner.key,
                ctx.accounts.escrow_vault.key,
                game_config_vault.entry_fee,
            ),
            &[
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.escrow_vault.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;

        // transfer 75% of tx fee to daily distribute wallet
        invoke(
            &system_instruction::transfer(
                ctx.accounts.owner.key, 
                ctx.accounts.treasury_wallet1.to_account_info().key, 
                game_config_vault.entry_fee*game_config_vault.tx_fee*3/400
            ),
            &[
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.treasury_wallet1.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;
        // transfer 25% of tx fee to gold chest wallet
        invoke(
            &system_instruction::transfer(
                ctx.accounts.owner.key, 
                ctx.accounts.treasury_wallet2.to_account_info().key, 
                game_config_vault.entry_fee*game_config_vault.tx_fee/400
            ),
            &[
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.treasury_wallet2.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;

        // banana token transfer
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info().clone(),
            to: ctx.accounts.escrow_token_account.to_account_info().clone(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.clone().to_account_info(),
                cpi_accounts,
            ),
            banana_tokens,
        )?;

        // register user game play data to user_pool

        user_pool.played_nums += 1;
        user_pool.played_volume += game_config_vault.entry_fee;
        user_pool.played_banana += banana_tokens;

        // register game play data to game_pool
        let index: usize = game_pool.members as usize;
        game_pool.players[index] = player;
        game_pool.banana_usage[index][0] = round1_banana;
        game_pool.banana_usage[index][1] = round2_banana;
        game_pool.banana_usage[index][2] = round3_banana;
        game_pool.banana_usage[index][3] = round4_banana;

        game_pool.members += 1;
        let program_id = king_kong_game::ID;

        if game_pool.members == 16 {
            game_config_vault.total_plays += 1;
            let mut _data = game_pool.banana_usage[0][0] / game_config_vault.banana_decimal as u64;
            let mut _data1 =  game_pool.banana_usage[1][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(0 as u64, 1 as u64, _data, _data1, program_id, 1 as u8);
            _data =  game_pool.banana_usage[2][0] / game_config_vault.banana_decimal as u64;
            _data1 = game_pool.banana_usage[3][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(2 as u64, 3 as u64, _data, _data1, program_id, 1 as u8);
          
            _data = game_pool.banana_usage[4][0] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[5][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(4 as u64, 5 as u64, _data, _data1, program_id, 1 as u8);
            _data =  game_pool.banana_usage[6][0] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[7][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(6 as u64, 7 as u64, _data, _data1, program_id, 1 as u8);
            _data =  game_pool.banana_usage[8][0] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[9][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(8 as u64, 9 as u64, _data, _data1, program_id, 1 as u8);
            _data =  game_pool.banana_usage[10][0] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[11][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(10 as u64, 11 as u64, _data, _data1, program_id, 1 as u8);
            _data =  game_pool.banana_usage[12][0] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[13][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(12 as u64, 13 as u64, _data, _data1, program_id, 1 as u8);
            _data =  game_pool.banana_usage[14][0] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[15][0] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(14 as u64, 15 as u64, _data, _data1, program_id, 1 as u8);
            // ----------------------------------------------------------
            // play round2
            _data = game_pool.banana_usage[game_pool.round1_result[0] as usize][1] / game_config_vault.banana_decimal as u64;
            _data1 = game_pool.banana_usage[game_pool.round1_result[1] as usize][1] / game_config_vault.banana_decimal as u64;
            let mut _data2 = game_pool.round1_result[0];
            let mut _data3 = game_pool.round1_result[1];
            game_pool.play_round(_data2, _data3, _data, _data1, program_id, 2 as u8);
            _data2 = game_pool.round1_result[2];
            _data3 = game_pool.round1_result[3];
            _data =  game_pool.banana_usage[game_pool.round1_result[2] as usize][1] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[game_pool.round1_result[3] as usize][1] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(_data2, _data3, _data, _data1, program_id, 2 as u8);
            _data2 = game_pool.round1_result[4];
            _data3 = game_pool.round1_result[5];
            _data =  game_pool.banana_usage[game_pool.round1_result[4] as usize][1] / game_config_vault.banana_decimal as u64;
            _data1 = game_pool.banana_usage[game_pool.round1_result[5] as usize][1] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(_data2, _data3, _data, _data1, program_id, 2 as u8);
            _data2 = game_pool.round1_result[6];
            _data3 = game_pool.round1_result[7];
            _data =  game_pool.banana_usage[game_pool.round1_result[6] as usize][1]/ game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[game_pool.round1_result[7] as usize][1] / game_config_vault.banana_decimal as u64;
            let _ = game_pool.play_round(_data2, _data3, _data, _data1, program_id, 2 as u8);
            // play round 3
            _data2 = game_pool.round2_result[0];
            _data3 = game_pool.round2_result[1];
            _data =   game_pool.banana_usage[game_pool.round2_result[0] as usize][2] / game_config_vault.banana_decimal as u64;
            _data1 =  game_pool.banana_usage[game_pool.round2_result[1] as usize][2] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(_data2, _data3, _data, _data1, program_id, 3 as u8);
            _data2 = game_pool.round2_result[2];
            _data3 = game_pool.round2_result[3];
            _data =  game_pool.banana_usage[game_pool.round2_result[2] as usize][2] / game_config_vault.banana_decimal as u64;
            _data1 =   game_pool.banana_usage[game_pool.round2_result[3] as usize][2] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(_data2, _data3, _data, _data1, program_id, 3 as u8);
            // play round 4
            _data2 = game_pool.round3_result[0];
            _data3 = game_pool.round3_result[1];
            _data =  game_pool.banana_usage[game_pool.round3_result[0] as usize][3] / game_config_vault.banana_decimal as u64;
            _data1 =   game_pool.banana_usage[game_pool.round3_result[1] as usize][3] / game_config_vault.banana_decimal as u64;
            game_pool.play_round(_data2, _data3, _data, _data1, program_id, 4 as u8);

            // winner account set
            game_config_vault.winner = game_pool.players[game_pool.round4_result[0] as usize];
        }

        Ok(())
    }

    pub fn claim_xpreward(
        ctx: Context<ClaimXpreward>,
        _game_config_bump: u8,
        _escrow_bump: u8,
        _user_bump: u8,
        xp: u64,
    ) -> Result<()> {
        let mut claim_amount: u64 = 0;
        let user_pool = &mut ctx.accounts.user_pool;
        let game_config_vault = &mut ctx.accounts.game_config_vault;

        require!(xp>=500, GameError::InvalidLowXp);

        if user_pool.xpreward1_claimed == 0 && user_pool.played_nums>=10{
            require!(
                ctx.accounts.escrow_token_account.amount >= game_config_vault.banana_decimal * 5,
                GameError::InsufficientEscrowVaultTokenAmount
            );

            claim_amount = game_config_vault.banana_decimal * 5;
        } else if user_pool.xpreward2_claimed == 0 && xp>=2500 && user_pool.played_nums>=50 {
            require!(
                ctx.accounts.escrow_token_account.amount >= game_config_vault.banana_decimal * 10,
                GameError::InsufficientEscrowVaultTokenAmount
            );

            claim_amount = game_config_vault.banana_decimal * 10;
        } else if user_pool.xpreward3_claimed == 0 && xp>=5000  && user_pool.played_nums>=100 {
            require!(
                ctx.accounts.escrow_token_account.amount >= game_config_vault.banana_decimal * 20,
                GameError::InsufficientEscrowVaultTokenAmount
            );

            claim_amount = game_config_vault.banana_decimal * 20;
        } else if user_pool.xpreward4_claimed == 0 && xp >=10000 && user_pool.played_nums>=200 {
            require!(
                ctx.accounts.escrow_token_account.amount >= game_config_vault.banana_decimal * 50,
                GameError::InsufficientEscrowVaultTokenAmount
            );

            claim_amount = game_config_vault.banana_decimal * 50;
        } else if user_pool.xpreward5_claimed == 0 && xp >=50000 && user_pool.played_nums>=1000 {
            require!(
                ctx.accounts.escrow_token_account.amount >= game_config_vault.banana_decimal * 100,
                GameError::InsufficientEscrowVaultTokenAmount
            );
            claim_amount = game_config_vault.banana_decimal * 100;
        } 

        require!(claim_amount>0, GameError::InvalidXPClaim);

        // transfer reward token
        let seeds = &[ESCROW_VAULT_SEED.as_bytes(), &[_escrow_bump]];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info().clone(),
            to: ctx.accounts.user_token_account.to_account_info().clone(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            claim_amount,
        )?;

        if claim_amount == game_config_vault.banana_decimal * 5 {
            user_pool.xpreward1_claimed = 1;
        } else if claim_amount == game_config_vault.banana_decimal * 10 {
            user_pool.xpreward2_claimed = 1;
        } else if claim_amount == game_config_vault.banana_decimal * 20 {
            user_pool.xpreward3_claimed = 1;
        } else if claim_amount == game_config_vault.banana_decimal * 50 {
            user_pool.xpreward4_claimed = 1;
        } else if claim_amount == game_config_vault.banana_decimal * 100 {
            user_pool.xpreward5_claimed = 1;
        }

        Ok(())
    }

    pub fn claim_reward(
        ctx: Context<ClaimReward>,
        _game_config_bump: u8,
        _escrow_bump: u8,
        _user_bump: u8,
    ) -> Result<()> {

        require!(
            ctx.accounts.dest_nft_token_account.amount == 1,
            GameError::InsufficientEscrowVaultTokenAmount
        );
        let game_config_vault = &mut ctx.accounts.game_config_vault;
        
        let claimer = &ctx.accounts.owner.key();
        let user_pool = &mut ctx.accounts.user_pool;
        require!(
            game_config_vault.winner == *claimer || 1 == user_pool.winner_last,
            GameError::InvalidOwner
        );

        msg!("Claim Rewards: {}", game_config_vault.reward_amount);
        require!(
            ctx.accounts.escrow_vault.to_account_info().lamports() > game_config_vault.reward_amount,
            GameError::InsufficientEscrowVaultSolBalance
        );

        // generate random token_rewards & validate
        let timestamp = Clock::get()?.unix_timestamp;
        let (player_address, _bump) = Pubkey::find_program_address(
            &[
                RANDOM_SEED.as_bytes(),
                timestamp.to_string().as_bytes(),
                &claimer.to_bytes(),
            ],
            &king_kong_game::ID,
        );
        let char_vec: Vec<char> = player_address.to_string().chars().collect();
        let mut number = u32::from(char_vec[0])
            + u32::from(char_vec[1])
            + u32::from(char_vec[2])
            + u32::from(char_vec[3])
            + u32::from(char_vec[4])
            + u32::from(char_vec[5])
            + u32::from(char_vec[6])
            + u32::from(char_vec[7])
            + u32::from(char_vec[8]);

        let mut random = number % 10;
        let mut token_rewards = 1 * game_config_vault.banana_decimal;
        if random < 6 {
        } else if random < 9 {
            token_rewards = 2 * game_config_vault.banana_decimal;
        } else {
            token_rewards = 3 * game_config_vault.banana_decimal;
        }
        msg!("Claim Token: {}", token_rewards);
        require!(
            ctx.accounts.escrow_token_account.amount >= token_rewards,
            GameError::InsufficientEscrowVaultTokenAmount
        );
        // nft mint validate
        let escrow_nums = game_config_vault.escrow_nft_nums;
        let mut withdrawn: u8 = 0;
        let mut index: usize = 0;
        for i in 0..escrow_nums {
            let idx = i as usize;
            if game_config_vault.escrow_nft_mints[idx].eq(&ctx.accounts.nft_mint.key()) {
                index = idx;
                withdrawn = 1;
                break;
            }
        }
        require!(withdrawn == 1, GameError::InvalidNFTAddress);
        // get signers for withdraw nft
        let seeds = &[ESCROW_VAULT_SEED.as_bytes(), &[_escrow_bump]];
        let signer = &[&seeds[..]];

        // get percent for claim nft (1%)
        number = u32::from(char_vec[0])
            + u32::from(char_vec[2])
            + u32::from(char_vec[4])
            + u32::from(char_vec[6])
            + u32::from(char_vec[8]);
        random = number % 100;
        // claim nft instructions
        if random == 0 && game_config_vault.escrow_nft_nums > 0 {
            game_config_vault.escrow_nft_mints[index] = game_config_vault.escrow_nft_mints[(escrow_nums-1) as usize];
            game_config_vault.escrow_nft_nums -=1;

            let token_account_info = &mut &ctx.accounts.user_nft_token_account;
            let dest_token_account_info = &mut &ctx.accounts.dest_nft_token_account;
            let token_program = &mut &ctx.accounts.token_program;

            let cpi_accounts = Transfer {
                from: dest_token_account_info.to_account_info().clone(),
                to: token_account_info.to_account_info().clone(),
                authority: ctx.accounts.escrow_vault.to_account_info(),
            };
            token::transfer(
                CpiContext::new_with_signer(
                    token_program.clone().to_account_info(),
                    cpi_accounts,
                    signer,
                ),
                1,
            )?;
            invoke_signed(
                &spl_token::instruction::close_account(
                    token_program.key,
                    &dest_token_account_info.key(),
                    ctx.accounts.owner.key,
                    &ctx.accounts.escrow_vault.key(),
                    &[],
                )?,
                &[
                    token_program.clone().to_account_info(),
                    dest_token_account_info.to_account_info().clone(),
                    ctx.accounts.owner.to_account_info().clone(),
                    ctx.accounts.escrow_vault.to_account_info().clone(),
                ],
                signer,
            )?;
            user_pool.winned_nft += 1;


        }

        // claim reward sol
        invoke_signed(
            &system_instruction::transfer(
                ctx.accounts.escrow_vault.key,
                claimer,
                game_config_vault.reward_amount,
            ),
            &[
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.escrow_vault.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            signer,
        )?;

        // transfer reward token
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info().clone(),
            to: ctx.accounts.user_token_account.to_account_info().clone(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            token_rewards,
        )?;

        // set to claimed already
        game_config_vault.winner = COLLECTION_ADDRESS.parse::<Pubkey>().unwrap();
        user_pool.winner_last = 0;
        // register winned data to user_pool
        user_pool.winned_nums += 1;
        user_pool.winned_volume += game_config_vault.reward_amount;
        user_pool.winned_banana += token_rewards;

        Ok(())
    }

    pub fn buy_token(
        ctx: Context<BuyToken>,
        _game_bump: u8,
        _escrow_bump: u8,
        _user_bump: u8,
        token_amount: u64,
    ) -> Result<()> {
        msg!("Purchase Token: {}", token_amount);
        let escrow_token_account = &mut ctx.accounts.escrow_token_account;
        let user_token_account = &mut ctx.accounts.user_token_account;
        let game_config_vault = &mut ctx.accounts.game_config_vault;
        let user_pool = &mut ctx.accounts.user_pool;
        require!(
            escrow_token_account.amount >= token_amount,
            GameError::InsufficientSupplyForSellToken
        );
        require!(
            token_amount % game_config_vault.banana_decimal == 0,
            GameError::InvalidTokenAmount
        );

        require!(
            ctx.accounts.buyer.to_account_info().lamports()
                > game_config_vault.banana_price * token_amount / game_config_vault.banana_decimal,
            GameError::InsufficientUserBalance
        );
        // register purchase data to user_pool
        user_pool.buyed_banana += token_amount;

        let seeds = &[ESCROW_VAULT_SEED.as_bytes(), &[_escrow_bump]];
        let signer = &[&seeds[..]];
        // transfer sol to escrow_vault
        invoke(
            &system_instruction::transfer(
                ctx.accounts.buyer.key,
                ctx.accounts.escrow_vault.key,
                game_config_vault.banana_price * token_amount / game_config_vault.banana_decimal,
            ),
            &[
                ctx.accounts.buyer.to_account_info().clone(),
                ctx.accounts.escrow_vault.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
        )?;
        // transfer token to user
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info().clone(),
            to: user_token_account.to_account_info().clone(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            token_amount,
        )?;

        Ok(())
    }

    pub fn withdraw_escrow_volume(
        ctx: Context<WithdrawEscrowVolume>,
        _global_bump: u8,
        _escrow_bump: u8,
        _game_config_bump: u8,
        sol_amount: u64,
        token_amount: u64,
    )-> Result<()> {
        require!(
            sol_amount < ctx.accounts.escrow_vault.to_account_info().lamports(),
            GameError::InsufficientEscrowVaultSolBalance
        );
        require!(
            token_amount <= ctx.accounts.escrow_token_account.amount,
            GameError::InsufficientEscrowVaultTokenAmount
        );

        let seeds = &[ESCROW_VAULT_SEED.as_bytes(), &[_escrow_bump]];
        let signer = &[&seeds[..]];

        // withdraw sol to admin wallet
        invoke_signed(
            &system_instruction::transfer(
                ctx.accounts.escrow_vault.key,
                ctx.accounts.admin.key,
                sol_amount,
            ),
            &[
                ctx.accounts.escrow_vault.to_account_info().clone(),
                ctx.accounts.admin.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            signer
        )?;

        // withdraw token to admin wallet
        let user_token_account_info = &mut &ctx.accounts.user_token_account;
        let escrow_token_account_info = &mut &ctx.accounts.escrow_token_account;
        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[ESCROW_VAULT_SEED.as_bytes(), &[_escrow_bump]];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: escrow_token_account_info.to_account_info().clone(),
            to: user_token_account_info.to_account_info().clone(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            token_amount,
        )?;

        Ok(())

    }

    pub fn withdraw_escrow_nft(
        ctx: Context<WithdrawEscrowNft>,
        _global_bump: u8,
        _escrow_bump: u8,
        _game_config_bump: u8,
    ) -> Result<()> {

        require!(
            ctx.accounts.dest_nft_token_account.amount == 1,
            GameError::InvalidNftTokenAccount
        );
        
        let game_config_vault = &mut ctx.accounts.game_config_vault;
        msg!("Withdraw Nft Mint: {:?}", ctx.accounts.nft_mint.key());
        require!(
            game_config_vault.escrow_nft_nums>0,
            GameError::InsufficientEscrowVaultTokenAmount
        );
        // update deposited nfts list
        let escrow_nums = game_config_vault.escrow_nft_nums as usize;
        let escrow_mints = game_config_vault.escrow_nft_mints;
        let mut index: usize = 0;
        let mut withdrawn: u8 = 0;
        for i in 0..escrow_nums {
            let idx = i as usize;
            if escrow_mints[idx].eq(&ctx.accounts.nft_mint.key()) {
                index = idx;
                withdrawn = 1;
                break;
            }
        }
        require!(withdrawn == 1, GameError::InvalidNFTAddress);
        if index != escrow_nums - 1 {
            game_config_vault.escrow_nft_mints[index] =
                game_config_vault.escrow_nft_mints[escrow_nums - 1];
        }
        game_config_vault.escrow_nft_nums -= 1;

        // withdraw nft to admin wallet
        let user_token_account_info = &mut &ctx.accounts.user_nft_token_account;
        let dest_token_account_info = &mut &ctx.accounts.dest_nft_token_account;
        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[ESCROW_VAULT_SEED.as_bytes(), &[_escrow_bump]];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: dest_token_account_info.to_account_info().clone(),
            to: user_token_account_info.to_account_info().clone(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            1,
        )?;
        invoke_signed(
            &spl_token::instruction::close_account(
                token_program.key,
                &dest_token_account_info.key(),
                ctx.accounts.admin.key,
                &ctx.accounts.escrow_vault.key(),
                &[],
            )?,
            &[
                token_program.clone().to_account_info(),
                dest_token_account_info.to_account_info().clone(),
                ctx.accounts.admin.to_account_info().clone(),
                ctx.accounts.escrow_vault.to_account_info().clone(),
            ],
            signer,
        )?;

        Ok(())
    }

    pub fn deposit_nft_escrow(
        ctx: Context<DepositNftEscrow>,
        _global_bump: u8,
        _escrow_bump: u8,
        _game_config_bump: u8,
    ) -> Result<()> {
        let mint_metadata = &mut &ctx.accounts.mint_metadata;

        let (metadata, _) = Pubkey::find_program_address(
            &[
                metaplex_token_metadata::state::PREFIX.as_bytes(),
                metaplex_token_metadata::id().as_ref(),
                ctx.accounts.nft_mint.key().as_ref(),
            ],
            &metaplex_token_metadata::id(),
        );
        require!(metadata == mint_metadata.key(), GameError::InvaliedMetadata);
        // verify metadata is legit
        let nft_metadata = Metadata::from_account_info(mint_metadata)?;
        if let Some(creators) = nft_metadata.data.creators {
            let mut valid: u8 = 0;
            let mut collection: Pubkey = Pubkey::default();
            for creator in creators {
                if creator.address.to_string() == COLLECTION_ADDRESS && creator.verified == true {
                    valid = 1;
                    collection = creator.address;
                    break;
                }
            }
            require!(valid == 1, GameError::UnkownOrNotAllowedNFTCollection);
            msg!("Collection= {:?}", collection);
        } else {
            return Err(error!(GameError::MetadataCreatorParseError));
        };
        msg!("Deposit NFT: {:?}", ctx.accounts.nft_mint.key());

        let game_config_vault = &mut ctx.accounts.game_config_vault;
        let idx = game_config_vault.escrow_nft_nums as usize;
        game_config_vault.escrow_nft_mints[idx] = ctx.accounts.nft_mint.key();
        game_config_vault.escrow_nft_nums += 1;

        let token_account_info = &mut &ctx.accounts.user_nft_token_account;
        let dest_token_account_info = &mut &ctx.accounts.dest_nft_token_account;
        let token_program = &mut &ctx.accounts.token_program;

        let cpi_accounts = Transfer {
            from: token_account_info.to_account_info().clone(),
            to: dest_token_account_info.to_account_info().clone(),
            authority: ctx.accounts.admin.to_account_info().clone(),
        };
        token::transfer(
            CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
            1,
        )?;

        Ok(())
    }

    pub fn claim_banana_for_nft_holders(
        ctx: Context<ClaimBnn>,
        _escrow_bump: u8,
        _game_config_bump: u8,
        _nft_bump: u8,
    ) -> Result<()> {
        let mint_metadata = &mut &ctx.accounts.mint_metadata;
        let escrow_token_account = &mut ctx.accounts.escrow_token_account;
        
        let game_config_vault = &mut ctx.accounts.game_config_vault;
        let token_claim_amount = game_config_vault.banana_decimal;

        let (metadata, _) = Pubkey::find_program_address(
            &[
                metaplex_token_metadata::state::PREFIX.as_bytes(),
                metaplex_token_metadata::id().as_ref(),
                ctx.accounts.nft_mint.key().as_ref(),
            ],
            &metaplex_token_metadata::id(),
        );
        require!(metadata == mint_metadata.key(), GameError::InvaliedMetadata);
        // verify metadata is legit
        let nft_metadata = Metadata::from_account_info(mint_metadata)?;
        if let Some(creators) = nft_metadata.data.creators {
            let mut valid: u8 = 0;
            let mut collection: Pubkey = Pubkey::default();
            for creator in creators {
                if creator.address.to_string() == COLLECTION_ADDRESS && creator.verified == true {
                    valid = 1;
                    collection = creator.address;
                    break;
                }
            }
            require!(valid == 1, GameError::UnkownOrNotAllowedNFTCollection);
            msg!("Collection= {:?}", collection);
        } else {
            return Err(error!(GameError::MetadataCreatorParseError));
        };
        msg!(
            "Claim token for NFT holder: {:?}",
            ctx.accounts.nft_mint.key()
        );

        require!(
            escrow_token_account.amount > game_config_vault.banana_decimal,
            GameError::InsufficientSupplyForSellToken
        );
        let timestamp = Clock::get()?.unix_timestamp;

        require!(
            timestamp - 86400 > ctx.accounts.nft_pool.last_claim_time,
            GameError::InvalidClaimTime
        );
        let nft_pool = &mut ctx.accounts.nft_pool;
        nft_pool.last_claim_time = timestamp;
        // get signers for transfer from pda2user
        let seeds = &[ESCROW_VAULT_SEED.as_bytes(), &[_escrow_bump]];
        let signer = &[&seeds[..]];
        // claim banana tokens
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info().clone(),
            to: ctx.accounts.user_token_account.to_account_info().clone(),
            authority: ctx.accounts.escrow_vault.to_account_info(),
        };
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.clone().to_account_info(),
                cpi_accounts,
                signer,
            ),
            token_claim_amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct ClaimBnn<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    
    #[account(
        init_if_needed,
        seeds = [NFT_DATA_SEED.as_ref(), nft_mint.key().as_ref()],
        bump,
        payer = owner,
        space = 16
    )]
    pub nft_pool: Box<Account<'info, NftPool>>,

    #[account(
        mut,
        constraint = escrow_token_account.mint == game_config_vault.banana_mint,
        constraint = escrow_token_account.owner == *escrow_vault.key,
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = user_token_account.mint == game_config_vault.banana_mint,
        constraint = user_token_account.owner == *owner.key,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = user_nft_token_account.mint == nft_mint.key(),
        constraint = user_nft_token_account.owner == *owner.key,
    )]
    pub user_nft_token_account: Box<Account<'info, TokenAccount>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,
    /// the mint metadata
    #[account(
        mut,
        constraint = mint_metadata.owner == &metaplex_token_metadata::ID
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(constraint = token_metadata_program.key == &metaplex_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct DepositNftEscrow<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        constraint = *admin.key == global_authority.super_admin
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    

    #[account(
        mut,
        constraint = user_nft_token_account.mint == nft_mint.key(),
        constraint = user_nft_token_account.owner == *admin.key,
        constraint = user_nft_token_account.amount == 1,
    )]
    pub user_nft_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = dest_nft_token_account.mint == nft_mint.key(),
        constraint = dest_nft_token_account.owner == escrow_vault.key(),
    )]
    pub dest_nft_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,
    /// the mint metadata
    #[account(
        mut,
        constraint = mint_metadata.owner == &metaplex_token_metadata::ID
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub mint_metadata: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(constraint = token_metadata_program.key == &metaplex_token_metadata::ID)]
    pub token_metadata_program: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct WithdrawEscrowVolume<'info> { 
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        constraint = *admin.key == global_authority.super_admin
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == game_config_vault.banana_mint,
        constraint = user_token_account.owner == *admin.key,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = escrow_token_account.mint == game_config_vault.banana_mint,
        constraint = escrow_token_account.owner == *escrow_vault.key,
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct WithdrawEscrowNft<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        constraint = *admin.key == global_authority.super_admin
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    
    
    // --
    #[account(
        mut,
        constraint = user_nft_token_account.mint == nft_mint.key(),
        constraint = user_nft_token_account.owner == *admin.key,
        
    )]
    pub user_nft_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = dest_nft_token_account.mint == nft_mint.key(),
        constraint = dest_nft_token_account.owner == escrow_vault.key(),
        constraint = dest_nft_token_account.amount == 1,
    )]
    pub dest_nft_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
        space = 8 + 32,
        payer = admin
    )]
    pub global_authority: Account<'info, GlobalPool>,
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    // #[account(
    //     init,
    //     seeds = [GAME_VAULT_SEED.as_ref()],
    //     bump,
    //     space = 2216,
    //     payer = admin
    // )]
    // pub game_pool: Box<Account<'info, GamePool>>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateGamePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    #[account(
        init,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
        space = 8 + 1152,
        payer = admin
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    
    #[account(
        init,
        seeds = [USER_DATA_SEED.as_ref(), COLLECTION_ADDRESS.parse::<Pubkey>().unwrap().as_ref()],
        bump,
        space = 118,
        payer = admin,
    )]
    pub winner_pda: Account<'info, UserPool>,
    #[account(zero)]
    pub game_pool: AccountLoader<'info, GamePool>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitGamePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: Box<Account<'info, GlobalPool>>,
    // #[account(mut)]
    // pub game_pool: AccountLoader<'info, GamePool>,
    #[account(
        mut,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct InitUserPool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        seeds = [USER_DATA_SEED.as_ref(), owner.key().as_ref()],
        bump,
        payer=owner,
        space=118
    )]
    pub user_pool: Account<'info, UserPool>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct PlayGame<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    #[account(
        mut
    )]
    pub game_pool: AccountLoader<'info, GamePool>,
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [USER_DATA_SEED.as_ref(), owner.key().as_ref()],
        bump,
    )]
    pub user_pool: Account<'info, UserPool>,
    #[account(
        mut,
        constraint = user_token_account.mint == game_config_vault.banana_mint,
        constraint = user_token_account.owner == *owner.key,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = escrow_token_account.mint == game_config_vault.banana_mint,
        constraint = escrow_token_account.owner == *escrow_vault.key,
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        seeds=[USER_DATA_SEED.as_ref(), game_config_vault.winner.key().as_ref()],
        bump
    )]
    pub winner_pda: Account<'info, UserPool>,

    #[account(
        mut,
        constraint = treasury_wallet1.key() == DAILY_REWARD_DIST_WALLET.parse::<Pubkey>().unwrap(),
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub treasury_wallet1: AccountInfo<'info>,

    #[account(
        mut,
        constraint = treasury_wallet2.key() == GOLD_CHEST_WALLET.parse::<Pubkey>().unwrap(),
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub treasury_wallet2: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct ClaimXpreward<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [USER_DATA_SEED.as_ref(), owner.key().as_ref()],
        bump,
    )]
    pub user_pool: Account<'info, UserPool>,
    #[account(
        mut,
        constraint = user_token_account.mint == game_config_vault.banana_mint,
        constraint = user_token_account.owner == *owner.key,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = escrow_token_account.mint == game_config_vault.banana_mint,
        constraint = escrow_token_account.owner == *escrow_vault.key,
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [USER_DATA_SEED.as_ref(), owner.key().as_ref()],
        bump,
    )]
    pub user_pool: Account<'info, UserPool>,
    #[account(
        mut,
        constraint = user_token_account.mint == game_config_vault.banana_mint,
        constraint = user_token_account.owner == *owner.key,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = escrow_token_account.mint == game_config_vault.banana_mint,
        constraint = escrow_token_account.owner == *escrow_vault.key,
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = user_nft_token_account.mint == nft_mint.key(),
        constraint = user_nft_token_account.owner == *owner.key,
        
    )]
    pub user_nft_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = dest_nft_token_account.mint == nft_mint.key(),
        constraint = dest_nft_token_account.owner == escrow_vault.key(),
    )]
    pub dest_nft_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub nft_mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct BuyToken<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [GAME_CONFIGVAULT_SEED.as_ref()],
        bump,
    )]
    pub game_config_vault: Box<Account<'info, GameConfigPool>>,
    #[account(
        mut,
        seeds = [ESCROW_VAULT_SEED.as_ref()],
        bump,
    )]
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub escrow_vault: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [USER_DATA_SEED.as_ref(), buyer.key().as_ref()],
        bump,
    )]
    pub user_pool: Account<'info, UserPool>,
    #[account(
        mut,
        constraint = user_token_account.mint == game_config_vault.banana_mint,
        constraint = user_token_account.owner == *buyer.key,
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        mut,
        constraint = escrow_token_account.mint == game_config_vault.banana_mint,
        constraint = escrow_token_account.owner == *escrow_vault.key,
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

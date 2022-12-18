use anchor_lang::{
    prelude::*, 
    solana_program::{
        clock, 
        slot_hashes::SlotHashes,
        keccak::{hash, Hash}
    }
};

declare_id!("4A74C5CvTQwwUQDYJrKzMwXNywJwi5qoUuvpYgJLaYY2");

pub const CASINO_HOURSE_SEED_PREFIX: &str = "casino_house";
pub const CASINO_PLAYER_SEED_PREFIX: &str = "casino_player";
pub const MAX_PLAYER_COUNT: usize = 6;

#[program]
pub mod casino {
    use super::*;

    pub fn build_house(ctx: Context<BuildHouse>) -> Result<()> {
        let house = &mut ctx.accounts.house;
        house.authority = ctx.accounts.authority.to_account_info().key();
        house.player_count = 0;
        house.status = HouseStatus::Initialized;
        house.players = vec![];

        // let mut slot_hashes = SlotHashes::new(&[(1, Hash::default()), (2, Hash::default())]);
        let slot = clock::Clock::get().unwrap().slot;
        let time_stamp: u64 = clock::Clock::get().unwrap().unix_timestamp.try_into().unwrap();
        let hash = hash(&slot.to_be_bytes());

        // let hash = SlotHashes::slot_hashes(&slot_hashes);
        
        // house.rand = slot.try_into().unwrap();
        let buf: [u8; 32] = Hash::to_bytes(hash);
        let slice: [u8; 4] = [buf[0], 20, 10, buf[4]];
        house.rand = u32::from_be_bytes(slice);
            // house.rand = 120u32;
        // let random_seed = Keypair::new().pubkey();
        // let requestor = VrfRequestor::new(Network::Devnet).unwrap();
        // requestor.request_randomness(&payer, &random_seed).unwrap();
        // let randomness = requestor.get_randomness(&randomness);

        // getrandom(&mut buf).unwrap();
        // house.rand = u32::from_be_bytes(buf);
        Ok(())
    }

    pub fn add_player(ctx: Context<AddPlayer>) -> Result<()> {
        let player = &mut ctx.accounts.player;
        let house = &mut ctx.accounts.house;
        player.key = ctx.accounts.authority.to_account_info().key();
        player.house = house.key();
        house.player_count = house.player_count.checked_add(1).unwrap();
        house.players.push(player.key());
        Ok(())
    }
}


#[derive(Accounts)]
pub struct BuildHouse<'info> {
    /// CHECK:
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        space = House::LEN + 8,
        seeds = [
            CASINO_HOURSE_SEED_PREFIX.as_bytes(),
            authority.key.as_ref(),
        ],
        bump,
        payer = authority,
    )]
    pub house: Account<'info, House>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddPlayer<'info> {
    /// CHECK:
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = house.status == HouseStatus::Initialized,
        constraint = !house.players.iter().any(|x| x == player.to_account_info().key),
        constraint = house.player_count < MAX_PLAYER_COUNT.try_into().unwrap(),
    )]
    pub house: Account<'info, House>,

    #[account(
        init,
        payer = authority,
        space = Player::LEN + 8,
        seeds = [
            CASINO_PLAYER_SEED_PREFIX.as_bytes(),
            house.key().as_ref(),
            authority.key.as_ref(),
        ],
        bump,
    )]
    pub player: Account<'info, Player>,

    pub system_program: Program<'info, System>,
}


#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum HouseStatus {
    None,
    Initialized
}

impl Default for HouseStatus {
    fn default() -> Self {
        Self::None
    }
}


#[account]
#[derive(Default)]
pub struct House {
    pub authority: Pubkey,
    pub status: HouseStatus,
    pub player_count: u32,
    pub players: Vec<Pubkey>,
    pub rand: u32,
}

impl House {
    pub const LEN: usize = 32 + 1 + 4 + 32 * MAX_PLAYER_COUNT + 4;
}

#[account]
#[derive(Default)]
pub struct Player {
    pub key: Pubkey,
    pub house: Pubkey,
}

impl Player {
    pub const LEN: usize = 32 + 32;
}
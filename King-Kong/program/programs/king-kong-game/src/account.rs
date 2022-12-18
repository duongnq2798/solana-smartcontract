use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
#[derive(Default)]
pub struct GlobalPool {
    // 8 + 32
    pub super_admin: Pubkey, // 32
}

#[account]
#[derive(Default)]
pub struct NftPool {
    // 8 + 8
    pub last_claim_time: i64, // 8
}

#[account]
#[derive(Default)]
pub struct GameConfigPool {
    // 8+1152
    pub entry_fee: u64,                 // 8
    pub tx_fee: u64,                    // 8
    pub reward_amount: u64,             // 8
    pub banana_mint: Pubkey,            // 32
    pub banana_price: u64,              // 8
    pub banana_max_nums: u64,           // 8
    pub banana_decimal: u64,            // 8
    pub escrow_nft_mints: [Pubkey; 32], // 32*32
    pub escrow_nft_nums: u64,           // 8
    pub winner: Pubkey,                 // 32
    pub total_plays: u64,               // 8
}
#[account(zero_copy)]
pub struct GamePool {
    // 8 + 1152 = 1160
    pub members: u64,                 // 8
    pub players: [Pubkey; 16],        // 32 * 16
    pub banana_usage: [[u64; 4]; 16], // 8*4*16
    pub round1_result: [u64; 8],      // 8*8
    pub round2_result: [u64; 4],      // 8*4
    pub round3_result: [u64; 2],      // 8*2
    pub round4_result: [u64; 1],      // 8
}

#[account]
#[derive(Default)]
pub struct UserPool {
    // 8 + 110 = 118
    pub address: Pubkey,    // 32
    pub played_volume: u64, // 8
    pub played_nums: u64,   // 8
    pub played_banana: u64, // 8
    pub buyed_banana: u64,  // 8
    pub winned_volume: u64, // 8
    pub winned_nums: u64,   // 8
    pub winned_banana: u64, // 8
    pub winned_nft: u64,    // 8
    pub winner_last: u8,    // 1
    pub xp: u64,                // 8
    pub xpreward1_claimed: u8,  // 1
    pub xpreward2_claimed: u8,  // 1
    pub xpreward3_claimed: u8,  // 1
    pub xpreward4_claimed: u8,  // 1
    pub xpreward5_claimed: u8,  // 1
}

impl GamePool {
    pub fn play_round(
        &mut self,
        player1_idx: u64,
        player2_idx: u64,
        player1_banana: u64,
        player2_banana: u64,
        program_id: Pubkey,
        round: u8,
    ) -> Result<()> {
        let timestamp = Clock::get()?.unix_timestamp;
        let (player_address, bump) = Pubkey::find_program_address(
            &[
                RANDOM_SEED.as_bytes(),
                timestamp.to_string().as_bytes(),
                player1_idx.to_string().as_bytes(),
                player2_idx.to_string().as_bytes(),
            ],
            &program_id,
        );

        let char_vec: Vec<char> = player_address.to_string().chars().collect();
        let number = u32::from(char_vec[0]) + u32::from(char_vec[2]) + u32::from(char_vec[4]);
        let mut winner = player1_idx;
        if player1_banana == player2_banana {
            if (number % 2) == 1 {
                winner = player2_idx;
            }
        } else if player1_banana > player2_banana {
            let rand = (number % 4) as u8;
            if rand == 3 {
                winner = player2_idx;
            }
        } else {
            let rand = (number % 4) as u8;

            if rand < 3 {
                winner = player2_idx;
            }
        }

        if round == 1 {
            let result_idx = (player1_idx / 2) as usize;
            self.round1_result[result_idx] = winner;
        } else if round == 2 {
            let result_idx = (player1_idx / 4) as usize;
            self.round2_result[result_idx] = winner;
        } else if round == 3 {
            let result_idx = (player1_idx / 8) as usize;
            self.round3_result[result_idx] = winner;
        } else if round == 4 {
            let result_idx = (player1_idx / 16) as usize;
            self.round4_result[result_idx] = winner;
        }
        Ok(())
    }
}

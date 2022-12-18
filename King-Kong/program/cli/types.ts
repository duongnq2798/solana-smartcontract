import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export const GLOBAL_AUTHORITY_SEED = "global-authority-v1";
export const GAME_VAULT_SEED = "game";
export const GAME_CONFIGVAULT_SEED = "game-config-vault";
export const ESCROW_VAULT_SEED = "escrow-vault";
export const USER_DATA_SEED = "user-info-v1";
export const NFT_DATA_SEED = "nft-data";
export const PROGRAM_ID = new PublicKey("GoXDkhj7go3dJBxyHJc5PNiFnbVt7s8k2REcKPXEdsQf");
export const BANANA_TOKEN_MINT = new PublicKey("AsACVnuMa5jpmfp3BjArmb2qWg5A6HBkuXePwT37RrLY");
export const COLLECTION_ADDRESS = "G42V1DfQKKHrxxfdjDrRphPStZx5Jqu2JwShfN3WoKmK";
export const GAME_POOL_ADDRESS = "H7TcNyyb9BAdQrEHy2TA95hpMhsWW5cp5jkyXpBPS7Uq";

export const DAILY_REWARD_DIST_WALLET = new PublicKey("2LTT5ECGUFULALM6CxW5zb2MEfT6ikiyEk9W8V3SDA3X");
export const GOLD_CHEST_WALLET = new PublicKey("G42V1DfQKKHrxxfdjDrRphPStZx5Jqu2JwShfN3WoKmK");

// H3rmqbVz8NTCkGABeue3yc9PgioL2i1RPrQM45itdKMu
export const BANANA_TOKEN_DECIMAL = 1_000_000_000;

export const USER_POOL_SIZE = 105;     // 8 + 74
export const GAME_CONFIGPOOL_SIZE = 1160;     // 8 + 1127
export const GAME_POOL_SIZE = 1160;

export interface GlobalPool {
    // 8 + 32
    superAdmin: PublicKey,          // 32
}

export interface GameConfigPool {

    entryFee: anchor.BN,               // 8
    txFee: anchor.BN,                  // 8
    rewardAmount: anchor.BN,           // 8
    bananaMint: PublicKey              // 32
    bananaPrice: anchor.BN,            // 8
    bananaMaxNums: anchor.BN,         // 8
    bananaDecimal: anchor.BN,          // 8
    winner: PublicKey,               // 32
    totalPlays: anchor.BN,
    escrowNftMints: PublicKey[],      // 
    escrowNftNums: anchor.BN          // 
}

export interface GamePool {
    members: anchor.BN,           // 8
    players: PublicKey[],         // 32 * 16
    bananaUsage: anchor.BN[][],  // 8*4*16
    round1Result: anchor.BN[],   // 1*8
    round2Result: anchor.BN[],   // 1*4
    round3Result: anchor.BN[],   // 1*2
    round4Result: anchor.BN[],         // 1*1
}

export interface UserPool {
    // 8 + 74
    address: PublicKey,         // 32
    playedVolume: anchor.BN,   // 8
    playedNums: anchor.BN,           // 8
    playedBanana: anchor.BN,         // 8
    buyedBanana: anchor.BN,          // 8
    winnedVolume: anchor.BN,         // 8
    winnedNums: anchor.BN,           // 8
    winnedBanana: anchor.BN,         // 8
    winnedNft: anchor.BN,            // 8
    winnerLast: number,           // 1
}
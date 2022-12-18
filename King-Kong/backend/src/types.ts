import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

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

export interface GamePoolData {
  members: number,           // 8
  players: PublicKey[],         // 32 * 16
  bananaUsage: number[][],  // 8*4*16
  round1Result: number[],   // 1*8
  round2Result: number[],   // 1*4
  round3Result: number[],   // 1*2
  round4Result: number[],         // 1*1
}

export interface UserPool {
  // 8 + 110
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
  xp: anchor.BN,                // 8
  xpreward1claimed: number,     // 1
  xpreward2claimed: number,     // 1
  xpreward3claimed: number,     // 1
  xpreward4claimed: number,     // 1
  xpreward5claimed: number,     // 1
}
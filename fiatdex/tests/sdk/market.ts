import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import { PublicKey, Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createAssociatedTokenAccount, createMint, createMintToCheckedInstruction, getAccount, getMint, mintTo, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Fiatdex } from "../../target/types/fiatdex";
import * as genAccs from "../../generated/accounts";

export interface Market {
  // Accounts
  marketer: PublicKey,
  market: PublicKey,
  eventQueue: PublicKey,
  eventQueueKeypair?: Keypair,
  orderbook: PublicKey,
  orderbookKeypair?: Keypair,
  bids: PublicKey,
  bidsKeypair?: Keypair,
  asks: PublicKey,
  asksKeypair?: Keypair,
  quoteMint: PublicKey,
  baseMint: PublicKey,
  quoteVault: PublicKey,
  baseVault: PublicKey,
  rent: PublicKey,
  tokenProgram: PublicKey,
  systemProgram: PublicKey,
  // Args
  marketId: Array<number>,
  minBaseOrderSize: BN,
  tickSize: BN, // FP32
}

export async function initMarketObj(program: anchor.Program<Fiatdex>, provider: anchor.Provider, wallet: anchor.Wallet, marketId: Array<number>, minBaseOrderSize: BN, tickSize: BN): Promise<Market> {
  let baseMint = await createMint(provider.connection,
    wallet.payer,
    wallet.publicKey,
    null,
    6
  );
  let quoteMint = await createMint(provider.connection,
    wallet.payer,
    wallet.publicKey,
    null,
    6
  );
  let tx = new anchor.web3.Transaction();
  let nowBn = new anchor.BN(Date.now() / 1000);
  // let auctionIdArray = Array.from(auctionId);
  let [market] = await anchor.web3.PublicKey.findProgramAddress(
    // TODO toBuffer might not be LE (lower endian) by default
    [Buffer.from("market"), Buffer.from(marketId), wallet.publicKey.toBuffer()],
    program.programId
  )
  let [quoteVault] = await anchor.web3.PublicKey.findProgramAddress(
    // TODO toBuffer might not be LE (lower endian) by default
    [Buffer.from("quote_vault"), Buffer.from(marketId), wallet.publicKey.toBuffer()],
    program.programId
  )
  let [baseVault] = await anchor.web3.PublicKey.findProgramAddress(
    // TODO toBuffer might not be LE (lower endian) by default
    [Buffer.from("base_vault"), Buffer.from(marketId), wallet.publicKey.toBuffer()],
    program.programId
  )
  let orderbookKeypair = new anchor.web3.Keypair();
  let orderbook = orderbookKeypair.publicKey;
  let eventQueueKeypair = new anchor.web3.Keypair();
  let eventQueue = eventQueueKeypair.publicKey;
  let bidsKeypair = new anchor.web3.Keypair();
  let bids = bidsKeypair.publicKey;
  let asksKeypair = new anchor.web3.Keypair();
  let asks = asksKeypair.publicKey;
  return {
    marketer: wallet.publicKey,
    market,
    eventQueue,
    eventQueueKeypair,
    orderbook,
    orderbookKeypair,
    bids,
    bidsKeypair,
    asks,
    asksKeypair,
    quoteMint,
    baseMint,
    quoteVault,
    baseVault,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
    // Args
    marketId,
    minBaseOrderSize,
    tickSize,
  }
}

/*
export async function fetchAuctionObj(program: anchor.Program<AuctionHouse>, provider: anchor.Provider, authority: PublicKey, auctionId: Array<number>, naclKeypair?: nacl.BoxKeyPair): Promise<Auction> {
  let [auction] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("auction"), Buffer.from(auctionId), authority.toBuffer()],
    program.programId
  )
  let fetchedAuction = await genAccs.Auction.fetch(provider.connection, auction);
  return {
    ...fetchedAuction,
    auctioneer: authority,
    auction,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: anchor.web3.SystemProgram.programId,
    naclKeypair,
  }
}

*/
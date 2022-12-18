import { Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';

import fs from 'fs';
import path from 'path';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

import {
    BANANA_TOKEN_DECIMAL,
    BANANA_TOKEN_MINT,
    GLOBAL_AUTHORITY_SEED,
    ESCROW_VAULT_SEED,
    GAME_VAULT_SEED,
    USER_DATA_SEED,
    PROGRAM_ID,
    GamePool
} from './types';
import { IDL as KingKongGameIdl } from "./king_kong_game";
import { isInitializedUser } from './utils';
import {
    PublicKey,
    Connection,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    Keypair
} from '@solana/web3.js';
import { createBuyTokenTx, createClaimBananaForNftHoldersTx, createClaimXprewardTx, createDepositNftEscrowTx, createGamePoolTx, createInitGamePoolTx, createInitializeTx, createInitUserTx, createWithdrawEscrowNftTx, createWithdrawEscrowVolumeTx, gamePlayTx, getClaimRewardTx, getGameState, getUserState } from './script';

let solConnection = null;
let payer = null;
let program: Program = null;
let programId = new anchor.web3.PublicKey(PROGRAM_ID);

export const setClusterConfig = async (cluster: web3.Cluster) => {
    solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
    const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve(process.env.ANCHOR_WALLET), 'utf-8'))), { skipValidation: true });
    const wallet = new NodeWallet(walletKeypair);
    // anchor.setProvider(anchor.AnchorProvider.local(web3.clusterApiUrl(cluster)));
    // Configure the client to use the local cluster.
    anchor.setProvider(new anchor.AnchorProvider(solConnection, wallet, { skipPreflight: true, commitment: 'confirmed' }));
    payer = wallet;

    // Generate the program client from IDL.
    program = new anchor.Program(KingKongGameIdl as anchor.Idl, programId);
    console.log('ProgramId: ', program.programId.toBase58());

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    console.log('GlobalAuthority: ', globalAuthority.toBase58());
    // await main();
}

const main = async () => {
    setClusterConfig('devnet');
    // await initProject();
    // await createGamePool();
    // await initGamePool(100000000, 4, 1600000000, "AsACVnuMa5jpmfp3BjArmb2qWg5A6HBkuXePwT37RrLY", 110000000, 1000000000, 1);
    // await initUserPool();

    await playGame(1, 0, 0, 0);
    // await buyBnn(1000000000)

    // await depositNftEscrow(new PublicKey("5J6UyFFr3xjidyzjKfmDQxL8oaqsVV7rUGQgGTBXYk59"));
    // await withdrawEscrowVolume();
    // await withdrawEscrowNft();
    // await claimBananaForNftHolders(new PublicKey("3rKjzUqCg2R3vzS4b5waXNew5jwe7hKWB9iZjp2k2XXW"));

    // await claimReward();

    // await claimXpreward(500);

    await getGameState(program)
    // await getUserState(payer.publicKey, program);
}


export const claimXpreward = async (
    xp: number
) => {
    let token_mint = BANANA_TOKEN_MINT;

    const tx = await createClaimXprewardTx(xp, payer.publicKey, token_mint, program, solConnection);
    const { blockhash } = await solConnection.getRecentBlockhash('confirmed');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "confirmed");
    console.log("txHash =", txId);
}

export const initProject = async (
) => {
    const tx = await createInitializeTx(payer.publicKey, program);
    const { blockhash } = await solConnection.getRecentBlockhash('confirmed');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "confirmed");
    console.log("txHash =", txId);
}

export const createGamePool = async (
) => {
    const tx = await createGamePoolTx(payer.publicKey, program, solConnection);
    const { blockhash } = await solConnection.getRecentBlockhash('confirmed');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "confirmed");
    console.log("txHash =", txId);
}

/**
 * Initialize the project
 * @param gameEntryFee game entry fee for each user (e.g. 1000000000 => 1 SOL )
 * @param txFee transaction fee for each game play (e.g. 4 => 4 % )
 * @param rewardAmount winner reward amount after the game play (e.g. 16000000000 => 1.6 SOL / 1 game )
 * @param bananaMint token mint address using as Banana in the game play (e.g. "AsACVnuMa5jpmfp3BjArmb2qWg5A6HBkuXePwT37RrLY")
 * @param bananaPrice price of one banana token (e.g. 1666666666 => 5 Sol / 3 bananas)
 * @param bananaDecimal decimal of banana token (e.g. 1000000000 => decimal: 9 )
 * @param bananaMaxNums max limit numbers of banana token that can use in one game play(e.g. 1000000000 => 1 in game )
 */
export const initGamePool = async (
    gameEntryFee: number,
    txFee: number,
    rewardAmount: number,
    bananaMint: string,
    bananaPrice: number,
    bananaDecimal: number,
    bananaMaxNums: number
) => {
    const tx = await createInitGamePoolTx(payer.publicKey, program, gameEntryFee, txFee, rewardAmount, bananaMint, bananaPrice, bananaDecimal, bananaMaxNums);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

export const initUserPool = async () => {
    const tx = await createInitUserTx(payer.publicKey, program);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

export const playGame = async (
    round1Banana: number = 0,
    round2Banana: number = 0,
    round3Banana: number = 0,
    round4Banana: number = 0,
) => {
    if (!await isInitializedUser(payer.publicKey, solConnection)) {
        console.log('User PDA is not Initialized. Should Init User PDA for first usage');
        return;
    }



    const tx = await gamePlayTx(round1Banana, round2Banana, round3Banana, round4Banana, payer.publicKey, program, solConnection);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

export const claimReward = async () => {
    let gamePool = await getGameState(program);

    let userPool = await getUserState(payer.publicKey, program);
    console.log("-------------------------------------------------")

    console.log(payer.publicKey.toBase58(), ">> payer address")



    if (gamePool.winner == payer.publicKey.toBase58() || userPool.winnerLast == 1) {
        // get mint address from the game vault
        let nft_mint = gamePool.escrowNftMints[0];
        let token_mint = BANANA_TOKEN_MINT;

        const tx = await getClaimRewardTx(token_mint, nft_mint, payer.publicKey, program, solConnection);
        const { blockhash } = await solConnection.getRecentBlockhash('finalized');
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = blockhash;
        payer.signTransaction(tx);
        let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
        await solConnection.confirmTransaction(txId, "finalized");
        console.log("Your transaction signature", txId);
    } else {
        console.log("No reward to claim!")
    }
}

export const buyBnn = async (tokenAmount: number) => {
    const tx = await createBuyTokenTx(tokenAmount, BANANA_TOKEN_MINT, payer.publicKey, program, solConnection);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

/**
 * Deposit one NFT of the king-kong collection to the game escrow vault PDA for rewarding
 * @param nft_mint : mint address of king-kong nft to be deposited to the escrow vault PDA
 */
export const depositNftEscrow = async (nft_mint: PublicKey) => {
    const tx = await createDepositNftEscrowTx(payer.publicKey, nft_mint, program, solConnection);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

export const withdrawEscrowVolume = async (solAmount: number = 1000000000, tokenAmount: number = 1000000000) => {

    let token_mint = BANANA_TOKEN_MINT;
    const tx = await createWithdrawEscrowVolumeTx(solAmount, tokenAmount, token_mint, payer.publicKey, program, solConnection);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

export const withdrawEscrowNft = async (nft_mint: string | null = null) => {
    let game_data = await getGameState(program);

    if (!nft_mint) nft_mint = game_data.escrowNftMints[0].toBase58();

    const tx = await createWithdrawEscrowNftTx(new PublicKey(nft_mint), payer.publicKey, program, solConnection);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

export const claimBananaForNftHolders = async (nft_mint: PublicKey) => {

    let token_mint = BANANA_TOKEN_MINT;

    const tx = await createClaimBananaForNftHoldersTx(
        payer.publicKey,
        nft_mint,
        token_mint,
        program,
        solConnection
    );
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

main();
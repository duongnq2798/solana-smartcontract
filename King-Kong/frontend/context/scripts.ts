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
import { WalletContextState } from '@solana/wallet-adapter-react';
import { IDL } from './king_kong_game';

import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const cluster = publicRuntimeConfig.SOLANA_NETWORK;

let solConnection = new web3.Connection(web3.clusterApiUrl(cluster));
// let solConnection: Connection| null = null;
// let payer: any = null;
// let program: Program| null = null;
// let programId = new anchor.web3.PublicKey(PROGRAM_ID);


const main = async () => {
    // setClusterConfig('devnet');
    // await initProject();
    // await createGamePool();
    // await initGamePool(100000000, 4, 1600000000, "AsACVnuMa5jpmfp3BjArmb2qWg5A6HBkuXePwT37RrLY", 110000000, 1000000000, 1);
    // await initUserPool();

    // await playGame(1, 0, 0, 0);
    // await buyBnn(1000000000)

    // await depositNftEscrow(new PublicKey("5J6UyFFr3xjidyzjKfmDQxL8oaqsVV7rUGQgGTBXYk59"));
    // await withdrawEscrowVolume();
    // await withdrawEscrowNft();
    // await claimBananaForNftHolders(new PublicKey("3rKjzUqCg2R3vzS4b5waXNew5jwe7hKWB9iZjp2k2XXW"));

    // await claimReward();

    // await claimXpreward(500);

    await getGameState()
    // await getUserState(payer.publicKey, program);
}


export const claimXpreward = async (
    xp: number,
    wallet: WalletContextState,

) => {
    try {
        if (wallet.publicKey === null) return;

        let token_mint = BANANA_TOKEN_MINT;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions())
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const tx = await createClaimXprewardTx(xp, wallet.publicKey, token_mint, program, solConnection);

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);
            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed',
            })

            await solConnection.confirmTransaction(txId, "finalized");

            console.log("Your transaction signature", txId);
        }
    } catch (e) {
        console.log("error occured in claimXpreward >> ", e)
    }
}

export const initUserPool = async (
    wallet: WalletContextState,
) => {
    try {

        if (wallet.publicKey === null) return;
        if (!wallet) return;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const tx = await createInitUserTx(wallet.publicKey, program);

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");


        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);
            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'finalized',
            })

            await solConnection.confirmTransaction(txId, "finalized");

            console.log("Your transaction signature", txId);
        }


    } catch (e) {
        console.log("error occured in initUserPool >> ", e);
    }
}

export const playGame = async (
    wallet: WalletContextState,

    round1Banana: number = 0,
    round2Banana: number = 0,
    round3Banana: number = 0,
    round4Banana: number = 0,
): Promise<number> => {
    try {

        if (wallet.publicKey === null) return -3;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        if (!await isInitializedUser(wallet.publicKey, solConnection)) {
            console.log('User PDA is not Initialized. Should Init User PDA for first usage');
            await initUserPool(wallet);
            // return;
        }

        const tx = await gamePlayTx(round1Banana, round2Banana, round3Banana, round4Banana, wallet.publicKey, program, solConnection);

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);

            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed',
            })

            let result = await solConnection.confirmTransaction(txId, "finalized");

            if (!result.value.err) {
                console.log("Your transaction signature", txId);
                return 0;
            } else {
                return -100;
            }
        }
        return -2;
    } catch (e) {
        console.log("error occured in playGame >> ", e);
        return -1;
    }
}
interface ClaimRewardReturnType {
    result: number,
    msg: string
}
export const claimReward = async (
    wallet: WalletContextState,

): Promise<ClaimRewardReturnType> => {
    try {

        if (wallet.publicKey === null) return {
            result: -2,
            msg: "Wallet is not provided"
        };
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);


        let gamePool = await getGameState();

        let userPool = await getUserState(wallet.publicKey);

        if (gamePool.winner == wallet.publicKey.toBase58() || userPool?.winnerLast == 1) {
            // get mint address from the game vault
            let nft_mint = gamePool.escrowNftMints[0];
            let token_mint = BANANA_TOKEN_MINT;

            const tx = await getClaimRewardTx(token_mint, nft_mint, wallet.publicKey, program, solConnection);
            // sign and confirm trasnaction

            let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

            tx.feePayer = (wallet.publicKey as PublicKey);
            tx.recentBlockhash = blockhash;

            if (wallet.signTransaction !== undefined) {

                // const signedTransactions = await wallet.signAllTransactions([tx]);
                let signedTx = await wallet.signTransaction(tx);

                let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                    skipPreflight: true,
                    maxRetries: 3,
                    preflightCommitment: 'confirmed',
                })

                let txx = await solConnection.confirmTransaction(txId, "finalized");

                console.log("Your transaction signature", txId);
                if (!txx.value.err) return {
                    result: 0,
                    msg: "Transaction Id : " + txId
                }
                else return {
                    result: -4,
                    msg: "Transaction Id : " + txId
                }

            } else {
                return {
                    result: -5,
                    msg: "Sign transaction is not supported with this wallet"
                }
            }

        } else {
            console.log("No reward to claim!")
            return {
                result: -3,
                msg: "No reward to claim!"
            }
        }
    } catch (e) {
        console.log("error occured in claimReward >> ", e)
        return {
            result: -1,
            msg: (e as string)
        }
    }
}

export const buyBnn = async (
    wallet: WalletContextState,
    tokenAmount: number
) => {
    try {

        if (wallet.publicKey === null) return;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const tx = await createBuyTokenTx(tokenAmount, BANANA_TOKEN_MINT, wallet.publicKey, program, solConnection);

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);
            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed',
            })

            await solConnection.confirmTransaction(txId, "finalized");

            console.log("Your transaction signature", txId);
        }
    } catch (e) {
        console.log("error occured in buyBnn >>", e);
    }
}

/**
 * Deposit one NFT of the king-kong collection to the game escrow vault PDA for rewarding
 * @param nft_mint : mint address of king-kong nft to be deposited to the escrow vault PDA
 */
export const depositNftEscrow = async (
    wallet: WalletContextState,
    nft_mint: PublicKey
) => {
    try {

        if (wallet.publicKey === null) return;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        const tx = await createDepositNftEscrowTx(wallet.publicKey, nft_mint, program, solConnection);

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);
            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed',
            })

            await solConnection.confirmTransaction(txId, "finalized");

            console.log("Your transaction signature", txId);
        }
    } catch (e) {
        console.log("error occured in depositNftEscrow >> ", e);
    }
}

export const withdrawEscrowVolume = async (
    wallet: WalletContextState,
    solAmount: number = 1000000000,
    tokenAmount: number = 1000000000
) => {
    try {

        if (wallet.publicKey === null) return;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        let token_mint = BANANA_TOKEN_MINT;
        const tx = await createWithdrawEscrowVolumeTx(solAmount, tokenAmount, token_mint, wallet.publicKey, program, solConnection);

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);
            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed',
            })

            await solConnection.confirmTransaction(txId, "finalized");

            console.log("Your transaction signature", txId);
        }
    } catch (e) {
        console.log("error occured in withdrawEscrowVolume >> ", e);
    }
}

export const withdrawEscrowNft = async (
    wallet: WalletContextState,
    nft_mint: string | null = null
) => {
    try {

        if (wallet.publicKey === null) return;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        let game_data = await getGameState();

        if (!nft_mint) nft_mint = game_data.escrowNftMints[0].toBase58();
        if (!nft_mint) return;
        const tx = await createWithdrawEscrowNftTx(new PublicKey(nft_mint), wallet.publicKey, program, solConnection);

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);
            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed',
            })

            await solConnection.confirmTransaction(txId, "finalized");

            console.log("Your transaction signature", txId);
        }
    } catch (e) {
        console.log("error occured in withdrawEscrowNft >> ", e);
    }
}

export const claimBananaForNftHolders = async (
    wallet: WalletContextState,
    nft_mint: PublicKey
) => {
    try {

        if (wallet.publicKey === null) return;
        let cloneWindow: any = window;

        let provider = new anchor.AnchorProvider(solConnection, cloneWindow['solana'], anchor.AnchorProvider.defaultOptions());
        const program = new anchor.Program(IDL as anchor.Idl, PROGRAM_ID, provider);

        let token_mint = BANANA_TOKEN_MINT;

        const tx = await createClaimBananaForNftHoldersTx(
            wallet.publicKey,
            nft_mint,
            token_mint,
            program,
            solConnection
        );

        let { blockhash } = await provider.connection.getRecentBlockhash("confirmed");

        tx.feePayer = (wallet.publicKey as PublicKey);
        tx.recentBlockhash = blockhash;

        if (wallet.signTransaction !== undefined) {
            // const signedTransactions = await wallet.signAllTransactions([tx]);
            let signedTx = await wallet.signTransaction(tx);
            let txId = await provider.connection.sendRawTransaction(signedTx.serialize(), {
                skipPreflight: true,
                maxRetries: 3,
                preflightCommitment: 'confirmed',
            })

            await solConnection.confirmTransaction(txId, "finalized");

            console.log("Your transaction signature", txId);
        }
    } catch (e) {
        console.log("error occured in claimBananaForNftHolders >> ", e);
    }
}

// main();
import { Connection, Keypair, LAMPORTS_PER_SOL, ParsedInnerInstruction, ParsedInstruction, PartiallyDecodedInstruction, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import axios from 'axios';
import { resolve } from 'path';
import { Server } from 'socket.io';
import { GAME_CONFIG_VAULT_SEED, GAME_POOL, GLOBAL_AUTHORITY_SEED, PROGRAM_ID, RENT_EXEMPT_MINIMUM, SOLANA_TRX_FEE, USER_DATA_SEED, } from './config/constant';
import { loadDump, saveDump, sleep } from './util';
import fs from 'fs';
import { holdersData, SOLANA_NETWORK } from './config/config';
import * as anchor from '@project-serum/anchor';
import { IDL as KingKongGameIdl } from "./config/king_kong_game";
import { GameConfigPool, GamePool } from './types';
import { Program, Wallet, web3 } from '@project-serum/anchor';
import WalletSeed from './config/fake-wallet.json';
import HashList from './config/nft_hash_list.json';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

const solConnection = new Connection(web3.clusterApiUrl(SOLANA_NETWORK), "confirmed");
const wallet = new Wallet(Keypair.fromSecretKey(Uint8Array.from(WalletSeed), { skipValidation: true }));
const newProvider = new anchor.Provider(solConnection, wallet, {});
let program = new anchor.Program(KingKongGameIdl, PROGRAM_ID, newProvider) as unknown as Program;
// let program = new anchor.Program(KingKongGameIdl as anchor.Idl, PROGRAM_ID);
console.log('ProgramId: ', program.programId.toBase58());

export const getPlayerInfo = async (address: string) => {
    try {
        let userStats = loadDump('/userStats.json');
        if (userStats[address]) return userStats[address];
        else return {
            pfp: "https://www.arweave.net/GfqxhJsdU9YApXUKjZKgYhS0S2zGjIVzkF6K6MwZc18?ext=png"
        }
    } catch (e) {
        console.log(e)
        return -1;
    }
}

export const registerAvatar4Game = async (address: string, avatar: string) => {
    try {
        let userStats = loadDump('/userStats.json');
        if (!userStats) {
            userStats = {};
        }
        if (userStats[address]) {
            userStats[address] = {
                address: address,
                playedVolume: userStats[address].playedVolume,
                playedNums: userStats[address].playedNums,
                playedBanana: userStats[address].playedBanana,
                buyedBanana: userStats[address].buyedBanana,
                winnedVolume: userStats[address].winnedVolume,
                winnedNums: userStats[address].winnedNums,
                winnedBanana: userStats[address].winnedBanana,
                winnedNft: userStats[address].winnedNft,
                winnerLast: userStats[address].winnerLast,
                xp: userStats[address].xp,
                pfp: avatar
            }
        } else {
            userStats[address] = {
                pfp: avatar
            }
        }
        saveDump('/userStats.json', userStats);
        return 0;
    } catch (e) {
        console.log(e);
        return -1
    }
}

export const getUserStats = async () => {
    let userStats = loadDump('/userStats.json');
    if (!userStats) {
        userStats = {};
        saveDump('/userStats.json', userStats);
    }
    return userStats;
}

export const getGameStats = async () => {
    let gameStats = loadDump('/gameStats.json');
    if (!gameStats) {
        gameStats = {};
        saveDump('/gameStats.json', gameStats);

    }
    return gameStats;
}

export const getGamePlayHistory = async () => {
    let gameHistory = loadDump('/gameHistory.json');
    if (!gameHistory) {
        gameHistory = {};
        saveDump(`/gameHistory.json`, gameHistory);
    }
    let gameHistoryArrayData: any[] = [];
    for (let timestamp in gameHistory) {

        let temp = gameHistory[timestamp];
        temp['timestamp'] = timestamp;
        gameHistoryArrayData.push(temp);
    }
    let gameHistoryReturnedData = gameHistoryArrayData.sort((item1, item2) => {
        return item1.timestamp > item2.timestamp ? 1 : -1
    }).slice(-100);
    return gameHistoryReturnedData;
}

export const gamePlayListener = async (io: Server) => {


    const logListener = solConnection.onLogs(GAME_POOL, async (logs, ctx) => {

        let sign = logs.signature;
        console.log("new play >> ", sign)

        if (sign === "1111111111111111111111111111111111111111111111111111111111111111") return;

        playGameEventHandler(sign, io);
    })

    setInterval(() => {
        let todaySeconds = Math.floor(new Date().getTime() / 1000) % 86400;
        if (todaySeconds >= 85500) {
            airdrop2CollectionHolders();
        }
    }, 900000)
}

export const airdrop2CollectionHolders = async () => {
    try {
        await Promise.allSettled(HashList.map(async (mint) => {
            let response = await solConnection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
                filters: [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 0,
                            bytes: mint,
                        }
                    },
                ]
            }).then((res: any) => res.map((data: { account: { data: any; }; }) => (data.account.data as web3.ParsedAccountData).parsed.info))
                .then((res: any[]) => res.filter((data: { tokenAmount: { uiAmount: any; }; }) => data.tokenAmount.uiAmount)[0].owner);
            holdersData.set(mint, response);

        }))
        let addrs = [...holdersData.values()];
        let holders: { [addr: string]: number } = {};
        addrs.map((addr) => {
            if (!holders[addr]) holders[addr] = 1;
            else holders[addr]++;
        });

        // const wallet = new NodeWallet(keypair);


        let solBalance = await solConnection.getBalance(wallet.publicKey);
        let unitAmount = Math.floor((solBalance - RENT_EXEMPT_MINIMUM) / HashList.length) - SOLANA_TRX_FEE;

        let transactions: Transaction[] = [];
        for (let i in holders) {
            console.log(unitAmount, unitAmount * holders[i], i)
            let ix = SystemProgram.transfer(
                {
                    "fromPubkey": wallet.publicKey,
                    "lamports": unitAmount * holders[i],
                    "toPubkey": new PublicKey(i)
                });
            let tx = new Transaction();
            tx.add(ix);
            transactions.push(tx);
        }
        let { blockhash } = await newProvider.connection.getLatestBlockhash("confirmed");
        transactions.forEach((transaction) => {
            transaction.feePayer = (wallet.publicKey as PublicKey);
            transaction.recentBlockhash = blockhash;
        });
        let signedTransactions = await wallet.signAllTransactions(transactions);
        await Promise.all(
            signedTransactions.map(
                (transaction) =>
                    new Promise(async (resolve) => {
                        const sig = await solConnection.sendTransaction(transaction, [
                            wallet.payer
                        ]);
                        // wallet.sendTransaction(transaction, provider.connection, {maxRetries: 3, preflightCommitment: 'confirmed'})
                        await solConnection.confirmTransaction(sig, 'confirmed');
                        resolve(sig);
                    })
            )
        );
        // if (wallet.signAllTransactions !== undefined) {
        //     const signedTransactions = await wallet.signAllTransactions(transactions);
        //     let signatures = await Promise.all(
        //         signedTransactions.map((transaction) =>
        //             newProvider.connection.sendRawTransaction(transaction.serialize(), {
        //                 skipPreflight: true,
        //                 maxRetries: 3,
        //                 preflightCommitment: 'confirmed',
        //             })
        //             // wallet.sendTransaction(transaction, provider.connection, {maxRetries: 3, preflightCommitment: 'confirmed'})
        //         )
        //     );

        //     await Promise.all(
        //         signatures.map((signature) =>
        //             newProvider.connection.confirmTransaction(signature, "finalized")
        //         )
        //     );
        // }
        console.log(">>>>>>>>>>>>>>>>")
    } catch (err) {
        console.log(err, ": error from transfering reward")
    }




}

export const playGameEventHandler = async (sign: string, io: Server) => {

    console.log("new play >> ", sign)

    let testtxs = await solConnection.getParsedTransaction(sign, 'finalized');
    do {
        if (testtxs === null) {
            await sleep(5000);

            testtxs = await solConnection.getParsedTransaction(sign, 'finalized');
        } else {
            break;
        }

    } while (true);

    if (!testtxs?.meta?.err) {
        let curTime = Math.floor(new Date().getTime() / 1000);

        let gamePool = (await program.account.gamePool.fetch(GAME_POOL)) as unknown as GamePool;
        let members = gamePool.members.toNumber();
        // let players = gamePool.players;
        let bananaUsage: number[][] = [[], [], [], []];
        let round1Result: number[] = [];
        let round2Result: number[] = [];
        let round3Result: number[] = [];
        let round4Result: number[] = [];
        let players: string[] = [];
        let playerXp = new Map<string, number>();

        console.log(gamePool, ">>> game Pool info");
        console.log(gamePool.bananaUsage, ">>> banana usage")
        for (let i = 0; i < members; i++) {
            for (let j = 0; j < gamePool.bananaUsage[i].length; j++) {
                // bananaUsage[i][j] = gamePool.bananaUsage[i][j].toNumber();
                let bnn = gamePool.bananaUsage[i][j].toNumber()
                console.log(i, j, " >>> ", bnn);
                bananaUsage[i].push(gamePool.bananaUsage[i][j].toNumber());
                console.log(bananaUsage, ">> banana usage")
            }
            players.push(gamePool.players[i].toBase58());
            playerXp.set(gamePool.players[i].toBase58(), 0);

        }
        for (let i = 0; i < gamePool.round1Result.length; i++) {
            round1Result[i] = gamePool.round1Result[i].toNumber();
        }
        for (let i = 0; i < gamePool.round2Result.length; i++) {
            round2Result[i] = gamePool.round2Result[i].toNumber();
        }
        for (let i = 0; i < gamePool.round3Result.length; i++) {
            round3Result[i] = gamePool.round3Result[i].toNumber();
        }
        for (let i = 0; i < gamePool.round4Result.length; i++) {
            round4Result[i] = gamePool.round4Result[i].toNumber();
        }
        let gamePoolData = {}
        console.log(">> one player entered")
        if (members < 16) {
            gamePoolData = {
                members: gamePool.members.toNumber(),
                players: players,
                bananaUsage: bananaUsage,
                round1Result: [],
                round2Result: [],
                round3Result: [],
                round4Result: [],
                winner: "1111111111111111111111111111111111111111111111111111111111111111"
            };
        } else if (members == 16) {
            const [gameConfigVault, _] = await PublicKey.findProgramAddress(
                [Buffer.from(GAME_CONFIG_VAULT_SEED)],
                PROGRAM_ID,
            );
            let gameState = (await program.account.gameConfigPool.fetch(gameConfigVault)) as unknown as GameConfigPool;
            let winner = gameState.winner.toBase58();
            let totalPlays = gameState.totalPlays.toNumber();
            gamePoolData = {
                members: gamePool.members.toNumber(),
                players: players,
                bananaUsage: bananaUsage,
                round1Result: round1Result,
                round2Result: round2Result,
                round3Result: round3Result,
                round4Result: round4Result,
                winner: winner
            };

            // store game history data
            let timestamp = testtxs?.blockTime as number;
            let gameHistory = loadDump('/gameHistory.json');
            if (!gameHistory) gameHistory = {};
            gameHistory[timestamp] = {
                players: players,
                winner: winner,
                bananaUsage: bananaUsage,
                round1Result: round1Result,
                round2Result: round2Result,
                round3Result: round3Result,
                round4Result: round4Result,
                transaction: sign
            };
            saveDump(`/gameHistory.json`, gameHistory);

            let gameHistoryArrayData: any[] = [];
            let dayPlays = 0;
            let weekPlays = 0;
            for (let timestamp in gameHistory) {

                let temp = gameHistory[timestamp];
                temp['timestamp'] = timestamp;
                gameHistoryArrayData.push(temp);
                if (curTime - parseInt(timestamp) <= 86400) {
                    dayPlays += 1;

                }
                if (curTime - parseInt(timestamp) <= 86400 * 7) {
                    weekPlays += 1;
                }
            }
            let gameHistoryReturnedData = gameHistoryArrayData.sort((item1, item2) => {
                return item1.timestamp > item2.timestamp ? 1 : -1
            }).slice(-100);

            // store game stats data
            let gameStats = loadDump('/gameStats.json');
            if (!gameStats) gameStats = {};
            gameStats = {
                dayPlays: dayPlays,
                weekPlays: weekPlays,
                totalPlays: totalPlays
            }
            saveDump('/gameStats.json', gameStats);

            // trigger event with socket
            let result = {
                gameHistory: gameHistoryReturnedData,
                gameStats: gameStats
            }

            if (io) {
                io.emit('game_stat', result);
            }
            console.log(">> one game ended");

            // fetch user pool data


            playerXp.set(players[round4Result[0]], 50);
            for (let i = 0; i < round3Result.length; i++) {
                const player = players[round3Result[i]];
                if ((playerXp.get(player) as number) == 0) playerXp.set(player, 30)
            }
            for (let i = 0; i < round2Result.length; i++) {
                const player = players[round2Result[i]];
                if ((playerXp.get(player) as number) == 0) playerXp.set(player, 20)
            }
            for (let i = 0; i < round1Result.length; i++) {
                const player = players[round1Result[i]];
                if ((playerXp.get(player) as number) == 0) playerXp.set(player, 10)
            }
            for (let i = 0; i < players.length; i++) {
                const player = players[i];
                if ((playerXp.get(player) as number) == 0) playerXp.set(player, 5)
            }

            let userStats = loadDump('/userStats.json');
            if (!userStats) userStats = {};
            await Promise.allSettled(
                players.map(async (player: string, index: number) => {
                    const [userPool, _] = await PublicKey.findProgramAddress(
                        [Buffer.from(USER_DATA_SEED), new PublicKey(player).toBuffer()],
                        PROGRAM_ID,
                    );
                    let userState = await program.account.userPool.fetch(userPool);
                    let address = (userState.address as any).toBase58();
                    let playedVolume = (userState.playedVolume as any).toNumber();
                    let playedNums = (userState.playedNums as any).toNumber();
                    let playedBanana = (userState.playedBanana as any).toNumber();
                    let buyedBanana = (userState.buyedBanana as any).toNumber();
                    let winnedVolume = (userState.winnedVolume as any).toNumber();
                    let winnedNums = (userState.winnedNums as any).toNumber();
                    let winnedBanana = (userState.winnedBanana as any).toNumber();
                    let winnedNft = (userState.winnedNft as any).toNumber();
                    let winnerLast = (userState.winnerLast as any);

                    userStats[address] = {
                        address: address,
                        playedVolume: playedVolume,
                        playedNums: playedNums,
                        playedBanana: playedBanana,
                        buyedBanana: buyedBanana,
                        winnedVolume: winnedVolume,
                        winnedNums: winnedNums,
                        winnedBanana: winnedBanana,
                        winnedNft: winnedNft,
                        winnerLast: winnerLast,
                        xp: userStats[address] ? userStats[address].xp + playerXp.get(address) : playerXp.get(address),
                        pfp: userStats[address].php ? userStats[address].php : "https://www.arweave.net/GfqxhJsdU9YApXUKjZKgYhS0S2zGjIVzkF6K6MwZc18?ext=png"
                    }

                })
            );
            saveDump('/userStats.json', userStats);

            if (io) {
                io.emit('user_stat', userStats);
            }
        }

        if (io) {
            io.emit('game_play', gamePoolData);
        }
    }
}


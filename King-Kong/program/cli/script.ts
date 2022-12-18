
import { Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';

import {
    BANANA_TOKEN_MINT,
    GLOBAL_AUTHORITY_SEED,
    ESCROW_VAULT_SEED,
    GAME_VAULT_SEED,
    USER_DATA_SEED,
    PROGRAM_ID,
    GamePool,
    UserPool,
    NFT_DATA_SEED,
    GAME_CONFIGVAULT_SEED,
    GAME_POOL_SIZE,
    GameConfigPool,
    COLLECTION_ADDRESS,
    GAME_POOL_ADDRESS,
    DAILY_REWARD_DIST_WALLET,
    GOLD_CHEST_WALLET
} from './types';

import {
    PublicKey,
    Connection,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    Keypair
} from '@solana/web3.js';
import { getATokenAccountsNeedCreate, getMetadata, getTokenAccount, isExistAccount, METAPLEX } from './utils';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';


export const createClaimXprewardTx = async (
    xp: number,
    payer: PublicKey,
    token_mint: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {

    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );
    const [userPool, user_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), payer.toBuffer()],
        PROGRAM_ID,
    );
    // get user token account
    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [token_mint]
    );

    let tx = new Transaction();
    let userTokenAccount = ret1.destinationAccounts[0];
    if (!await isExistAccount(userTokenAccount, connection)) {
        try {
            let accountOfBNN = await getTokenAccount(token_mint, payer, connection);
            userTokenAccount = accountOfBNN;
        } catch (e) {
            tx.add(ret1.instructions[0]);
            console.log(e, ": error");
        }
    }
    console.log("User BNN Account = ", userTokenAccount.toBase58());

    // get escrow vault token account

    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [token_mint]
    );
    let escrowTokenAccount = ret2.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret2.destinationAccounts[0].toBase58());

    if (ret2.instructions.length > 0) ret2.instructions.map((ix) => tx.add(ix));

    tx.add(program.instruction.claimXpreward(
        game_config_bump, escrow_bump, user_bump, new anchor.BN(xp), {
        accounts: {
            owner: payer,
            gameConfigVault: gameConfigVault,
            escrowVault: escrowVault,
            userPool: userPool,
            userTokenAccount: userTokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
        }
    }
    ));
    return tx;

}

export const createGamePoolTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {
    const [globalAuthority, global_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PROGRAM_ID,
    );
    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );

    let gamePoolKey = await anchor.web3.PublicKey.createWithSeed(
        userAddress,
        GAME_VAULT_SEED,
        PROGRAM_ID,
    );
    console.log(GAME_POOL_SIZE);
    let ix = SystemProgram.createAccountWithSeed({
        fromPubkey: userAddress,
        basePubkey: userAddress,
        seed: GAME_VAULT_SEED,
        newAccountPubkey: gamePoolKey,
        lamports: await connection.getMinimumBalanceForRentExemption(GAME_POOL_SIZE),
        space: GAME_POOL_SIZE,
        programId: PROGRAM_ID,
    });

    let tx = new Transaction();
    console.log('==>initializing program', globalAuthority.toBase58(), userAddress.toBase58());
    const [winnerPda, winner_pda_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), new PublicKey(COLLECTION_ADDRESS).toBuffer()],
        PROGRAM_ID,
    );
    console.log(
        userAddress.toBase58(),
        globalAuthority.toBase58(),
        gameConfigVault.toBase58(),
        gamePoolKey.toBase58(),
        winnerPda.toBase58(),
    )
    tx.add(ix);
    tx.add(program.instruction.createGamePool(
        global_bump, game_config_bump, winner_pda_bump, {
        accounts: {
            admin: userAddress,
            globalAuthority: globalAuthority,
            gameConfigVault: gameConfigVault,
            winnerPda: winnerPda,
            gamePool: gamePoolKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        instructions: [],
        signers: [],
    }));

    return tx;
}

export const createInitializeTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
) => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );

    let tx = new Transaction();
    console.log('==>initializing program', globalAuthority.toBase58(), userAddress.toBase58());

    tx.add(program.instruction.initialize(
        bump, escrow_bump, {
        accounts: {
            admin: userAddress,
            globalAuthority,
            escrowVault,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        instructions: [],
        signers: [],
    }));

    return tx;
}

export const createInitGamePoolTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
    gameEntryFee: number,
    txFee: number,
    rewardAmount: number,
    bananaMint: string,
    bananaPrice: number,
    bananaDecimal: number,
    bananaMaxNums: number
) => {
    const [globalAuthority, global_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PROGRAM_ID,
    );
    const [gameConfigPool, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );

    let tx = new Transaction();
    console.log('==>initializing sell PDA', gameEntryFee, txFee, rewardAmount, bananaPrice, bananaDecimal, bananaMaxNums);

    tx.add(program.instruction.registerGamePoolData(
        global_bump,
        game_config_bump,
        new anchor.BN(gameEntryFee),
        new anchor.BN(txFee),
        new anchor.BN(rewardAmount),
        new PublicKey(bananaMint),// new anchor.BN(),
        new anchor.BN(bananaPrice),
        new anchor.BN(bananaDecimal),
        new anchor.BN(bananaMaxNums),
        {
            accounts: {
                admin: userAddress,
                globalAuthority: globalAuthority,
                gameConfigVault: gameConfigPool,
            },
            instructions: [],
            signers: [],
        }));

    return tx;
}

export const createInitUserTx = async (
    userAddress: PublicKey,
    program: anchor.Program,
) => {
    const [userPool, user_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), userAddress.toBuffer()],
        PROGRAM_ID,
    );

    let tx = new Transaction();
    console.log('==>initializing user pool', userPool.toBase58());

    tx.add(program.instruction.initUserPool(
        user_bump, {
        accounts: {
            owner: userAddress,
            userPool,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        instructions: [],
        signers: [],
    }));

    return tx;
}

export const gamePlayTx = async (
    round1Banana: number,
    round2Banana: number,
    round3Banana: number,
    round4Banana: number,
    userAddress: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {

    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        userAddress,
        userAddress,
        [BANANA_TOKEN_MINT]
    );

    let tx = new Transaction();
    let userTokenAccount = ret2.destinationAccounts[0];
    if (!await isExistAccount(userTokenAccount, connection)) {
        try {
            let accountOfBNN = await getTokenAccount(BANANA_TOKEN_MINT, userAddress, connection);
            userTokenAccount = accountOfBNN;
        } catch (e) {
            ret2.instructions.map((ix) => tx.add(ix));
            console.log(e, ": error");
        }
    }
    console.log("User BNN Account = ", userTokenAccount.toBase58());
    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );

    const [globalAuthority, global_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PROGRAM_ID,
    );
    let gamePool = await anchor.web3.PublicKey.createWithSeed(
        new PublicKey(GAME_POOL_ADDRESS),
        GAME_VAULT_SEED,
        PROGRAM_ID,
    );


    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );

    const [userPool, user_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), userAddress.toBuffer()],
        PROGRAM_ID,
    );


    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        userAddress,
        escrowVault,
        [BANANA_TOKEN_MINT]
    );
    let escrowTokenAccount = ret1.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret1.destinationAccounts[0].toBase58());

    if (ret1.instructions.length > 0) ret1.instructions.map((ix) => tx.add(ix));

    const gameConfigPool = await getGameState(program);
    const [winnerPDA, winner_pda_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), new PublicKey(gameConfigPool.winner).toBuffer()],
        PROGRAM_ID,
    );

    console.log(
        gameConfigVault.toBase58(),
        gamePool.toBase58(),
        escrowVault.toBase58(),
        userPool.toBase58(),
        userTokenAccount.toBase58(),
        escrowTokenAccount.toBase58(),
        winnerPDA.toBase58(),
        TOKEN_PROGRAM_ID.toBase58(),
    )
    tx.add(program.instruction.playGame(
        game_config_bump, escrow_bump, user_bump, new anchor.BN(round1Banana), new anchor.BN(round2Banana), new anchor.BN(round3Banana), new anchor.BN(round4Banana), {
        accounts: {
            owner: userAddress,
            gameConfigVault: gameConfigVault,
            gamePool: gamePool,
            escrowVault: escrowVault,
            userPool: userPool,
            userTokenAccount: userTokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            winnerPda: winnerPDA,
            treasury_wallet1: DAILY_REWARD_DIST_WALLET,
            treasury_wallet2: GOLD_CHEST_WALLET,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        }
    }
    ));
    return tx;
}

export const getClaimRewardTx = async (
    token_mint: PublicKey,
    nft_mint: PublicKey,
    payer: PublicKey,
    program: anchor.Program,
    connection: Connection) => {

    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );
    const [userPool, user_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), payer.toBuffer()],
        PROGRAM_ID,
    );

    // get user token account
    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [token_mint]
    );

    let tx = new Transaction();
    let userTokenAccount = ret1.destinationAccounts[0];
    if (!await isExistAccount(userTokenAccount, connection)) {
        try {
            let accountOfBNN = await getTokenAccount(token_mint, payer, connection);
            userTokenAccount = accountOfBNN;
        } catch (e) {
            tx.add(ret1.instructions[0]);
            console.log(e, ": error");
        }
    }
    console.log("User BNN Account = ", userTokenAccount.toBase58());

    // get escrow vault token account

    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [token_mint]
    );
    let escrowTokenAccount = ret2.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret2.destinationAccounts[0].toBase58());

    if (ret2.instructions.length > 0) ret2.instructions.map((ix) => tx.add(ix));


    // get nft token account
    let ret3 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [nft_mint]
    );
    let userNftTokenAccount = ret3.destinationAccounts[0];
    if (!await isExistAccount(userNftTokenAccount, connection)) {
        try {
            let nftTokenAccount = await getTokenAccount(nft_mint, payer, connection);
            userNftTokenAccount = nftTokenAccount;
        } catch (e) {
            tx.add(ret3.instructions[0]);
            console.log(e, ": error");
        }
    }
    // if (ret3.instructions.length > 0) ret3.instructions.map((ix) => tx.add(ix));

    let ret4 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [nft_mint]
    );
    let destNftTokenAccount = ret4.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret4.destinationAccounts[0].toBase58());

    if (ret4.instructions.length > 0) ret4.instructions.map((ix) => {

        console.log(ix, "===================>");
        tx.add(ix)
    }
    );

    tx.add(program.instruction.claimReward(
        game_config_bump, escrow_bump, user_bump, {
        accounts: {
            owner: payer,
            gameConfigVault: gameConfigVault,
            escrowVault: escrowVault,
            userPool: userPool,
            userTokenAccount: userTokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            userNftTokenAccount: userNftTokenAccount,
            destNftTokenAccount: destNftTokenAccount,
            nftMint: nft_mint,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,

        }
    }
    ));
    return tx;

}

export const createBuyTokenTx = async (
    tokenAmount: number,
    token_mint: PublicKey,
    buyer: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {

    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );
    const [userPool, user_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), buyer.toBuffer()],
        PROGRAM_ID,
    );
    // let gamePool = await anchor.web3.PublicKey.createWithSeed(
    //     new PublicKey(GAME_POOL_ADDRESS),
    //     GAME_VAULT_SEED,
    //     PROGRAM_ID,
    // );


    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        buyer,
        buyer,
        [token_mint]
    );

    let tx = new Transaction();
    let userTokenAccount = ret2.destinationAccounts[0];
    if (!await isExistAccount(userTokenAccount, connection)) {
        try {
            let accountOfBNN = await getTokenAccount(token_mint, buyer, connection);
            userTokenAccount = accountOfBNN;
        } catch (e) {
            tx.add(ret2.instructions[0]);
            console.log(e, ": error");
        }
    }
    console.log("User BNN Account = ", userTokenAccount.toBase58());

    // get escrow vault token account

    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        buyer,
        escrowVault,
        [token_mint]
    );
    let escrowTokenAccount = ret1.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret1.destinationAccounts[0].toBase58());
    console.log(
        escrowVault.toBase58(),
        userPool.toBase58(),
        userTokenAccount.toBase58(),
        escrowTokenAccount.toBase58(),
        TOKEN_PROGRAM_ID.toBase58(),
    )

    if (ret1.instructions.length > 0) ret1.instructions.map((ix) => tx.add(ix));

    tx.add(program.instruction.buyToken(
        game_config_bump, escrow_bump, user_bump, new anchor.BN(tokenAmount), {
        accounts: {
            buyer: buyer,
            gameConfigVault: gameConfigVault,
            escrowVault: escrowVault,
            userPool: userPool,
            userTokenAccount: userTokenAccount,
            escrowTokenAccount: escrowTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        }
    }
    ));
    return tx;


}

export const getGameState = async (program: anchor.Program): Promise<any | null> => {
    const [gameConfigPool, _] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );

    try {
        let gameState = await program.account.gameConfigPool.fetch(gameConfigPool);
        // console.log(gameState, ">>>gameState");

        let rewardAmount = (gameState as unknown as GameConfigPool).rewardAmount.toNumber();
        let totalPlays = (gameState as unknown as GameConfigPool).totalPlays.toNumber();
        let entryFee = (gameState as unknown as GameConfigPool).entryFee.toNumber();
        let txFee = (gameState as unknown as GameConfigPool).txFee.toNumber();
        let escrowNftNums = (gameState as unknown as GameConfigPool).escrowNftNums.toNumber();
        let bananaMaxNums = (gameState as unknown as GameConfigPool).bananaMaxNums.toNumber();
        let bananaMint = (gameState as unknown as GameConfigPool).bananaMint.toBase58();
        let bananaDecimal = (gameState as unknown as GameConfigPool).bananaDecimal.toNumber();
        let bananaPrice = (gameState as unknown as GameConfigPool).bananaPrice.toNumber();
        let winner = (gameState as unknown as GameConfigPool).winner.toBase58();

        let escrowNftMints = (gameState as unknown as GameConfigPool).escrowNftMints as PublicKey[];

        console.log(rewardAmount, ">> reward sol amount for the game winners");
        console.log(totalPlays, ">> total plays of the game");
        console.log(entryFee, ">> entryfee");
        console.log(txFee, ">> txFee");
        console.log(escrowNftNums, ">> number of nfts in the escrow vault");
        console.log(bananaMaxNums, ">> max limit numbers of bananas in one game");
        console.log(bananaMint, ">> banana token mint address");
        console.log(bananaDecimal, ">> banana decimal");
        console.log(bananaPrice, ">> banana price");
        console.log(winner, ">> game winner");

        const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(GAME_CONFIGVAULT_SEED)],
            PROGRAM_ID,
        );

        const [globalAuthority, global_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(GLOBAL_AUTHORITY_SEED)],
            PROGRAM_ID,
        );
        let gamePool = await anchor.web3.PublicKey.createWithSeed(
            new PublicKey(GAME_POOL_ADDRESS),
            GAME_VAULT_SEED,
            PROGRAM_ID,
        );

        const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
            [Buffer.from(ESCROW_VAULT_SEED)],
            PROGRAM_ID,
        );
        console.log(globalAuthority.toBase58(), ">> globalAuthority")
        console.log(gameConfigVault.toBase58(), ">> gameConfigVault")
        console.log(gamePool.toBase58(), ">> gamePool")
        console.log(escrowVault.toBase58(), ">> escrowVault")


        return {
            rewardAmount: rewardAmount,
            totalPlays: totalPlays,
            entryFee: entryFee,
            txFee: txFee,
            escrowNftNums: escrowNftNums,
            bananaMaxNums: bananaMaxNums,
            bananaMint: bananaMint,
            bananaDecimal: bananaDecimal,
            bananaPrice: bananaPrice,
            winner: winner,
            globalAuthority: globalAuthority.toBase58(),
            gameConfigVault: gameConfigVault.toBase58(),
            // gamePool: gamePool.toBase58(),
            escrowVault: escrowVault.toBase58(),
            escrowNftMints: escrowNftMints
        };
    } catch {
        return null;
    }
}

export const getUserState = async (userAddress: PublicKey, program: anchor.Program) => {

    const [userPool, _] = await PublicKey.findProgramAddress(
        [Buffer.from(USER_DATA_SEED), userAddress.toBuffer()],
        PROGRAM_ID,
    );

    try {
        let userState = await program.account.userPool.fetch(userPool);
        console.log(userState, ">> user state");
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
        let xpreward1Claimed = userState.xpreward1Claimed;
        let xpreward2Claimed = userState.xpreward2Claimed;
        let xpreward3Claimed = userState.xpreward3Claimed;
        let xpreward4Claimed = userState.xpreward4Claimed;
        let xpreward5Claimed = userState.xpreward5Claimed;

        console.log(address, ":: user address")
        console.log(playedVolume, ":: playedVolume")
        console.log(playedNums, ":: playedNums")
        console.log(playedBanana, ":: playedBanana")
        console.log(buyedBanana, ":: buyedBanana")
        console.log(winnedVolume, ":: winnedVolume")
        console.log(winnedNums, ":: winnedNums")
        console.log(winnedBanana, ":: winnedBanana")
        console.log(winnedNft, ":: winnedNft")
        console.log(winnerLast, ":: winnerLast")
        console.log(xpreward1Claimed, ":: xpreward1Claimed")
        console.log(xpreward2Claimed, ":: xpreward2Claimed")
        console.log(xpreward3Claimed, ":: xpreward3Claimed")
        console.log(xpreward4Claimed, ":: xpreward4Claimed")
        console.log(xpreward5Claimed, ":: xpreward5Claimed")

        return {
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
            xpreward1Claimed: xpreward1Claimed,
            xpreward2Claimed: xpreward2Claimed,
            xpreward3Claimed: xpreward3Claimed,
            xpreward4Claimed: xpreward4Claimed,
            xpreward5Claimed: xpreward5Claimed,
        };
    } catch {
        return null;
    }
}

export const createDepositNftEscrowTx = async (
    payer: PublicKey,
    nft_mint: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {
    const [globalAuthority, global_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );
    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );

    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [nft_mint]
    );

    let tx = new Transaction();
    let userNftTokenAccount = ret2.destinationAccounts[0];
    if (!await isExistAccount(userNftTokenAccount, connection)) {
        try {
            let nftTokenAccount = await getTokenAccount(nft_mint, payer, connection);
            userNftTokenAccount = nftTokenAccount;
        } catch (e) {
            tx.add(ret2.instructions[0]);
            console.log(e, ": error");
        }
    }
    console.log("User BNN Account = ", userNftTokenAccount.toBase58());

    // get escrow vault token account

    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [nft_mint]
    );
    let destNftTokenAccount = ret1.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret1.destinationAccounts[0].toBase58());

    if (ret1.instructions.length > 0) ret1.instructions.map((ix) => tx.add(ix));

    // 
    const metadata = await getMetadata(nft_mint);

    tx.add(program.instruction.depositNftEscrow(
        global_bump, escrow_bump, game_config_bump, {
        accounts: {
            admin: payer,
            globalAuthority: globalAuthority,
            escrowVault: escrowVault,
            gameConfigVault: gameConfigVault,
            userNftTokenAccount: userNftTokenAccount,
            destNftTokenAccount: destNftTokenAccount,
            nftMint: nft_mint,
            mintMetadata: metadata,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: METAPLEX,
        }
    }
    ));
    return tx;

}

export const createWithdrawEscrowVolumeTx = async (
    solAmount: number,
    tokenAmount: number,
    token_mint: PublicKey,
    payer: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {
    const [globalAuthority, global_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );
    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );

    // get user token account
    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [token_mint]
    );

    let tx = new Transaction();
    let userTokenAccount = ret2.destinationAccounts[0];
    if (!await isExistAccount(userTokenAccount, connection)) {
        try {
            let accountOfBNN = await getTokenAccount(token_mint, payer, connection);
            userTokenAccount = accountOfBNN;
        } catch (e) {
            tx.add(ret2.instructions[0]);
            console.log(e, ": error");
        }
    }
    console.log("User BNN Account = ", userTokenAccount.toBase58());

    // get escrow vault token account

    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [token_mint]
    );
    let escrowTokenAccount = ret1.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret1.destinationAccounts[0].toBase58());

    if (ret1.instructions.length > 0) ret1.instructions.map((ix) => tx.add(ix));


    tx.add(program.instruction.withdrawEscrowVolume(
        global_bump, escrow_bump, game_config_bump, new anchor.BN(solAmount), new anchor.BN(tokenAmount), {
        accounts: {
            admin: payer,
            globalAuthority: globalAuthority,
            escrowVault: escrowVault,
            gameConfigVault: gameConfigVault,
            userTokenAccount: userTokenAccount,
            escrowTokenAccount: escrowTokenAccount,

            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        }
    }
    ));
    return tx;
}

export const createWithdrawEscrowNftTx = async (
    nft_mint: PublicKey,
    payer: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {
    const [globalAuthority, global_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );
    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );

    let tx = new Transaction();

    // get nft token account
    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [nft_mint]
    );
    let userNftTokenAccount = ret2.destinationAccounts[0];
    if (ret2.instructions.length > 0) ret2.instructions.map((ix) => tx.add(ix));

    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [nft_mint]
    );
    let destNftTokenAccount = ret1.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret1.destinationAccounts[0].toBase58());

    if (ret1.instructions.length > 0) ret1.instructions.map((ix) => tx.add(ix));

    tx.add(program.instruction.withdrawEscrowNft(
        global_bump, escrow_bump, game_config_bump, {
        accounts: {
            admin: payer,
            globalAuthority: globalAuthority,
            escrowVault: escrowVault,
            gameConfigVault: gameConfigVault,
            userNftTokenAccount: userNftTokenAccount,
            destNftTokenAccount: destNftTokenAccount,
            nftMint: nft_mint,
            tokenProgram: TOKEN_PROGRAM_ID,
        }
    }
    ));
    return tx;

}

export const createClaimBananaForNftHoldersTx = async (
    payer: PublicKey,
    nft_mint: PublicKey,
    token_mint: PublicKey,
    program: anchor.Program,
    connection: Connection
) => {
    const [gameConfigVault, game_config_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GAME_CONFIGVAULT_SEED)],
        PROGRAM_ID,
    );
    const [escrowVault, escrow_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(ESCROW_VAULT_SEED)],
        PROGRAM_ID,
    );
    const [nftPool, nft_bump] = await PublicKey.findProgramAddress(
        [Buffer.from(NFT_DATA_SEED), nft_mint.toBuffer()],
        PROGRAM_ID,
    );

    // get user token account
    let ret2 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [token_mint]
    );

    let tx = new Transaction();
    let userTokenAccount = ret2.destinationAccounts[0];
    if (!await isExistAccount(userTokenAccount, connection)) {
        try {
            let accountOfBNN = await getTokenAccount(token_mint, payer, connection);
            userTokenAccount = accountOfBNN;
        } catch (e) {
            tx.add(ret2.instructions[0]);
            console.log(e, ": error");
        }
    }
    console.log("User BNN Account = ", userTokenAccount.toBase58());

    // get escrow vault token account

    let ret1 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [token_mint]
    );
    let escrowTokenAccount = ret1.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret1.destinationAccounts[0].toBase58());

    if (ret1.instructions.length > 0) ret1.instructions.map((ix) => tx.add(ix));


    // get nft token account
    ret2 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        payer,
        [nft_mint]
    );
    let userNftTokenAccount = ret2.destinationAccounts[0];

    ret1 = await getATokenAccountsNeedCreate(
        connection,
        payer,
        escrowVault,
        [nft_mint]
    );
    let destNftTokenAccount = ret1.destinationAccounts[0];
    console.log('escrowVault = ', escrowVault.toBase58());
    console.log("escrowVault BNN Account = ", ret1.destinationAccounts[0].toBase58());

    if (ret1.instructions.length > 0) ret1.instructions.map((ix) => tx.add(ix));

    const metadata = await getMetadata(nft_mint);


    tx.add(program.instruction.claimBananaForNftHolders(
        escrow_bump, game_config_bump, nft_bump, {
        accounts: {
            owner: payer,
            escrowVault: escrowVault,
            gameConfigVault: gameConfigVault,
            nftPool: nftPool,
            escrowTokenAccount: escrowTokenAccount,
            userTokenAccount: userTokenAccount,
            userNftTokenAccount: userNftTokenAccount,
            nftMint: nft_mint,
            mintMetadata: metadata,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenMetadataProgram: METAPLEX,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        }
    }
    ));
    return tx;

}
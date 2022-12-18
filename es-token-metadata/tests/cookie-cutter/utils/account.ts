import * as anchor from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
  clusterApiUrl,
  Connection,
  SignatureStatus,
  Cluster,
} from "@solana/web3.js";
import {
  FEE_DESTINATION_WALLET_KEY,
  FEE_PAYER,
  COOKIE_CUTTER,
  COOKIE_CUTTER_PROGRAM_ID,
  SIGNER,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TREASURY,
  TREASURY_WALLET_KEY,
} from "./constants";
import { createCookieCutter } from "./create-cookie-cutter";
import {
  CreateCookieCutterArgs,
  CookieCutterTradeStateSeeds,
} from "./interfaces";
import { base58_to_binary } from "base58-js";
import { ES_TOKEN_METADATA_PROGRAM } from "../../es-token-metadata/utils/constant";

export const loadCookieCutterProgram = async (
  walletKeyPair: Keypair,
  env: string,
  customRpcUrl?: string
): Promise<anchor.Program> => {
  if (customRpcUrl) console.log("USING CUSTOM URL", customRpcUrl);

  const walletWrapper = new anchor.Wallet(walletKeyPair);

  console.log("deployment env => ", env);

  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl(env as Cluster),
    "confirmed"
  );
  const provider = new anchor.AnchorProvider(connection, walletWrapper, {
    preflightCommitment: "confirmed",
  });

  console.log("fetching IDL using program ID => ", COOKIE_CUTTER_PROGRAM_ID);
  const idl = await anchor.Program.fetchIdl(COOKIE_CUTTER_PROGRAM_ID, provider);

  return new anchor.Program(idl, COOKIE_CUTTER_PROGRAM_ID, provider);
};

export const addSOLToWallet = async (wallet: Keypair) => {
  try {
    const network = clusterApiUrl("devnet");

    const connection = new Connection(network);
    const airdropSignature = await connection.requestAirdrop(
      wallet.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL // 10000000 Lamports in 1 SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });
  } catch (error) {
    console.error(error);
  }
};

export const initCookieCutter = async (): Promise<{
  walletKeyPair: anchor.web3.Keypair;
  cookieCutter: PublicKey;
}> => {
  const walletKeyPair = anchor.web3.Keypair.generate();

  await addSOLToWallet(walletKeyPair);

  const cookieCutter = await createCookieCutter({
    keypair: walletKeyPair,
    env: "devnet",
    sellerFeeBasisPoints: 100,
    canChangeSalePrice: false,
    requiresSignOff: false,
    treasuryWithdrawalDestination: TREASURY_WALLET_KEY,
    feeWithdrawalDestination: FEE_DESTINATION_WALLET_KEY,
    treasuryMint: null,
  });

  console.log(
    "[ account ] [ initCookieCutter ] cookieCutter.toBase58 => ",
    cookieCutter.toBase58()
  );

  return { walletKeyPair, cookieCutter };
};

export const getAtaForMint = async (
  mint: anchor.web3.PublicKey,
  buyer: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  const ata = await anchor.web3.PublicKey.findProgramAddress(
    [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  return ata;
};

export const getCookieCutter = async (
  creator: anchor.web3.PublicKey,
  treasuryMint: anchor.web3.PublicKey
): Promise<[PublicKey, number]> => {
  try {
    const gd = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(COOKIE_CUTTER), creator.toBuffer(), treasuryMint.toBuffer()],
      COOKIE_CUTTER_PROGRAM_ID
    );

    return gd;
  } catch (error) {
    console.log(
      "[account] [getCookieCutter] error in getCookieCutter => ",
      error
    );
  }
};

export const getCookieCutterFeeAccount = async (
  cookieCutter: anchor.web3.PublicKey
): Promise<[PublicKey, number]> => {
  const gdFeeAcct = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(COOKIE_CUTTER),
      cookieCutter.toBuffer(),
      Buffer.from(FEE_PAYER),
    ],
    COOKIE_CUTTER_PROGRAM_ID
  );

  return gdFeeAcct;
};

export const getCookieCutterTreasuryAccount = async (
  cookieCutter: anchor.web3.PublicKey
): Promise<[PublicKey, number]> => {
  const gdTAcct = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(COOKIE_CUTTER),
      cookieCutter.toBuffer(),
      Buffer.from(TREASURY),
    ],
    COOKIE_CUTTER_PROGRAM_ID
  );

  return gdTAcct;
};

export const getCookieCutterProgramAsSigner = async (): Promise<
  [PublicKey, number]
> => {
  try {
    const cookieCutterProgramAsSignerAddress: [anchor.web3.PublicKey, number] =
      await anchor.web3.PublicKey.findProgramAddress(
        [Buffer.from(COOKIE_CUTTER), Buffer.from(SIGNER)],
        COOKIE_CUTTER_PROGRAM_ID
      );

    return cookieCutterProgramAsSignerAddress;
  } catch (error) {
    throw new Error("cannot find getCookieCutterProgramAsSigner address");
  }
};

export const getCookieCutterTradeState = async (
  seeds: CookieCutterTradeStateSeeds
): Promise<[PublicKey, number]> => {
  try {
    const cookieCutterTradeStateAddress: [anchor.web3.PublicKey, number] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from(COOKIE_CUTTER),
          seeds.walletKey.toBuffer(),
          seeds.cookieCutterKey.toBuffer(),
          seeds.tokenAccount.toBuffer(),
          seeds.treasuryMint.toBuffer(),
          seeds.tokenMint.toBuffer(),
          seeds.buyPrice.toBuffer("le", 8),
          seeds.tokenSize.toBuffer("le", 8),
        ],
        COOKIE_CUTTER_PROGRAM_ID
      );

    return cookieCutterTradeStateAddress;
  } catch (error) {
    throw new Error("cannot find getCookieCutterTradeState address");
  }
};

export const getCookieCutterBuyerEscrow = async (
  cookieCutterKey: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey
): Promise<[PublicKey, number]> => {
  const cookieCutterBuyerEscrowAddress: [PublicKey, number] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(COOKIE_CUTTER),
        cookieCutterKey.toBuffer(),
        wallet.toBuffer(),
      ],
      COOKIE_CUTTER_PROGRAM_ID
    );

  return cookieCutterBuyerEscrowAddress;
};

import { CreateCookieCutterArgs, CookieCutterObject } from "./interfaces";
import * as anchor from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  AccountInfo,
  clusterApiUrl,
  Connection,
  SignatureStatus,
} from "@solana/web3.js";
import { loadCookieCutterProgram } from "./account";
import { WRAPPED_SOL_MINT } from "./constants";

export const showCookieCutter = async ({
  walletKeyPair,
  env,
  cookieCutterKey,
  treasuryMint,
}: {
  walletKeyPair: Keypair;
  env: string;
  cookieCutterKey: PublicKey;
  treasuryMint: PublicKey;
}): Promise<void> => {
  console.log("----------- --------------------- ------------");
  console.log("----------- SHOWING Cookie Cutter   ------------");
  console.log("----------- --------------------- ------------");

  const cookieCutterProgram = await loadCookieCutterProgram(walletKeyPair, env);

  const treasuryMintKey = treasuryMint ? treasuryMint : WRAPPED_SOL_MINT;

  const cookieCutterObj: CookieCutterObject =
    (await cookieCutterProgram.account.cookieCutter.fetchNullable(
      cookieCutterKey
    )) as CookieCutterObject;

  const treasuryAmount =
    await cookieCutterProgram.provider.connection.getBalance(
      cookieCutterObj.cookieCutterTreasury
    );

  const feeAmount = await cookieCutterProgram.provider.connection.getBalance(
    cookieCutterObj.cookieCutterFeeAccount
  );

  console.log("-----");
  console.log("Auction House:", cookieCutterKey.toBase58());
  console.log("Mint:", cookieCutterObj.treasuryMint.toBase58());
  console.log("Authority:", cookieCutterObj.authority.toBase58());
  console.log("Creator:", cookieCutterObj.creator.toBase58());
  console.log(
    "Fee Payer Acct:",
    cookieCutterObj.cookieCutterFeeAccount.toBase58()
  );
  console.log(
    "Treasury Acct:",
    cookieCutterObj.cookieCutterTreasury.toBase58()
  );
  console.log(
    "Fee Payer Withdrawal Acct:",
    cookieCutterObj.feeWithdrawalDestination.toBase58()
  );
  console.log(
    "Treasury Withdrawal Acct:",
    cookieCutterObj.treasuryWithdrawalDestination.toBase58()
  );

  console.log("Fee Payer Bal:", feeAmount);
  console.log("Treasury Bal:", treasuryAmount);
  console.log("Seller Fee Basis Points:", cookieCutterObj.sellerFeeBasisPoints);
  console.log("Requires Sign Off:", cookieCutterObj.requiresSignOff);
  console.log("Can Change Sale Price:", cookieCutterObj.canChangeSalePrice);
  console.log("AH Bump:", cookieCutterObj.bump);
  console.log("AH Fee Bump:", cookieCutterObj.feePayerBump);
  console.log("AH Treasury Bump:", cookieCutterObj.treasuryBump);
};

import {
  CreateCookieCutterAccountArgs,
  CreateCookieCutterArgs,
  CreateCookieCutterRPCArgs,
} from "./interfaces";
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
import {
  getAtaForMint,
  getCookieCutter,
  getCookieCutterFeeAccount,
  getCookieCutterTreasuryAccount,
  loadCookieCutterProgram,
} from "./account";
import {
  FEE_DESTINATION_WALLET_KEY,
  TOKEN_PROGRAM_ID,
  TREASURY_WALLET_KEY,
  WRAPPED_SOL_MINT,
} from "./constants";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createApproveInstruction,
  createRevokeInstruction,
} from "@solana/spl-token";

export const createCookieCutter = async (
  args: CreateCookieCutterArgs
): Promise<PublicKey> => {
  const {
    canChangeSalePrice,
    env,
    feeWithdrawalDestination,
    keypair,
    requiresSignOff,
    sellerFeeBasisPoints,
    treasuryMint,
    treasuryWithdrawalDestination,
  }: CreateCookieCutterArgs = args;

  const cookieCutterProgram: anchor.Program = await loadCookieCutterProgram(
    keypair,
    env
  );

  console.log(
    "[utils] [createCookieCutter] cookieCutterProgram =>",
    cookieCutterProgram
  );

  const treasuryWithdrawalDestinationKey = treasuryWithdrawalDestination
    ? treasuryWithdrawalDestination
    : TREASURY_WALLET_KEY;

  const feeWithdrawalDestinationKey = feeWithdrawalDestination
    ? feeWithdrawalDestination
    : FEE_DESTINATION_WALLET_KEY;

  const treasuryMintKey = treasuryMint ? treasuryMint : WRAPPED_SOL_MINT;

  const treasuryWithdrawalDestinationAtaKey = treasuryMintKey.equals(
    WRAPPED_SOL_MINT
  )
    ? treasuryWithdrawalDestinationKey
    : (
        await getAtaForMint(treasuryMintKey, treasuryWithdrawalDestinationKey)
      )[0];

  console.log(
    "[utils] [createCookieCutter] treasuryWithdrawalDestinationKey =>",
    treasuryWithdrawalDestinationKey.toBase58()
  );
  console.log(
    "[utils] [createCookieCutter] feeWithdrawalDestinationKey =>",
    feeWithdrawalDestinationKey.toBase58()
  );
  console.log(
    "[utils] [createCookieCutter] treasuryMintKey =>",
    treasuryMintKey.toBase58()
  );
  console.log(
    "[utils] [createCookieCutter] treasuryWithdrawalDestinationAtaKey =>",
    treasuryWithdrawalDestinationAtaKey.toBase58()
  );

  const [cookieCutter, cookieCutterBump] = await getCookieCutter(
    keypair.publicKey,
    treasuryMintKey
  );

  const [feeAccount, feeAccountBump] = await getCookieCutterFeeAccount(
    cookieCutter
  );

  const [treasuryAccount, treasuryAccountBump] =
    await getCookieCutterTreasuryAccount(cookieCutter);

  console.log(
    "[utils] [createCookieCutter] [cookieCutter, cookieCutterBump]  =>",
    [cookieCutter.toBase58(), cookieCutterBump]
  );

  console.log("[utils] [createCookieCutter] [feeAccount, feeAccountBump]  =>", [
    feeAccount.toBase58(),
    feeAccountBump,
  ]);

  console.log(
    "[utils] [createCookieCutter] [treasuryAccount, treasuryAccountBump] =>",
    [treasuryAccount.toBase58(), treasuryAccountBump]
  );

  const rpcArgs: CreateCookieCutterRPCArgs = {
    canChangeSalePrice,
    cookieCutterBump,
    cookieCutterFeePayerBump: feeAccountBump,
    cookieCutterTreasuryBump: treasuryAccountBump,
    requiresSignOff,
    sellerFeeBasisPoints,
  };

  const rpcAccount: CreateCookieCutterAccountArgs = {
    ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    authority: keypair.publicKey,
    feeWithdrawalDestination: feeWithdrawalDestinationKey,
    cookieCutter,
    cookieCutterFeeAccount: feeAccount,
    cookieCutterTreasury: treasuryAccount,
    payer: keypair.publicKey,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    treasuryMint: treasuryMintKey,
    treasuryWithdrawalDestination: treasuryWithdrawalDestinationAtaKey,
    treasuryWithdrawalDestinationOwner: treasuryWithdrawalDestinationKey,
  };

  console.log("[utils] [createCookieCutter] rpcArgs =>", rpcArgs);
  console.log("[utils] [createCookieCutter] rpcAccount =>", rpcAccount);

  const tx = await cookieCutterProgram.methods
    .createCookieCutter(rpcArgs as any)
    .accounts(rpcAccount as any)
    .signers([keypair])
    .rpc();

  console.log("[utils] [createCookieCutter] tx =>", tx);

  return cookieCutter;
};

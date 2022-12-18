import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  getMetadata,
  loadEsTokenMetadataProgram,
} from "../../es-token-metadata/utils/account";
import {
  getCookieCutterBuyerEscrow,
  getCookieCutterTradeState,
  loadCookieCutterProgram,
} from "./account";
import {
  BidCookieCutterAccountArgs,
  BidCookieCutterArgs,
  CookieCutterObject,
} from "./interfaces";
import { getPriceWithMantissa } from "./misc";

export const bid = async (args: BidCookieCutterArgs) => {
  const {
    buyPrice,
    tokenSize,
    cookieCutterKey,
    env,
    mintKey,
    paymentAccountKeypair,
    walletKeypair,
    sellPrice,
    sellerWalletKeypair,
  } = args;

  console.log("----------- --------------------- ------------");
  console.log("----------- BIDDING Cookie Cutter   ------------");
  console.log("----------- --------------------- ------------");

  console.log("[bid] || cookieCutterKey => ", cookieCutterKey.toBase58());
  console.log("[bid] || walletKeyPair => ", walletKeypair.publicKey.toBase58());
  console.log(
    "[bid] || walletKeyPair => ",
    sellerWalletKeypair.publicKey.toBase58()
  );
  console.log(
    "[bid] || paymentAccountKeypair => ",
    paymentAccountKeypair.publicKey.toBase58()
  );
  console.log("[bid] || mintKey => ", mintKey.toBase58());

  const cookieCutterProgram = await loadCookieCutterProgram(walletKeypair, env);

  const cookieCutterObj =
    (await cookieCutterProgram.account.cookieCutter.fetchNullable(
      cookieCutterKey
    )) as CookieCutterObject;

  if (cookieCutterObj === null)
    throw new Error("[bid] cookieCutterObj cannot be null");

  console.log("[bid] || cookieCutterObj => ", cookieCutterObj);

  const sellPriceAdjusted = new anchor.BN(
    await getPriceWithMantissa(
      sellPrice,
      mintKey,
      sellerWalletKeypair,
      cookieCutterProgram
    )
  );

  const buyPriceAdjusted = new anchor.BN(
    await getPriceWithMantissa(
      buyPrice,
      cookieCutterObj.treasuryMint,
      walletKeypair,
      cookieCutterProgram
    )
  );

  const tokenSizeAdjusted = new anchor.BN(
    await getPriceWithMantissa(
      tokenSize,
      mintKey,
      sellerWalletKeypair,
      cookieCutterProgram
    )
  );

  console.log("[bid] || sellPriceAdjusted => ", sellPriceAdjusted);
  console.log("[bid] || buyPriceAdjusted => ", buyPriceAdjusted);
  console.log("[bid] || tokenSizeAdjusted => ", tokenSizeAdjusted);

  const tokenAccountKey: anchor.web3.PublicKey =
    await getAssociatedTokenAddress(mintKey, sellerWalletKeypair.publicKey);

  const esTokenMetaDataProgram = await loadEsTokenMetadataProgram(
    walletKeypair,
    env
  );

  console.log(
    "[bid] || esTokenMetaDataProgram => ",
    esTokenMetaDataProgram.programId.toBase58()
  );

  const [esTokenMetaDataKey, esTokenMetaDataBump] = await getMetadata(
    esTokenMetaDataProgram,
    mintKey
  );
  console.log(
    "[bid] || esTokenMetaDataKey => ",
    esTokenMetaDataKey.toBase58(),
    esTokenMetaDataBump
  );

  console.log("[bid] || tokenAccountKey => ", tokenAccountKey.toBase58());

  const [escrowPaymentAccount, escrowPaymentAccountBump] =
    await getCookieCutterBuyerEscrow(cookieCutterKey, walletKeypair.publicKey);

  console.log(
    "[bid] || [escrowPaymentAccount, escrowPaymentAccountBump] => ",
    escrowPaymentAccount.toBase58(),
    escrowPaymentAccountBump
  );

  const [buyerTradeStateAddress, buyerTradeStateBump] =
    await getCookieCutterTradeState({
      buyPrice: buyPriceAdjusted,
      cookieCutterKey: cookieCutterKey,
      tokenAccount: tokenAccountKey,
      tokenMint: mintKey,
      tokenSize: tokenSizeAdjusted,
      treasuryMint: cookieCutterObj.treasuryMint,
      walletKey: walletKeypair.publicKey,
    });

  const [sellerTradeStateAddress, sellerTradeStateBump] =
    await getCookieCutterTradeState({
      cookieCutterKey: cookieCutterKey,
      walletKey: sellerWalletKeypair.publicKey,
      tokenAccount: tokenAccountKey,
      treasuryMint: cookieCutterObj.treasuryMint,
      tokenMint: mintKey,
      tokenSize: tokenSizeAdjusted,
      buyPrice: sellPriceAdjusted,
    });

  console.log(
    "[bid] || sellerTradeStateAddress => ",
    sellerTradeStateAddress.toBase58(),
    " with bump value of ",
    sellerTradeStateBump
  );

  console.log(
    "[bid] || [buyerTradeStateAddress, buyerTradeStateBump] => ",
    buyerTradeStateAddress.toBase58(),
    buyerTradeStateBump
  );

  const bidAccount: BidCookieCutterAccountArgs = {
    authority: cookieCutterObj.authority,
    buyerTradeState: buyerTradeStateAddress,
    cookieCutter: cookieCutterKey,
    cookieCutterFeeAccount: cookieCutterObj.cookieCutterFeeAccount,
    escrowPaymentAccount: escrowPaymentAccount,
    metadataAccount: esTokenMetaDataKey,
    paymentAccount: paymentAccountKeypair.publicKey,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenAccount: tokenAccountKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    treasuryMint: cookieCutterObj.treasuryMint,
    wallet: walletKeypair.publicKey,
    sellerTradeState: sellerTradeStateAddress,
    seller: sellerWalletKeypair.publicKey,
  };

  const tx = await cookieCutterProgram.methods
    .bid(
      buyPriceAdjusted,
      tokenSizeAdjusted,
      escrowPaymentAccountBump,
      sellerTradeStateBump
    )
    .accounts(bidAccount as any)
    .rpc();

  console.log("[bid] || tx => ", tx);
};

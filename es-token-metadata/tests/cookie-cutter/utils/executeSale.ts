import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  getMetadata,
  loadEsTokenMetadataProgram,
} from "../../es-token-metadata/utils/account";
import {
  getCookieCutterBuyerEscrow,
  getCookieCutterProgramAsSigner,
  getCookieCutterTradeState,
  loadCookieCutterProgram,
} from "./account";
import { TOKEN_PROGRAM_ID } from "./constants";
import {
  CookieCutterObject,
  ExecuteSaleCookieCutterAccountArgs,
  ExecuteSaleCookieCutterArgs,
} from "./interfaces";
import { getPriceWithMantissa } from "./misc";

export const executeSale = async (args: ExecuteSaleCookieCutterArgs) => {
  const {
    buyPrice,
    buyerWalletKeypair,
    cookieCutterKey,
    env,
    mintKey,
    sellPrice,
    sellerWalletKeypair,
    tokenSize,
  } = args;

  console.log("----------- --------------------- ------------");
  console.log("----------- executeSale Cookie Cutter   ------------");
  console.log("----------- --------------------- ------------");

  console.log(
    "[executeSale] || cookieCutterKey => ",
    cookieCutterKey.toBase58()
  );
  console.log(
    "[executeSale] || buyerWalletKey => ",
    buyerWalletKeypair.publicKey.toBase58()
  );
  console.log(
    "[executeSale] || sellerWalletKey => ",
    sellerWalletKeypair.publicKey.toBase58()
  );
  console.log("[executeSale] || mintKey => ", mintKey.toBase58());

  const cookieCutterProgram = await loadCookieCutterProgram(
    sellerWalletKeypair,
    env
  );

  const cookieCutterObj =
    (await cookieCutterProgram.account.cookieCutter.fetchNullable(
      cookieCutterKey
    )) as CookieCutterObject;

  if (cookieCutterObj === null)
    throw new Error("[executeSale] cookieCutterObj cannot be null");

  console.log("[executeSale] || cookieCutterObj => ", cookieCutterObj);

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
      buyerWalletKeypair,
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

  console.log("[executeSale] || sellPriceAdjusted => ", sellPriceAdjusted);
  console.log("[executeSale] || buyPriceAdjusted => ", buyPriceAdjusted);
  console.log("[executeSale] || tokenSizeAdjusted => ", tokenSizeAdjusted);

  const tokenAccountKey: anchor.web3.PublicKey =
    await getAssociatedTokenAddress(mintKey, sellerWalletKeypair.publicKey);

  const esTokenMetaDataProgram = await loadEsTokenMetadataProgram(
    sellerWalletKeypair,
    env
  );

  console.log(
    "[executeSale] || esTokenMetaDataProgram => ",
    esTokenMetaDataProgram.programId.toBase58()
  );

  const [esTokenMetaDataKey, esTokenMetaDataBump] = await getMetadata(
    esTokenMetaDataProgram,
    mintKey
  );
  console.log(
    "[executeSale] || esTokenMetaDataKey => ",
    esTokenMetaDataKey.toBase58(),
    esTokenMetaDataBump
  );

  console.log(
    "[executeSale] || tokenAccountKey => ",
    tokenAccountKey.toBase58()
  );

  const [escrowPaymentAccount, escrowPaymentAccountBump] =
    await getCookieCutterBuyerEscrow(
      cookieCutterKey,
      buyerWalletKeypair.publicKey
    );

  console.log(
    "[executeSale] || [escrowPaymentAccount, escrowPaymentAccountBump] => ",
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
      walletKey: buyerWalletKeypair.publicKey,
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

  const [programAsSigner, programAsSignerBump] =
    await getCookieCutterProgramAsSigner();

  console.log(
    "[executeSale] || sellerTradeStateAddress => ",
    sellerTradeStateAddress.toBase58(),
    " with bump value of ",
    sellerTradeStateBump
  );

  console.log(
    "[executeSale] || [buyerTradeStateAddress, buyerTradeStateBump] => ",
    buyerTradeStateAddress.toBase58(),
    buyerTradeStateBump
  );

  console.log("[executeSale] || [programAsSigner, programAsSignerBump] => ", [
    programAsSigner.toBase58(),
    programAsSignerBump,
  ]);

  const executeSaleAccounts: ExecuteSaleCookieCutterAccountArgs = {
    ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    authority: cookieCutterObj.authority,
    buyer: buyerWalletKeypair.publicKey,
    buyerReceiptTokenAccount: buyerWalletKeypair.publicKey,
    buyerTradeState: buyerTradeStateAddress,
    cookieCutter: cookieCutterKey,
    cookieCutterFeeAccount: cookieCutterObj.cookieCutterFeeAccount,
    cookieCutterTreasury: cookieCutterObj.cookieCutterTreasury,
    escrowPaymentAccount: escrowPaymentAccount,
    metadataAccount: esTokenMetaDataKey,
    programAsSigner: programAsSigner,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    seller: sellerWalletKeypair.publicKey,
    sellerPaymentReceiptAccount: sellerWalletKeypair.publicKey,
    sellerTradeState: sellerTradeStateAddress,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenAccount: tokenAccountKey,
    tokenMint: mintKey,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  const tx = await cookieCutterProgram.methods
    .executeSale(programAsSignerBump, buyPriceAdjusted, tokenSizeAdjusted)
    .accounts(executeSaleAccounts as any)
    .rpc();

  console.log("[executeSale] || tx => ", tx);
};

import * as anchor from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "bn.js";
import {
  getMetadata,
  loadEsTokenMetadataProgram,
} from "../../es-token-metadata/utils/account";
import {
  addSOLToWallet,
  getCookieCutterProgramAsSigner,
  getCookieCutterTradeState,
  loadCookieCutterProgram,
} from "./account";
import {
  CookieCutterObject,
  SellCookieCutterAccountArgs,
  SellCookieCutterArgs,
  SellCookieCutterRPCArgs,
} from "./interfaces";
import { getPriceWithMantissa } from "./misc";

export const sell = async (args: SellCookieCutterArgs) => {
  const {
    buyPrice,
    env,
    cookieCutterKey,
    cookieCutterSigns,
    mintKey,
    tokenSize,
    walletKeypair,
  }: SellCookieCutterArgs = args;

  console.log("----------- --------------------- ------------");
  console.log("----------- SELLING Cookie Cutter   ------------");
  console.log("----------- --------------------- ------------");

  console.log(
    "[sell] || walletKeypair => ",
    walletKeypair.publicKey.toBase58()
  );

  //await addSOLToWallet(walletKeypair);

  const cookieCutterProgram = await loadCookieCutterProgram(walletKeypair, env);
  console.log(
    "[sell] || cookieCutterProgram => ",
    cookieCutterProgram.programId.toBase58()
  );

  const cookieCutterObj: CookieCutterObject =
    (await cookieCutterProgram.account.cookieCutter.fetchNullable(
      cookieCutterKey
    )) as CookieCutterObject;

  if (cookieCutterObj === null)
    throw new Error("auction house account not found");

  const priceFromBuyPrice = await getPriceWithMantissa(
    buyPrice,
    mintKey,
    walletKeypair,
    cookieCutterProgram
  );

  const buyPriceAdjusted = new BN(priceFromBuyPrice);

  console.log("[sell] || buyPriceAdjusted => ", buyPriceAdjusted.toNumber());

  const priceFromTokenSize = await getPriceWithMantissa(
    tokenSize,
    mintKey,
    walletKeypair,
    cookieCutterProgram
  );

  const tokenSizeAdjusted = new BN(priceFromTokenSize);

  console.log("[sell] || tokenSizeAdjusted => ", tokenSizeAdjusted.toNumber());

  const tokenAccountKey: anchor.web3.PublicKey =
    await getAssociatedTokenAddress(mintKey, walletKeypair.publicKey);

  console.log("[sell] || tokenAccountKey => ", tokenAccountKey.toBase58());

  const [programAsSigner, programAsSignerBump] =
    await getCookieCutterProgramAsSigner();

  console.log(
    "[sell] || programAsSigner => ",
    programAsSigner.toBase58(),
    " with bump value of ",
    programAsSignerBump
  );

  console.log("[sell] || tradestate seeds => ", {
    auctionHouse: cookieCutterKey,
    wallet: walletKeypair.publicKey,
    tokenAccount: tokenAccountKey,
    treasuryMint: cookieCutterObj.treasuryMint,
    tokenMint: mintKey,
    tokenSize: tokenSizeAdjusted,
    buyPrice: buyPriceAdjusted,
  });

  const [sellerTradeState, sellerTradeStateBump] =
    await getCookieCutterTradeState({
      cookieCutterKey: cookieCutterKey,
      walletKey: walletKeypair.publicKey,
      tokenAccount: tokenAccountKey,
      treasuryMint: cookieCutterObj.treasuryMint,
      tokenMint: mintKey,
      tokenSize: tokenSizeAdjusted,
      buyPrice: buyPriceAdjusted,
    });

  console.log(
    "[sell] || tradeState => ",
    sellerTradeState.toBase58(),
    " with bump value of ",
    sellerTradeStateBump
  );

  const esTokenMetaDataProgram = await loadEsTokenMetadataProgram(
    walletKeypair,
    env
  );

  console.log(
    "[sell] || esTokenMetaDataProgram => ",
    esTokenMetaDataProgram.programId.toBase58()
  );

  const [esTokenMetaDataKey, esTokenMetaDataBump] = await getMetadata(
    esTokenMetaDataProgram,
    mintKey
  );
  console.log(
    "[sell] || esTokenMetaDataKey => ",
    esTokenMetaDataKey.toBase58(),
    esTokenMetaDataBump
  );

  const sellArgs: SellCookieCutterRPCArgs = {
    metadataBump: esTokenMetaDataBump,
    programAsSignerBump: programAsSignerBump,
    buyerPrice: buyPriceAdjusted,
    tokenSize: tokenSizeAdjusted,
  };

  console.log("[sell] || sellArgs => ", sellArgs);

  const sellAccount: SellCookieCutterAccountArgs = {
    authority: cookieCutterObj.authority,
    cookieCutter: cookieCutterKey,
    metadataAccount: esTokenMetaDataKey,
    cookieCutterFeeAccount: cookieCutterObj.cookieCutterFeeAccount,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    sellerTradeState: sellerTradeState,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenAccount: tokenAccountKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    wallet: walletKeypair.publicKey,
    programAsSigner,
  };

  console.log("[sell] || sellAccount => ", sellAccount);

  const tx = await cookieCutterProgram.methods
    .sell(
      esTokenMetaDataBump,
      programAsSignerBump,
      buyPriceAdjusted,
      tokenSizeAdjusted
    )
    .accounts(sellAccount as any)
    .signers([walletKeypair])
    .rpc();

  console.log("[sell] || tx => ", tx);
};

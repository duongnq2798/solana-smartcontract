import {
  PublicKeyInitData,
  Keypair,
  TransactionInstruction,
  Blockhash,
  FeeCalculator,
  PublicKey,
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

//#region CreateCookieCutter
export type CreateCookieCutterArgs = {
  keypair: Keypair;
  env: string;
  sellerFeeBasisPoints: number;
  canChangeSalePrice: boolean;
  requiresSignOff: boolean;
  treasuryWithdrawalDestination: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryMint: PublicKey;
};

export type CreateCookieCutterRPCArgs = {
  cookieCutterBump: number;
  cookieCutterTreasuryBump: number;
  cookieCutterFeePayerBump: number;
  sellerFeeBasisPoints: number;
  requiresSignOff: boolean;
  canChangeSalePrice: boolean;
};

export type CreateCookieCutterAccountArgs = {
  treasuryMint: PublicKey;
  payer: PublicKey;
  authority: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestinationOwner: PublicKey;
  cookieCutter: PublicKey;
  cookieCutterFeeAccount: PublicKey;
  cookieCutterTreasury: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  ataProgram: PublicKey;
  rent: any;
};
//#endregion

export type CookieCutterObject = {
  cookieCutterFeeAccount: PublicKey;
  cookieCutterTreasury: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
  feeWithdrawalDestination: PublicKey;
  treasuryMint: PublicKey;
  authority: PublicKey;
  creator: PublicKey;
  bump: number;
  treasuryBump: number;
  feePayerBump: number;
  sellerFeeBasisPoints: number;
  requiresSignOff: boolean;
  canChangeSalePrice: boolean;
  escrowPaymentBump: number;
};

//#region SellCookieCutter
export type SellCookieCutterArgs = {
  walletKeypair: Keypair;
  env: string;
  cookieCutterKey: anchor.web3.PublicKey;
  buyPrice: number;
  mintKey: anchor.web3.PublicKey;
  tokenSize: number;
  cookieCutterSigns: boolean;
};

export type CookieCutterTradeStateSeeds = {
  cookieCutterKey: anchor.web3.PublicKey;
  walletKey: anchor.web3.PublicKey;
  tokenAccount: anchor.web3.PublicKey;
  treasuryMint: anchor.web3.PublicKey;
  tokenMint: anchor.web3.PublicKey;
  tokenSize: anchor.BN;
  buyPrice: anchor.BN;
};

export type SellCookieCutterRPCArgs = {
  metadataBump: number;
  programAsSignerBump: number;
  buyerPrice: anchor.BN;
  tokenSize: anchor.BN;
};

export type SellCookieCutterAccountArgs = {
  wallet: PublicKey;
  tokenAccount: PublicKey;
  metadataAccount: PublicKey;
  authority: PublicKey;
  cookieCutter: PublicKey;
  cookieCutterFeeAccount: PublicKey;
  sellerTradeState: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
  rent: any;
  programAsSigner: PublicKey;
};

//#endregion

export type BidCookieCutterArgs = {
  walletKeypair: Keypair;
  paymentAccountKeypair: Keypair;
  env: string;
  cookieCutterKey: anchor.web3.PublicKey;
  buyPrice: number;
  sellPrice: number;
  sellerWalletKeypair: anchor.web3.Keypair;
  mintKey: anchor.web3.PublicKey;
  tokenSize: number;
};

export type BidCookieCutterAccountArgs = {
  seller: PublicKey;
  wallet: PublicKey;
  paymentAccount: PublicKey;
  treasuryMint: PublicKey;
  tokenAccount: PublicKey;
  metadataAccount: PublicKey;
  authority: PublicKey;
  escrowPaymentAccount: PublicKey;
  buyerTradeState: PublicKey;
  sellerTradeState: PublicKey;
  cookieCutter: PublicKey;
  cookieCutterFeeAccount: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
  rent: any;
};

export type ExecuteSaleCookieCutterArgs = {
  env: string;
  buyerWalletKeypair: Keypair;
  sellerWalletKeypair: Keypair;
  sellPrice: number;
  buyPrice: number;
  mintKey: anchor.web3.PublicKey;
  tokenSize: number;
  cookieCutterKey: PublicKey;
};

export type ExecuteSaleCookieCutterAccountArgs = {
  buyer: PublicKey;
  seller: PublicKey;
  tokenAccount: PublicKey;
  tokenMint: PublicKey;
  metadataAccount: PublicKey;
  escrowPaymentAccount: PublicKey;
  sellerPaymentReceiptAccount: PublicKey;
  buyerReceiptTokenAccount: PublicKey;
  authority: PublicKey;
  cookieCutter: PublicKey;
  cookieCutterFeeAccount: PublicKey;
  cookieCutterTreasury: PublicKey;
  buyerTradeState: PublicKey;
  sellerTradeState: PublicKey;
  tokenProgram: PublicKey;
  systemProgram: PublicKey;
  ataProgram: PublicKey;
  programAsSigner: PublicKey;
  rent: PublicKey;
};

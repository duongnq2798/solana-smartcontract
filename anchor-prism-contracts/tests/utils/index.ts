import * as anchor from "@project-serum/anchor";
import { Payments } from "../../target/types/payments";
import { Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { expect } from "chai";
import { Currency, User } from "../types";

export const getSolanaEnv = () => {
  const provider: anchor.Provider = anchor.getProvider();
  const connection: Connection = provider.connection;
  const program = anchor.workspace.Payments as anchor.Program<Payments>;
  return {
    provider: provider,
    connection: connection,
    program: program,
  };
};

export const { provider, connection, program } = getSolanaEnv();

export const getProductAccount = async (productPDA: anchor.web3.PublicKey) => {
  let productAccount = await program.account.product.fetch(productPDA);
  return productAccount;
};

export const getPaymentAccount = async (
  paymentPDA: anchor.web3.PublicKey
) => {
  let paymentAccount = await program.account.payment.fetch(
    paymentPDA
  );
  return paymentAccount;
};

export const solToLamports = (sol: number): number => {
  return sol * 1_000_000_000;
};

export const airdropSol = async (
  publicKey: anchor.web3.PublicKey,
  sol: number = 1
): Promise<void> => {
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(publicKey, solToLamports(sol)),
    "confirmed"
  );
};

export const createUser = async (currency: Currency): Promise<User> => {
  const keypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  await airdropSol(keypair.publicKey, 1);
  const tokenAccount: anchor.web3.PublicKey = await createTokenAccount(
    keypair.publicKey,
    currency
  );
  return {
    keypair: keypair,
    tokenAccount: tokenAccount,
  } as User;
};

export const createCurrency = async () => {
  const payer = anchor.web3.Keypair.generate();
  const authority = anchor.web3.Keypair.generate();
  await airdropSol(payer.publicKey, 1);
  const mint = await Token.createMint(
    provider.connection,
    payer,
    authority.publicKey,
    null,
    0,
    TOKEN_PROGRAM_ID
  );
  return {
    mint: mint,
    payer: payer,
    authority: authority,
  } as Currency;
};

export const mintCurrencyTo = async (
  currency: Currency,
  tokenAccount: anchor.web3.PublicKey,
  amount: number
): Promise<void> => {
  await currency.mint.mintTo(
    tokenAccount,
    currency.authority.publicKey,
    [currency.authority],
    amount
  );
};

export const getTokenAccountInfoFromCurrency = async (
  currency: Currency,
  tokenAccount: anchor.web3.PublicKey
) => {
  const accountInfo = await currency.mint.getAccountInfo(tokenAccount); // This any is infact an anchor.web3.AccountInfo type ...
  return accountInfo;
};

export const getSolanaAccountInfoFromPublicKey = async (
  publicKey: anchor.web3.PublicKey
) => {
  const accountInfo = await connection.getAccountInfo(publicKey);
  return accountInfo;
};

export const createTokenAccount = async (
  publicKey: anchor.web3.PublicKey,
  currency: Currency
): Promise<anchor.web3.PublicKey> => {
  const tokenAccount: anchor.web3.PublicKey = await currency.mint.createAccount(
    publicKey
  );
  return tokenAccount;
};

export const createTreasury = (): anchor.web3.Keypair => {
  return anchor.web3.Keypair.generate();
};

export const createPayment = (): anchor.web3.Keypair => {
  return anchor.web3.Keypair.generate();
};

export const expectThrowsAsync = async (method, errorMessage) => {
  let error = null;
  try {
    await method();
  } catch (err) {
    error = err;
  }
  expect(error).to.not.equal(null);
  if (errorMessage) {
    expect(error.message).to.equal(errorMessage);
  }
};

export const deserializeBN = (x: any): anchor.BN => {
  return x.toNumber();
};

import * as anchor from '@project-serum/anchor';
import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  SystemProgram,
  TransactionSignature,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import * as splToken from '@solana/spl-token';
import {
  Account,
  AccountLayout as TokenAccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const provider: anchor.Provider = anchor.getProvider();
const connection: Connection = provider.connection;

const createRandomMint = async (
  authority: any,
  decimals: number
): Promise<[Keypair, PublicKey]> => {
  const mintKeypair: Keypair = createKeypair();
  const airdrop1: string = await airdropSol(
    connection,
    mintKeypair.publicKey,
    2
  );
  await connection.confirmTransaction(airdrop1);
  const airdrop2: string = await airdropSol(connection, authority.publicKey, 2);
  await connection.confirmTransaction(airdrop2);
  const signer: Signer = {
    publicKey: mintKeypair.publicKey,
    secretKey: mintKeypair.secretKey,
  };
  const mint: PublicKey = await createMint(
    connection,
    signer,
    authority.publicKey,
    null,
    decimals
  );
  return [mintKeypair, mint];
};

const sleep = async (ms: number) => {
  await new Promise((response) =>
    setTimeout(() => {
      response(0);
    }, ms)
  );
};

const lamportsToSol = (lamports: number): number => {
  return lamports * 10 ** -9;
};

const solToLamports = (sol: number): number => {
  return sol * 10 ** 9;
};

const deserializeString = (x: any): string => {
  return x.toString().slice(4); // var regex = new RegExp('\\u(....)(\\u0000)*');
};

const deserializeBN = (x: any): anchor.BN => {
  return new anchor.BN(x.toNumber());
};

const createKeypair = (): Keypair => {
  const keypair: Keypair = Keypair.generate();
  return keypair;
};

enum BillingSchemeEnum {
  Active = 'Active',
  Deactive = 'Deactive',
}

type BillingScheme = `${BillingSchemeEnum}`;

const airdropSol = async (
  connection: Connection,
  publicKey: PublicKey,
  sol: number
): Promise<TransactionSignature> => {
  const lamports: number = solToLamports(sol);
  const signature: TransactionSignature = await connection.requestAirdrop(
    publicKey,
    lamports
  );
  return signature;
};

const usdcMint = new PublicKey('BXXkv6z8ykpG1yuvUDPgh732wzVHB69RnB9YgSYh3itW');

interface TxWithSigners {
  tx: Transaction;
  signers: Signer[];
}

const createTokenAccount = async (
  authority: any,
  mint: PublicKey
): Promise<Account> => {
  const tokenAccountAuthority: Keypair = createKeypair();
  const signature: string = await airdropSol(
    connection,
    tokenAccountAuthority.publicKey,
    2
  );
  await connection.confirmTransaction(signature);
  const signer: Signer = {
    publicKey: tokenAccountAuthority.publicKey,
    secretKey: tokenAccountAuthority.secretKey,
  };
  const tokenAccount: Account = await getOrCreateAssociatedTokenAccount(
    connection,
    signer,
    mint,
    authority.publicKey
  );
  return tokenAccount;
};

const mintTokensTo = async (
  destination: PublicKey,
  mint: PublicKey,
  authority: any,
  amount: number
): Promise<string> => {
  const signer: Signer = {
    publicKey: authority.publicKey,
    secretKey: authority.secretKey,
  };
  const signature: string = await mintTo(
    connection,
    authority,
    mint,
    destination,
    signer,
    amount
  );
  return signature;
};

export {
  createRandomMint,
  createTokenAccount,
  mintTokensTo,
  sleep,
  usdcMint,
  lamportsToSol,
  solToLamports,
  deserializeString,
  deserializeBN,
  createKeypair,
  TxWithSigners,
  BillingScheme,
  BillingSchemeEnum,
  airdropSol,
};

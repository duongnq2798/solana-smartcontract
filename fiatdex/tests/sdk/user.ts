import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import { PublicKey, Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createAssociatedTokenAccount, mintTo, getAssociatedTokenAddress } from "@solana/spl-token";
import nacl from "tweetnacl";
import { Fiatdex } from "../../target/types/fiatdex";
import * as genTypes from "../../generated/types";
import * as genAccs from "../../generated/accounts";
import { Market } from "./market";
import { SSL_OP_NETSCAPE_CA_DN_BUG } from "constants";


export interface User {
  userKeypair?: Keypair,
  user: PublicKey,
  userAccount: PublicKey,
  userQuote: PublicKey,
}

export async function initUser(program: anchor.Program<Fiatdex>, provider: anchor.Provider, wallet: anchor.Wallet, market: Market, numQuoteTokens: BN): Promise<User> {
  let userKeypair = new anchor.web3.Keypair();
  let user = userKeypair.publicKey;
  await provider.connection.requestAirdrop(user, 1_000_000_00)

  let userQuote = await createAssociatedTokenAccount(
    provider.connection,
    wallet.payer,
    market.quoteMint,
    user
  );
  if (numQuoteTokens.gt(new BN(0))) {
    await mintTo(
      provider.connection,
      wallet.payer,
      market.quoteMint,
      userQuote,
      wallet.publicKey,
      numQuoteTokens.toNumber(),
    );
  }
  let [userAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [user.toBuffer(), Buffer.from("user_account"), Buffer.from(market.marketId), wallet.publicKey.toBuffer()],
    program.programId
  );
  return {
    userKeypair,
    user,
    userAccount,
    userQuote,
  }
}
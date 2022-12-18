import * as anchor from "@project-serum/anchor";
import { Token } from "@solana/spl-token";

export type Currency = {
  mint: Token;
  payer: anchor.web3.Keypair;
  authority: anchor.web3.Keypair;
};

export type User = {
  keypair: anchor.web3.Keypair;
  tokenAccount: anchor.web3.PublicKey;
};

import * as anchor from "@project-serum/anchor";
import { getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const getPriceWithMantissa = async (
  price: number,
  mint: anchor.web3.PublicKey,
  walletKeyPair: anchor.web3.Keypair,
  anchorProgram: anchor.Program
): Promise<number> => {
  const mintAccount = await getMint(anchorProgram.provider.connection, mint);

  const mantissa = 10 ** mintAccount.decimals;

  return Math.ceil(price * mantissa);
};

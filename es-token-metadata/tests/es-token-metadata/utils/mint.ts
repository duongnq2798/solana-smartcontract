import * as anchor from "@project-serum/anchor";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
export const mint = async (
  esTokenMetadataProgram: anchor.Program,
  walletKeyPair: anchor.web3.Keypair
): Promise<anchor.web3.Keypair> => {
  const lamports: number =
    await esTokenMetadataProgram.provider.connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

  const mintKeyPair = anchor.web3.Keypair.generate();

  const ata = await getAssociatedTokenAddress(
    mintKeyPair.publicKey,
    walletKeyPair.publicKey
  );

  console.log("[mint] lamports =>", lamports);
  console.log("[mint] mintKeyPair =>", mintKeyPair.publicKey.toBase58());
  console.log("[mint] ata =>", ata.toBase58());

  const instructions = [
    //create account for mint key
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: walletKeyPair.publicKey,
      lamports,
      newAccountPubkey: mintKeyPair.publicKey,
      programId: TOKEN_PROGRAM_ID,
      space: MINT_SIZE,
    }),

    //fire transaction to create mint account that controlled by anchor wallet (key)
    createInitializeMintInstruction(
      mintKeyPair.publicKey,
      0,
      walletKeyPair.publicKey,
      walletKeyPair.publicKey
    ),

    //create the ATA account assocciated with mint and anchor wallet
    createAssociatedTokenAccountInstruction(
      walletKeyPair.publicKey,
      ata,
      walletKeyPair.publicKey,
      mintKeyPair.publicKey
    ),
  ];

  const tx = new anchor.web3.Transaction().add(...instructions);

  console.log("[mint] tx =>", tx);

  const res = await esTokenMetadataProgram.provider.sendAndConfirm!(tx, [
    mintKeyPair,
  ]);

  console.log("[mint] res =>", res);

  const mintAccount = {
    mintAuthority: walletKeyPair.publicKey,
    mint: mintKeyPair.publicKey,
    tokenProgram: TOKEN_PROGRAM_ID,
    tokenAccount: ata,
    payer: walletKeyPair.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
  };

  console.log("[mint] mintAccount =>", mintAccount);

  const es_tx = await esTokenMetadataProgram.methods
    .mintNft()
    .accounts(mintAccount)
    .rpc();

  console.log("[mint] es_tx =>", es_tx);

  return mintKeyPair;
};

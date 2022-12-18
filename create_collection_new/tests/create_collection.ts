import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { CreateCollection } from "../target/types/create_collection";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  MINT_SIZE,
} from "@solana/spl-token";
const { PublicKey, SystemProgram } = anchor.web3; 
import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';

/**
 * @category Instructions
 * @category SetCollectionDuringMint
 * @category generated
 */

describe("create_collection", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CreateCollection as Program<CreateCollection>;

  it("Is initialized!", async () => {
    // Add your test here.
    // const tx = await program.methods.initialize().rpc();
    // console.log("Your transaction signature", tx);

   

    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const lamports: number =
      await program.provider.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );
    const getMetadata = async (
      mint: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> => {
      return (
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];
    };
    const getMasterEdition = async (
      mint: anchor.web3.PublicKey
    ): Promise<anchor.web3.PublicKey> => {
      return (
        await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
          ],
          TOKEN_METADATA_PROGRAM_ID
        )
      )[0];
    };
    const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();





    const NftTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      program.provider.wallet.publicKey
    );
    console.log("NFT Account: ", NftTokenAccount.toBase58());
    const mint_tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: program.provider.wallet.publicKey,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      }),
      createInitializeMintInstruction(
        mintKey.publicKey,
        0,
        program.provider.wallet.publicKey,
        program.provider.wallet.publicKey
      ),
      createAssociatedTokenAccountInstruction(
        program.provider.wallet.publicKey,
        NftTokenAccount,
        program.provider.wallet.publicKey,
        mintKey.publicKey
      )
    );
    const res = await program.provider.sendAndConfirm(mint_tx, [mintKey]);
    console.log(
      await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
    );
    console.log("Account: ", res);
    console.log("Mint key: ", mintKey.publicKey.toString());
    console.log("User: ", program.provider.wallet.publicKey.toString());
    const metadataAddress = await getMetadata(mintKey.publicKey);
    const masterEdition = await getMasterEdition(mintKey.publicKey);
    console.log("Metadata address: ", metadataAddress.toBase58());
    console.log("MasterEdition: ", masterEdition.toBase58());
    console.log("TOKEN_PROGRAM_ID",TOKEN_METADATA_PROGRAM_ID.toBase58());
    console.log("system", SystemProgram.programId.toBase58());
    console.log("rent",anchor.web3.SYSVAR_RENT_PUBKEY.toBase58());
  
    const tx = await program.rpc.setcollectionduringmint(
      {
        accounts: {
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          metadata: metadataAddress,
          collectionAuthority: program.provider.wallet.payer.publicKey,
          payer: program.provider.wallet.payer.publicKey,
          updateAuthority : program.provider.wallet.payer.publicKey,
          collectionMint: mintKey.publicKey,
          collectionMetadata : "MHuiXt7CvHxT6rGo9qjwrxGt7hA6TeEFkVnzzunMQTT",
          collectionMasterEdition : masterEdition,
          collectionAuthorityRecord: anchor.web3.Keypair.generate().publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        },
        signers: [program.provider.wallet.payer]
      }
    );
    console.log("Your transaction signature", tx);
  });
});

import * as anchor from "@project-serum/anchor";
// ** Comment this to use solpg imported IDL **
import { Workspace } from "../target/types/workspace";
import { publicKey } from "@project-serum/anchor/dist/cjs/utils";
import { Program } from "@project-serum/anchor";

describe("workspace", () => {
  const testNftTitle = "x";
  const testNftSymbol = "x";
  const testNftUri = "x";

  const provider = anchor.AnchorProvider.env()
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  
  const program = anchor.workspace.Workspace as anchor.Program<Workspace>;
  
  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );
  let to = new anchor.web3.PublicKey(
    "GHCUftQjt661rUJgdymbJpGfsXeg3nzYDBHHDw1vcjNe"
  );
  it("Mint!", async () => {

    // Derive the mint address and the associated token account address
    const toKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    const tokenAddress = await anchor.utils.token.associatedAddress({
      mint: mintKeypair.publicKey,
      owner: wallet.publicKey
    });
    console.log(`New token: ${mintKeypair.publicKey}`);

    // Derive the metadata and master edition addresses

    const metadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];
    console.log("Metadata initialized");
    const masterEditionAddress = (await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
        Buffer.from("edition"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    ))[0];
    console.log("Master edition metadata initialized");

    // Transact with the "mint" function in our on-chain program
    const sol_from = await provider.wallet
    const sol_to = await anchor.web3.Keypair.generate()

    await program.methods.mint(
      testNftTitle, testNftSymbol, testNftUri
    )
    .accounts({
      masterEdition: masterEditionAddress,
      metadata: metadataAddress,
      mint: mintKeypair.publicKey,
      tokenAccount: tokenAddress,
      mintAuthority: wallet.publicKey,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      to:  toKeypair.publicKey,
      from: sol_from.publicKey,
    })
    .signers([mintKeypair])
    .rpc();

    await program.methods.update(
      testNftTitle, testNftSymbol, testNftUri
    )
    .accounts({
      masterEdition: masterEditionAddress,
      metadata: metadataAddress,
      mint: mintKeypair.publicKey,
      tokenAccount: tokenAddress,
      mintAuthority: wallet.publicKey,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      to:  sol_from.publicKey,
      from: sol_from.publicKey,
    })
    .signers([mintKeypair])
    .rpc();
  });
});
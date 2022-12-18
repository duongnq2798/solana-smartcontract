import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { createMint } from '@solana/spl-token';
import { BN } from "bn.js";
import { Dejavu } from "../target/types/dejavu";

describe("dejavu", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);
  const program = anchor.workspace.Dejavu as Program<Dejavu>;

  describe("#initialize", async () => {
    it("Is initialized!", async () => {
      const mintPayerKeystore = anchor.web3.Keypair.generate();
      const timestamp = new Date().getTime();
  
      // airdrop some sols to the mint payer
      const airdropSignature = await provider.connection.requestAirdrop(
        mintPayerKeystore.publicKey,
        2 * anchor.web3.LAMPORTS_PER_SOL,
      );
  
      await provider.connection.confirmTransaction(airdropSignature);
  
      // mint account
      const USDCMintAccount = await createMint(
        provider.connection,
        mintPayerKeystore,
        provider.wallet.publicKey,
        null,
        9
      );
      
      // room account
      const [roomAccount] = await anchor.web3.PublicKey.findProgramAddress(
        [provider.wallet.publicKey.toBuffer(), Buffer.from(`room-${timestamp}`)],
        program.programId
      );
  
      // vault account
      const [vaultAccount] = await anchor.web3.PublicKey.findProgramAddress(
        [roomAccount.toBuffer(), Buffer.from("vault")],
        program.programId
      );

      // players account
      const [playersAccount] = await anchor.web3.PublicKey.findProgramAddress(
        [roomAccount.toBuffer(), Buffer.from("players")],
        program.programId
      );
  
      await program
        .methods
        .initialize(new BN(timestamp), 10)
        .accounts({
          room: roomAccount,
          user: provider.wallet.publicKey,
          mint: USDCMintAccount,
          vaultAccount: vaultAccount,
          players: playersAccount
        })
        .rpc();

        // console.log(await (program.account.players.fetch(playersAccount)));
    });
  });
});

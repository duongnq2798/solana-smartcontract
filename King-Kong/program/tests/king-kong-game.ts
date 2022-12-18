import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { KingKongGame } from "../target/types/king_kong_game";

describe("king-kong-game", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.KingKongGame as Program<KingKongGame>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});

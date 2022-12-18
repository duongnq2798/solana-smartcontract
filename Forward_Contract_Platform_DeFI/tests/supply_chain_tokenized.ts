import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SupplyChainTokenized } from "../target/types/supply_chain_tokenized";




describe("supply_chain_tokenized", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SupplyChainTokenized as Program<SupplyChainTokenized>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});

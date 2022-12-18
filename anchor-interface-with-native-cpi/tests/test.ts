import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Master } from "../target/types/master";
import { Plugin } from "../target/types/plugin";

describe("anchor-interface-test", () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.Master as Program<Master>;
  const programPlugin = anchor.workspace.Plugin as Program<Plugin>;

  it("execute plugin!", async () => {
    // Add your test here.

    const pluginState = anchor.web3.Keypair.generate();
    console.log("master: " + program.programId);
    console.log("plugin: " + programPlugin.programId);
    console.log("pluginState: " + pluginState.publicKey);
    console.log("");

    console.log("plugin init...");
    const tx1 = await programPlugin.methods
      .initialize()
      .accounts({
        pluginState: pluginState.publicKey,
        owner: provider.wallet.publicKey,
        payer: provider.wallet.publicKey,
      })
      .signers([pluginState])
      .rpc();
    console.log("tx: ", tx1);

    console.log("master invoke...");
    const tx2 = await program.methods
      .executePlugin(new anchor.BN(1))
      .accounts({
        pluginProgram: programPlugin.programId,
        pluginState: pluginState.publicKey,
      })
      .rpc();
    console.log("tx: ", tx2);

    console.log("update plugin state...");
    const tx3 = await programPlugin.methods
      .update(new anchor.BN(10))
      .accounts({
        pluginState: pluginState.publicKey,
        owner: provider.wallet.publicKey,
      })
      .rpc();
    console.log("tx: ", tx3);

    console.log("master invoke...");
    try {
      const tx4 = await program.methods
        .executePlugin(new anchor.BN(2))
        .accounts({
          pluginProgram: programPlugin.programId,
          pluginState: pluginState.publicKey,
        })
        .rpc();
      console.log("tx: ", tx4);
    } catch (err) {
      console.error(err);
    }
  });
});

const anchor = require("@project-serum/anchor");
const { expect } = require("chai");
const { SystemProgram } = anchor.web3;

describe("nft-gift-portal", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  it("Is initialized!", async () => {
    // Add your test here.
    const program = anchor.workspace.NftGiftPortal;

    const baseAccount = anchor.web3.Keypair.generate();

    // Call start_stuff_off, pass it the params it needs!
    let tx = await program.rpc.initialize({
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [baseAccount],
    });

    console.log("📝 Your transaction signature", tx);

    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('👀 GIF Count', account.totalGifs.toString())

    expect(account.totalGifs.toString()).to.equal('0')

    // Call add_gif!
    await program.rpc.addGif("insert_a_giphy_link_here", {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    });

    // Get the account again to see what changed.
    account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    console.log('👀 GIF Count', account.totalGifs.toString())


    expect(account.totalGifs.toString()).to.equal('1')
    console.log('👀 GIF List', account.gifList)
  });
});

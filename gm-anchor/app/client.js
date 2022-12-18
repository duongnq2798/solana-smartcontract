const anchor = require("@project-serum/anchor");
const provider = anchor.AnchorProvider.env()

async function main() {
// Read the generated IDL.
const idl = JSON.parse(
    require("fs").readFileSync("./target/idl/gm_anchor.json", "utf8")
  );
  
  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey("DZatW6VrcgWvZuetgXuj6Z5LTpqmxybTA61zuYC5AQ3R");
 
  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);

  // generate new account address for us
  const gmAccount = anchor.web3.Keypair.generate();
  const name = "anchor_test";

  // Execute the RPC.
  let tx = await program.rpc.execute(name, {
      accounts: {
          gmAccount: gmAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId
      },
      options: { commitment: "confirmed"},
      signers: [gmAccount]
  });

  const storeName = await program.account.greetingAccount.fetch(gmAccount.publicKey)
  console.log(storeName.name);

}

main().then(() => console.log("done"));
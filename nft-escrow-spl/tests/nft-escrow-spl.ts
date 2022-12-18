import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { NftEscrowSpl } from "../target/types/nft_escrow_spl";

const assert = require("assert");
const spl = require("@solana/spl-token")

describe("nft-escrow-spl", () => {
  const provider = anchor.AnchorProvider.env();

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.NftEscrowSpl as Program<NftEscrowSpl>;

  let buyer = anchor.web3.Keypair.generate();
  let seller = anchor.web3.Keypair.generate();

  let buyerUsdcTokenAccount, buyerNftTokenAccount;
  let sellerUsdcTokenAccount, sellerNftTokenAccount; 
  let nftTokenMint, usdcTokenMint;

  const sellingPrice = 500000000;

  it("should fund the buyer and seller accounts", async () => {
    // Add your test here.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(buyer.publicKey, 10000000000), "confirmed"
    );

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(seller.publicKey, 10000000000), "confirmed"
    );

    let buyerUserBalance = await provider.connection.getBalance(buyer.publicKey);
    let sellerUserBalance = await provider.connection.getBalance(seller.publicKey)
    console.log(`Buyer balance is ${buyerUserBalance}`)
    console.log(`Seller balance is ${sellerUserBalance}`)
    assert.equal(10000000000, buyerUserBalance);
    assert.equal(10000000000, sellerUserBalance);
  });
  it("should create an NFT mint token and mint tokens to the owner", async function(){
    nftTokenMint = await spl.createMint(provider.connection, seller, seller.publicKey, seller.publicKey, 0);
    buyerNftTokenAccount = await spl.createAccount(provider.connection, buyer, nftTokenMint, buyer.publicKey);
    sellerNftTokenAccount = await spl.createAccount(provider.connection, seller, nftTokenMint, seller.publicKey);
    await spl.mintTo(provider.connection, seller, nftTokenMint, sellerNftTokenAccount, seller, 1);
    const sellerTokenBalance = await spl.getAccount(
      provider.connection,
      sellerNftTokenAccount 
    );
    // console.log(sellerTokenBalance)
    assert.equal(sellerTokenBalance.amount, 1);
  })
  it("should create a USDC mint token and mint tokens to the buyer", async function(){
    usdcTokenMint = await spl.createMint(provider.connection, buyer, buyer.publicKey, buyer.publicKey, 8);
    buyerUsdcTokenAccount = await spl.createAccount(provider.connection, buyer, usdcTokenMint, buyer.publicKey);
    await spl.mintTo(provider.connection, buyer, usdcTokenMint, buyerUsdcTokenAccount, buyer, 45000);
    const buyerUsdcTokenBalance = await spl.getAccount(
      provider.connection,
      buyerUsdcTokenAccount 
    );
    assert.equal(buyerUsdcTokenBalance.amount, 45000);
  })
  it("should initialize the PDA", async function(){
    const [escrowAccountPDA, escrowAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("owner"), seller.publicKey.toBuffer(), nftTokenMint.toBuffer()], program.programId
    )
    console.log(`Escrow Account PDA is ${escrowAccountPDA}`)
    console.log(`Escrow Account Bump is ${escrowAccountBump}`)

    const [escrowTokenAccountPDA, escrowTokenAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("token"), seller.publicKey.toBuffer(), nftTokenMint.toBuffer()], program.programId
    )
    console.log(`Escrow Token Account PDA is ${escrowTokenAccountPDA}`)
    console.log(`Escrow Token Account Bump is ${escrowTokenAccountBump}`)

    const tx = await program.methods.initialize().accounts({
      owner: seller.publicKey,
      escrowAccount: escrowAccountPDA,
      nftMint: nftTokenMint,      
      escrowTokenAccount: escrowTokenAccountPDA,
      currencyToken: usdcTokenMint,
      tokenProgram: spl.TOKEN_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY     
    }).signers([seller]).rpc

    const accountState = await program.account.holderAccount
  })
});

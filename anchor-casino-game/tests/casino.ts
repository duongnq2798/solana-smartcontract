import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Casino } from "../target/types/casino";
import { 
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL, 
} from '@solana/web3.js';
import { expect } from "chai";

const CASINO_HOURSE_SEED_PREFIX = "casino_house";
const CASINO_PLAYER_SEED_PREFIX = "casino_player";


type HouseStatus = {
  none?: {};
  initialized?: {};
};

type HouseData = {
  authority: PublicKey;
  status: HouseStatus;
  playerCount: number;
  players: PublicKey[];
  rand: number,
};

type PlayerData = {
  key: PublicKey,
  house: PublicKey,
};

describe("Casino", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.Casino as Program<Casino>;

  it("Build a house",async () => {
    const authority = anchor.web3.Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        authority.publicKey, 10 * LAMPORTS_PER_SOL
      ), 
      "confirmed"
    );

    const [housePda] = await PublicKey.findProgramAddress(
      [
        Buffer.from(CASINO_HOURSE_SEED_PREFIX),
        authority.publicKey.toBytes()
      ], 
      program.programId
    );

    await program.rpc.buildHouse({
      accounts: {
        authority: authority.publicKey,
        house: housePda,
        systemProgram: SystemProgram.programId
      },
      signers: [authority]
    });

    const houseData: HouseData = await program.account.house.fetchNullable(housePda);
    
    expect(houseData.authority.toString()).to.equal(authority.publicKey.toString());
    expect(houseData.playerCount).to.equal(0);
    expect(houseData.players.length).to.equal(0);
    expect(houseData.status.initialized !== null).to.be.true;
    console.log(houseData.rand);
  });

  it("Add Player",async () => {
    const authority = anchor.web3.Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        authority.publicKey, 10 * LAMPORTS_PER_SOL
      ), 
      "confirmed"
    );

    const [housePda] = await PublicKey.findProgramAddress(
      [
        Buffer.from(CASINO_HOURSE_SEED_PREFIX),
        authority.publicKey.toBytes()
      ], 
      program.programId
    );

    await program.rpc.buildHouse({
      accounts: {
        authority: authority.publicKey,
        house: housePda,
        systemProgram: SystemProgram.programId
      },
      signers: [authority]
    });

    // add player
    const playerKeypair = anchor.web3.Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        playerKeypair.publicKey, 10 * LAMPORTS_PER_SOL
      ), 
      "confirmed"
    );

    const [playerPda] = await PublicKey.findProgramAddress(
      [
        Buffer.from(CASINO_PLAYER_SEED_PREFIX),
        housePda.toBytes(),
        playerKeypair.publicKey.toBytes(),
      ], 
      program.programId
    );

    await program.rpc.addPlayer({
      accounts: {
        authority: playerKeypair.publicKey,
        house: housePda,
        player: playerPda,
        systemProgram: SystemProgram.programId
      },
      signers: [playerKeypair]
    });

    const houseData: HouseData = await program.account.house.fetchNullable(housePda);
    expect(houseData.playerCount).to.equal(1);
    expect(houseData.players.length).to.equal(1);
    expect(houseData.players[0].toString()).to.equal(playerPda.toString());

    const playerData: PlayerData = await program.account.player.fetchNullable(playerPda);
    expect(playerData.house.toString()).to.equal(housePda.toString());
    expect(playerData.key.toString()).to.equal(playerKeypair.publicKey.toString());
  })
});

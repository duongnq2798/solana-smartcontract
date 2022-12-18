import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
//@ts-ignore
import { Casier } from "../target/types/casier";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  createMint,
  mintTo,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
  closeAccount,
} from "@solana/spl-token";
import { assert, expect } from "chai";

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());

const program = anchor.workspace.Casier as Program<Casier>;
const provider = program.provider as anchor.AnchorProvider;
const payer = (provider.wallet as anchor.Wallet).payer;
const providerPk = (program.provider as anchor.AnchorProvider).wallet.publicKey;

const mints = [];
const users = [...Array(5).keys()].map(() => Keypair.generate());

let lockerPDAs;
let configPDA;
// 2D array: users index, token accounts by mint index
const tokenAccounts: PublicKey[][] = [];
// 2D array: users, token account bumps by mint index
const tokenAccountBumps: number[][] = [];
// 2D array: user index, token accounts by mint index
const vaultTAs: PublicKey[][] = [];
// 2D array: user index, token account bumps by mint index
const vaultTABumps: number[][] = [];

describe("casier", () => {
  it("Prepare", async () => {
    // compute config PDA
    [configPDA] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode("config")],
      program.programId
    );

    // airdrops sols
    await Promise.all(
      users.map((user) =>
        provider.connection.requestAirdrop(user.publicKey, 100 * 1e9)
      )
    );

    // create mints
    await Promise.all(
      [...Array(5).keys()]
        .map(() => Keypair.generate())
        .map((mint) => {
          mints.push(mint.publicKey);
          return createMint(
            provider.connection,
            payer,
            providerPk,
            providerPk,
            0,
            mint
          );
        })
    );

    // initialize user token accounts
    await Promise.all(
      users.slice(0, 1).map((user, index) => {
        tokenAccounts.push([]);
        tokenAccountBumps.push([]);
        return Promise.all(
          mints.slice(0, 1).map(async (mint) => {
            const [address, bump] = await PublicKey.findProgramAddress(
              [
                user.publicKey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
              ],
              ASSOCIATED_TOKEN_PROGRAM_ID
            );
            tokenAccounts[index].push(address);
            tokenAccountBumps[index].push(bump);
            return await createAssociatedTokenAccount(
              provider.connection,
              payer,
              mint,
              user.publicKey
            );
          })
        );
      })
    );

    // mint tokens
    await Promise.all(
      mints
        .slice(0, 1)
        .flatMap((mint, mintIndex) =>
          users
            .slice(0, 1)
            .map((user, userIndex) =>
              mintTo(
                provider.connection,
                payer,
                mint,
                tokenAccounts[userIndex][mintIndex],
                payer.publicKey,
                100
              )
            )
        )
    );

    // init user lockers
    lockerPDAs = await Promise.all(
      users.map(async (u) => {
        const pa = await PublicKey.findProgramAddress(
          [u.publicKey.toBytes()],
          program.programId
        );
        return pa[0];
      })
    );

    // initialize vault token accounts
    await Promise.all(
      users.map((user, index) =>
        mints.map(async (mint) => {
          const [ta, bump] = await PublicKey.findProgramAddress(
            [mint.toBuffer(), user.publicKey.toBuffer()],
            program.programId
          );
          if (vaultTAs[index]) {
            vaultTAs[index].push(ta);
            vaultTABumps[index].push(bump);
          } else {
            vaultTAs[index] = [ta];
            vaultTABumps[index] = [bump];
          }
        })
      )
    );
  });

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
  });

  it("Init config", async () => {
    // Add your test here.

    const tx = await program.methods
      .initConfig()
      .accounts({
        config: configPDA,
        feePayer: providerPk,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();
  });

  it("Init locker", async () => {
    const space = new anchor.BN(500);
    const userIndex = 0;
    const txs = await Promise.all(
      users.map((user, userIndex) =>
        program.methods
          .initLocker(space)
          .accounts({
            locker: lockerPDAs[userIndex],
            owner: user.publicKey,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .signers([user])
          .rpc()
      )
    );

    const lockerAccount = await program.account.locker.fetch(
      lockerPDAs[userIndex]
    );
    assert.strictEqual(lockerAccount.space.toString(), space.toString());
    assert.strictEqual(
      lockerAccount.owner.toString(),
      users[0].publicKey.toString()
    );
  });

  // user 0, mint 0, amount 2
  it("Deposit to close vault TA: u: 0, m: 0, a: 100", async () => {
    const userIndex = 0;
    const mintIndex = 0;
    const deposit_amount = 100;

    const { beforeAmount, finalAmount } = await getCheckAmounts(
      "deposit",
      userIndex,
      mintIndex,
      deposit_amount
    );

    const user = users[userIndex];
    const mint = mints[mintIndex];
    const userTa = tokenAccounts[userIndex][mintIndex];
    const vaultTa = vaultTAs[userIndex][mintIndex];
    const vaultBump = vaultTABumps[userIndex][mintIndex];
    const locker = lockerPDAs[userIndex];

    const tx = await program.methods
      .deposit(vaultBump, deposit_amount, beforeAmount)
      .accounts({
        config: configPDA,
        locker,
        mint: mint,
        owner: user.publicKey,
        admin: providerPk,
        userTa,
        vaultTa,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([user, payer])
      .rpc();

    await afterChecks(mintIndex, vaultTa, locker, finalAmount, mint);
  });

  // user 0, mint 0, amount 1
  it("Withdraw: u: 0, m: 0, a: 1", async () => {
    const userIndex = 0;
    const mintIndex = 0;
    const withdrawAmount = 1;
    const withTransfer = true;

    const { beforeAmount, finalAmount } = await getCheckAmounts(
      "withdraw",
      userIndex,
      mintIndex,
      withdrawAmount,
      withTransfer
    );

    const user = users[userIndex];
    const mint = mints[mintIndex];
    const userTa = tokenAccounts[userIndex][mintIndex];
    const vaultBump = vaultTABumps[userIndex][mintIndex];
    const vaultTa = vaultTAs[userIndex][mintIndex];
    const locker = lockerPDAs[userIndex];

    const tx = await program.methods
      .withdraw(
        vaultBump,
        withdrawAmount,
        beforeAmount,
        finalAmount,
        withTransfer
      )
      .accounts({
        config: configPDA,
        locker,
        mint: mint,
        owner: user.publicKey,
        admin: providerPk,
        userTa,
        vaultTa,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([user, payer])
      .rpc();

    await afterChecks(mintIndex, vaultTa, locker, finalAmount, mint);
  });

  // user 0, mint 0, amount 2
  it("Deposit to open vault TA: u: 0, m: 0, a: 1", async () => {
    const userIndex = 0;
    const mintIndex = 0;
    const deposit_amount = 1;

    const { beforeAmount, finalAmount } = await getCheckAmounts(
      "deposit",
      userIndex,
      mintIndex,
      deposit_amount
    );

    const user = users[userIndex];
    const mint = mints[mintIndex];
    const userTa = tokenAccounts[userIndex][mintIndex];
    const vaultTa = vaultTAs[userIndex][mintIndex];
    const vaultBump = vaultTABumps[userIndex][mintIndex];
    const locker = lockerPDAs[userIndex];

    const tx = await program.methods
      .deposit(vaultBump, deposit_amount, beforeAmount)
      .accounts({
        config: configPDA,
        locker,
        mint: mint,
        owner: user.publicKey,
        admin: providerPk,
        userTa,
        vaultTa,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([user, payer])
      .rpc();

    await afterChecks(mintIndex, vaultTa, locker, finalAmount, mint);
  });

  it("Close token account: u: 0, m: 0", async () => {
    const userIndex = 0;
    const mintIndex = 0;

    const user = users[userIndex];
    const userTa = tokenAccounts[userIndex][mintIndex];
    await closeAccount(provider.connection, user, userTa, user.publicKey, user);
    const acc = await provider.connection.getParsedAccountInfo(userTa);
    assert.isNull(acc.value);
  });

  it("Withdraw to closed user TA: u: 0, m: 0, a: 1", async () => {
    const userIndex = 0;
    const mintIndex = 0;
    const withdrawAmount = 1;
    const withTransfer = true;

    const { beforeAmount, finalAmount } = await getCheckAmounts(
      "withdraw",
      userIndex,
      mintIndex,
      withdrawAmount,
      withTransfer
    );

    const user = users[userIndex];
    const mint = mints[mintIndex];
    const userTa = tokenAccounts[userIndex][mintIndex];
    const vaultBump = vaultTABumps[userIndex][mintIndex];
    const vaultTa = vaultTAs[userIndex][mintIndex];
    const locker = lockerPDAs[userIndex];

    const tx = await program.methods
      .withdraw(
        vaultBump,
        withdrawAmount,
        beforeAmount,
        finalAmount,
        withTransfer
      )
      .accounts({
        config: configPDA,
        locker,
        mint: mint,
        owner: user.publicKey,
        admin: providerPk,
        userTa,
        vaultTa,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([user, payer])
      .rpc();

    await afterChecks(mintIndex, vaultTa, locker, finalAmount, mint);
  });

  it("Withdraw & set a lower final amount to burn the tokens: u: 0, m: 0, a: 1", async () => {
    const userIndex = 0;
    const mintIndex = 0;
    const withdrawAmount = 0;
    const missingTokens = 3;
    const withTransfer = true;

    const { beforeAmount, finalAmount: tempFinalAmount } =
      await getCheckAmounts(
        "withdraw",
        userIndex,
        mintIndex,
        withdrawAmount,
        withTransfer
      );
    const finalAmount = tempFinalAmount - missingTokens;

    const user = users[userIndex];
    const mint = mints[mintIndex];
    const userTa = tokenAccounts[userIndex][mintIndex];
    const vaultBump = vaultTABumps[userIndex][mintIndex];
    const vaultTa = vaultTAs[userIndex][mintIndex];
    const locker = lockerPDAs[userIndex];

    const [burnTa, burn_bump] = await PublicKey.findProgramAddress(
      [mint.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .withdrawAndBurn(
        vaultBump,
        burn_bump,
        withdrawAmount,
        beforeAmount,
        finalAmount,
        withTransfer
      )
      .accounts({
        config: configPDA,
        locker,
        mint: mint,
        owner: user.publicKey,
        admin: providerPk,
        userTa,
        vaultTa,
        burnTa,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([user, payer])
      .rpc();

    const burnTokenAccount = await provider.connection.getParsedAccountInfo(
      burnTa
    );
    const vaultAccount = await provider.connection.getParsedAccountInfo(
      vaultTa
    );

    assert.strictEqual(
      missingTokens,
      burnTokenAccount.value.data.parsed.info.tokenAmount.uiAmount
    );
    assert.strictEqual(
      finalAmount,
      vaultAccount.value.data.parsed.info.tokenAmount.uiAmount
    );
    await afterChecks(mintIndex, vaultTa, locker, finalAmount, mint);
  });

  it("Withdraw all to close vault ta: u: 0, m: 0, a: 99", async () => {
    const userIndex = 0;
    const mintIndex = 0;
    const withTransfer = true;

    const { beforeAmount: withdrawAmount } = await getCheckAmounts(
      "withdraw",
      userIndex,
      mintIndex,
      0,
      withTransfer
    );

    const { beforeAmount, finalAmount } = await getCheckAmounts(
      "withdraw",
      userIndex,
      mintIndex,
      withdrawAmount,
      withTransfer
    );

    const user = users[userIndex];
    const mint = mints[mintIndex];
    const userTa = tokenAccounts[userIndex][mintIndex];
    const vaultBump = vaultTABumps[userIndex][mintIndex];
    const vaultTa = vaultTAs[userIndex][mintIndex];
    const locker = lockerPDAs[userIndex];

    const tx = await program.methods
      .withdraw(
        vaultBump,
        withdrawAmount,
        beforeAmount,
        finalAmount,
        withTransfer
      )
      .accounts({
        config: configPDA,
        locker,
        mint: mint,
        owner: user.publicKey,
        admin: providerPk,
        userTa,
        vaultTa,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([user, payer])
      .rpc();

    await afterChecks(mintIndex, vaultTa, locker, finalAmount, mint);
  });
});

async function getCheckAmounts(
  txType: "deposit" | "withdraw",
  userIndex: number,
  mintIndex: number,
  withdrawAmount: number,
  withTransfer: boolean = true
): Promise<{
  beforeAmount: number;
  finalAmount: number;
  lockerAccount: any;
  lockerMintIndex: number;
}> {
  const lockerAccount = await program.account.locker.fetch(
    lockerPDAs[userIndex]
  );
  const lockerMintIndex = lockerAccount.mints.findIndex(
    (v) => v.toString() === mints[mintIndex].toString()
  );
  let beforeAmount =
    lockerMintIndex !== -1 ? lockerAccount.amounts[lockerMintIndex] : 0;
  const sign = txType == "deposit" ? 1 : -1;
  let finalAmount = withTransfer
    ? beforeAmount + sign * withdrawAmount
    : beforeAmount;
  return { beforeAmount, finalAmount, lockerAccount, lockerMintIndex };
}

async function afterChecks(
  mintIndex,
  vaultTa,
  locker,
  finalAmount,
  mint
): Promise<void> {
  const vaultAccount = await provider.connection.getParsedAccountInfo(vaultTa);
  const lockerAccount = await program.account.locker.fetch(locker);
  const lockerMintIndex = lockerAccount.mints.findIndex(
    (v) => v.toString() === mints[mintIndex].toString()
  );

  if (finalAmount) {
    assert.strictEqual(lockerAccount.amounts[lockerMintIndex], finalAmount);
    assert.strictEqual(
      lockerAccount.mints[lockerMintIndex].toString(),
      mint.toString()
    );
    assert.strictEqual(
      (vaultAccount.value.data as any).parsed.info.tokenAmount.uiAmount,
      finalAmount
    );
  } else {
    assert.isNull(vaultAccount.value);
    assert.strictEqual(lockerMintIndex, -1);
  }
}

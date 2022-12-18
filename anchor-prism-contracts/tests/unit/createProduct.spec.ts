import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Payments } from "../../target/types/payments";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  Commitment,
  AccountInfo,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";
import { assert, expect } from "chai";
import {
  getProductPDA,
  getPaymentPDA,
  getTokenVaultPDA,
  cancelPurchaseInstruction,
  createProductInstruction,
  deliverProductInstruction,
  purchaseProductInstruction,
  refundPurchaseInstruction,
  generateOrderId,
  generateProductId,
} from "../../lib";
import {
  getSolanaEnv,
  getProductAccount,
  createTreasury,
  createUser,
  createCurrency,
  mintCurrencyTo,
  getSolanaAccountInfoFromPublicKey,
  deserializeBN,
  expectThrowsAsync,
} from "../utils";
import { Currency, User } from "../types";

const { provider, connection, program } = getSolanaEnv();
anchor.setProvider(provider);

describe("⚛️  Unit: createProductInstruction", () => {
  it("✨  Valid transaction, the instruction is the expected use and should successfully execute.", async () => {
    const productId: number = generateProductId();
    const [productPDA, productBump] = await getProductPDA(program, productId);
    const cancellable: boolean = true;
    const price: number = 1_000_000;

    const treasury: anchor.web3.Keypair = createTreasury();
    const currency: Currency = await createCurrency();
    const merchantUser: User = await createUser(currency);

    await createProductInstruction(
      program,
      treasury.publicKey,
      productId,
      price,
      cancellable,
      productPDA,
      productBump,
      currency.mint.publicKey,
      merchantUser.tokenAccount,
      merchantUser.keypair
    );

    const treasuryAccountInfo = await getSolanaAccountInfoFromPublicKey(
      treasury.publicKey
    );
    expect(treasuryAccountInfo.lamports).to.eql(100_000_000);

    const productAccount = await getProductAccount(productPDA);
    expect(productAccount.productId.toNumber()).to.eql(
      productId,
      "Mismatched ProductIds"
    );
    expect(productAccount.merchant.toString()).to.eql(
      merchantUser.keypair.publicKey.toString(),
      "Mismatched merchant publicKeys"
    );
    expect(productAccount.merchantReceiveTokenAccount.toString()).to.eql(
      merchantUser.tokenAccount.toString(),
      "Mismatched merchant token accounts"
    );
    expect(productAccount.mint.toString()).to.eql(
      currency.mint.publicKey.toString(),
      "Mismatched currency mint publicKeys"
    );
    expect(productAccount.price.toNumber()).to.eql(
      price,
      "Mismatched product prices"
    );
    expect(productAccount.deleted).to.eql(
      false,
      "Products should initialize to not deleted state."
    );
    expect(productAccount.cancellable).to.eql(
      cancellable,
      "Mismatched cancellables."
    );
    expect(productAccount.bump).to.eql(productBump, "Mismatched productBumps");
  });

  it("Invalid transaction, mismatched productPDA and productId. The PDA must be derived from the productId", async() => {
    const productId = generateProductId();
    const otherProductId = generateProductId();
    const [productPDA, productBump] = await getProductPDA(
      program,
      otherProductId
    ); // same product Id as previous test.
    const cancellable: boolean = true;
    const price: number = 1_000_000;

    const treasury: anchor.web3.Keypair = createTreasury();
    const currency: Currency = await createCurrency();
    const merchantUser: User = await createUser(currency);

    await expectThrowsAsync(
      async () =>
        await createProductInstruction(
          program,
          treasury.publicKey,
          productId,
          price,
          cancellable,
          productPDA,
          productBump,
          currency.mint.publicKey,
          merchantUser.tokenAccount,
          merchantUser.keypair
        ),
      null
    );
  })


});

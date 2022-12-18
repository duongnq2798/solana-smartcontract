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
  expectThrowsAsync,
  getSolanaAccountInfoFromPublicKey,
  deserializeBN,
} from "../utils";
import { Currency, User } from "../types";

const { provider, connection, program } = getSolanaEnv();
anchor.setProvider(provider);

describe("🐉  E2E: createProduct", () => {
  it("Valid transaction, the merchant should be able to create many products", async () => {
    const firstProductId: number = generateProductId();
    const secondProductId: number = generateProductId();
    const thirdProductId: number = generateProductId();

    const [firstProductPDA, firstProductBump] = await getProductPDA(
      program,
      firstProductId
    );
    const [secondProductPDA, secondProductBump] = await getProductPDA(
      program,
      secondProductId
    );
    const [thirdProductPDA, thirdProductBump] = await getProductPDA(
      program,
      thirdProductId
    );

    const cancellable: boolean = true;
    const price: number = 1_000_000;

    const treasury: anchor.web3.Keypair = createTreasury();
    const currency: Currency = await createCurrency();
    const merchantUser: User = await createUser(currency);

    await createProductInstruction(
      program,
      treasury.publicKey,
      firstProductId,
      price,
      cancellable,
      firstProductPDA,
      firstProductBump,
      currency.mint.publicKey,
      merchantUser.tokenAccount,
      merchantUser.keypair
    );

    await createProductInstruction(
      program,
      treasury.publicKey,
      secondProductId,
      price,
      cancellable,
      secondProductPDA,
      secondProductBump,
      currency.mint.publicKey,
      merchantUser.tokenAccount,
      merchantUser.keypair
    );

    await createProductInstruction(
      program,
      treasury.publicKey,
      thirdProductId,
      price,
      cancellable,
      thirdProductPDA,
      thirdProductBump,
      currency.mint.publicKey,
      merchantUser.tokenAccount,
      merchantUser.keypair
    );

    const firstProductAccount = await getProductAccount(firstProductPDA);
    expect(firstProductAccount).is.not.eql(
      null,
      "The first product account should not be null"
    );

    const secondProductAccount = await getProductAccount(secondProductPDA);
    expect(secondProductAccount).is.not.eql(
      null,
      "The second product account should not be null"
    );

    const thirdProductAccount = await getProductAccount(thirdProductPDA);
    expect(thirdProductAccount).is.not.eql(
      null,
      "The third product account should not be null"
    );
  });

  it("Invalid transaction, a merchant should be able to create many products with the same productId", async () => {
    const productId: number = generateProductId();

    const [productPDA, firstProductBump] = await getProductPDA(
      program,
      productId
    );

    const cancellable: boolean = true;
    const price: number = 1_000_000;

    const treasury: anchor.web3.Keypair = createTreasury();
    const currency: Currency = await createCurrency();
    const merchantUser: User = await createUser(currency);

    // Create another product with the same productId
    await createProductInstruction(
      program,
      treasury.publicKey,
      productId,
      price,
      cancellable,
      productPDA,
      firstProductBump,
      currency.mint.publicKey,
      merchantUser.tokenAccount,
      merchantUser.keypair
    ),

    // Create another product with the same productId
    await expectThrowsAsync(
      async () =>
        await createProductInstruction(
          program,
          treasury.publicKey,
          productId,
          price,
          cancellable,
          productPDA,
          firstProductBump,
          currency.mint.publicKey,
          merchantUser.tokenAccount,
          merchantUser.keypair
        ),
      null
    );
  });

  it("Invalid transaction, a merchant should be able to create another product with the same productId as another merchant.", async () => {
    const productId: number = generateProductId();

    const [productPDA, firstProductBump] = await getProductPDA(
      program,
      productId
    );

    const cancellable: boolean = true;
    const price: number = 1_000_000;

    const treasury: anchor.web3.Keypair = createTreasury();
    const currency: Currency = await createCurrency();
    const firstMerchantUser: User = await createUser(currency);
    const secondMerchantUser: User = await createUser(currency);

    // Create another product with the same productId with the first merchant.
    await createProductInstruction(
      program,
      treasury.publicKey,
      productId,
      price,
      cancellable,
      productPDA,
      firstProductBump,
      currency.mint.publicKey,
      firstMerchantUser.tokenAccount,
      firstMerchantUser.keypair
    ),

    // Create another product with the same productId with second merchant.
    await expectThrowsAsync(
      async () =>
        await createProductInstruction(
          program,
          treasury.publicKey,
          productId,
          price,
          cancellable,
          productPDA,
          firstProductBump,
          currency.mint.publicKey,
          secondMerchantUser.tokenAccount,
          secondMerchantUser.keypair
        ),
      null
    );
  });


});

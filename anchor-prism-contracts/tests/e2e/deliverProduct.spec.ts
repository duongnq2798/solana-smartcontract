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
  getPaymentAccount,
  createTreasury,
  createPayment,
  createUser,
  createCurrency,
  mintCurrencyTo,
  getSolanaAccountInfoFromPublicKey,
  getTokenAccountInfoFromCurrency,
  deserializeBN,
  expectThrowsAsync
} from "../utils";
import { Currency, User } from "../types";

const { provider, connection, program } = getSolanaEnv();
anchor.setProvider(provider);

describe("🐉  E2E: deliverProduct", () => {
  it("Invalid transaction, a customer cannot cancel an already delivered product.", async () => {
    // Merchant creates a product.
    const productId: number = generateProductId();
    const orderId: number = generateOrderId();
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

    // Customer creates a product escrow account and purchases product.
    const payment: anchor.web3.Keypair = createPayment();
    const [vaultAccountPDA, vaultAccountBump] = await getTokenVaultPDA(
      program,
      productId,
      orderId
    );
    const [vaultAuthorityPDA, _vaultAuthorityBump] = await getPaymentPDA(
      program
    );

    const customerUser: User = await createUser(currency);
    await mintCurrencyTo(
      currency,
      customerUser.tokenAccount,
      price // mint price tokens to customer.
    );
    await purchaseProductInstruction(
      program,
      orderId,
      productId,
      productPDA,
      price,
      vaultAccountPDA,
      vaultAccountBump,
      currency.mint,
      customerUser.keypair,
      customerUser.tokenAccount,
      merchantUser.keypair.publicKey,
      merchantUser.tokenAccount,
      payment
    );

    // Merchant delivers the product to the customers.
    await deliverProductInstruction(
      program,
      productId,
      productPDA,
      vaultAccountPDA,
      vaultAuthorityPDA,
      merchantUser.keypair,
      merchantUser.tokenAccount,
      customerUser.keypair.publicKey,
      payment.publicKey
    );

    // A customer should not be able to cancel an already delivered product.
    await expectThrowsAsync(
      async () =>
        await cancelPurchaseInstruction(
          program,
          productId,
          productPDA,
          vaultAccountPDA,
          vaultAuthorityPDA,
          customerUser.keypair,
          customerUser.tokenAccount,
          payment.publicKey
        ),
      null
    );
  });

  it("Invalid transaction, a merchant cannot deliver a product twice", async () => {
    // Merchant creates a product.
    const productId: number = generateProductId();
    const orderId: number = generateOrderId();
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

    // Customer creates a product escrow account and purchases product.
    const payment: anchor.web3.Keypair = createPayment();
    const [vaultAccountPDA, vaultAccountBump] = await getTokenVaultPDA(
      program,
      productId,
      orderId
    );
    const [vaultAuthorityPDA, _vaultAuthorityBump] = await getPaymentPDA(
      program
    );

    const customerUser: User = await createUser(currency);
    await mintCurrencyTo(
      currency,
      customerUser.tokenAccount,
      price // mint price tokens to customer.
    );
    await purchaseProductInstruction(
      program,
      orderId,
      productId,
      productPDA,
      price,
      vaultAccountPDA,
      vaultAccountBump,
      currency.mint,
      customerUser.keypair,
      customerUser.tokenAccount,
      merchantUser.keypair.publicKey,
      merchantUser.tokenAccount,
      payment
    );

    // Merchant delivers the product to the customers.
    await deliverProductInstruction(
      program,
      productId,
      productPDA,
      vaultAccountPDA,
      vaultAuthorityPDA,
      merchantUser.keypair,
      merchantUser.tokenAccount,
      customerUser.keypair.publicKey,
      payment.publicKey
    );

    // A customer should not be able to cancel an already delivered product.
    await expectThrowsAsync(
      async () =>
        await deliverProductInstruction(
          program,
          productId,
          productPDA,
          vaultAccountPDA,
          vaultAuthorityPDA,
          merchantUser.keypair,
          merchantUser.tokenAccount,
          customerUser.keypair.publicKey,
          payment.publicKey
        ),
      null
    );

  });


});

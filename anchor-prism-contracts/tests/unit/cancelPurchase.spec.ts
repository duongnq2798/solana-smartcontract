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
} from "../utils";
import { Currency, User } from "../types";

const { provider, connection, program } = getSolanaEnv();
anchor.setProvider(provider);

describe("⚛️  Unit: cancelPurchaseInstruction", () => {
  it("✨  Valid transaction, the instruction is the expected use and should successfully execute.", async () => {
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

    // Customer cancels the product it just purchased.
    await cancelPurchaseInstruction(
      program,
      productId,
      productPDA,
      vaultAccountPDA,
      vaultAuthorityPDA,
      customerUser.keypair,
      customerUser.tokenAccount,
      payment.publicKey
    );

    const merchantTokenAccount = await getTokenAccountInfoFromCurrency(
      currency,
      merchantUser.tokenAccount
    );
    expect(merchantTokenAccount.amount.toNumber()).to.eql(
      0,
      "The merchant has tokens they should not."
    );

    const customerTokenAccount = await getTokenAccountInfoFromCurrency(
      currency,
      customerUser.tokenAccount
    );
    expect(customerTokenAccount.amount.toNumber()).to.eql(
      price,
      "Funds were not returned to the customer."
    );

    const paymentAccount = await getPaymentAccount(
      payment.publicKey
    );
    expect(paymentAccount.delivered).to.eql(
      false,
      "Delivered should be to true"
    );
    expect(paymentAccount.refunded).to.eql(
      false,
      "Refunded should be false"
    );
    expect(paymentAccount.cancelled).to.eql(
      true,
      "Cancelled should be false"
    );
  });
});

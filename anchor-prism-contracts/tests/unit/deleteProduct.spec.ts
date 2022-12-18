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
  deleteProductInstruction,
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

describe("⚛️  Unit: deleteProductInstruction", () => {
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

    await deleteProductInstruction(
      program,
      productId,
      productPDA,
      merchantUser.keypair
    )

    const productAccount = await getProductAccount(productPDA);
    expect(productAccount.deleted).to.eql(
      true,
      "The product should be marked deleted."
    );
  });

  it("Invalid transaction, a product cannot be deleted twice.", async() => {
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

    await deleteProductInstruction(
      program,
      productId,
      productPDA,
      merchantUser.keypair
    )

    await expectThrowsAsync(
      async () =>
        await deleteProductInstruction(
          program,
          productId,
          productPDA,
          merchantUser.keypair
        ),
      null
    );
  })


});

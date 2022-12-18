import { PublicKey, Keypair, Signer } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Payments } from "../types/payments";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  getInfrastructurePDA,
  getProductPDA,
  getpaymentPDA,
  getSubscriptionPDA,
  getProductVaultPDA,
} from "../pdas";

export type CreateInfrastructurePayload = {
  name: string;
  description: string;
  selfCustody: boolean;
};

export type CreateProductPayload = {
  name: string;
  description: string;
  price: anchor.BN;
  inventory: anchor.BN;
};

export type CreateSubscriptionPayload = {
  name: string;
  description: string;
  period: anchor.BN;
  price: anchor.BN;
  maxSupply: anchor.BN;
};

export type UpdateInfrastructurePayload = {
  name: string;
  description: string;
  active: boolean;
};

export type UpdateProductPayload = {
  name: string;
  description: string;
  price: anchor.BN;
  inventory: anchor.BN;
  active: boolean;
};

export type UpdateSubscriptionPayload = {
  name: string;
  description: string;
  active: boolean;
  maxSupply: anchor.BN;
};

export const createInfrastructureInstruction = async (
  program: any,
  payload: CreateInfrastructurePayload,
  merchant: any
): Promise<string> => {
  const infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  const signature: string = await program.methods
    .createInfrastructure(payload)
    .accounts({
      infrastructure: infrastructurePDA,
      merchant: merchant.publicKey,
    })
    .rpc();
  return signature;
};

export const createProductInstruction = async (
  program: any,
  payload: CreateProductPayload,
  currency: PublicKey,
  merchantTokenAccount: PublicKey,
  merchant: any
): Promise<string> => {
  const infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  const productPDA: PublicKey = await getProductPDA(program, merchant);
  const signature: string = await program.methods
    .createProduct(payload)
    .accounts({
      infrastructure: infrastructurePDA,
      product: productPDA,
      currency: currency,
      merchantTokenAccount: merchantTokenAccount,
      merchant: merchant.publicKey,
    })
    .rpc();
  return signature;
};

export const createSubscriptionInstruction = async (
  program: any,
  payload: CreateSubscriptionPayload,
  currency: PublicKey,
  merchantTokenAccount: PublicKey,
  merchant: any
): Promise<string> => {
  const infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  const subscriptionPDA: PublicKey = await getSubscriptionPDA(
    program,
    merchant
  );
  const signature = await program.methods
    .createSubscription(payload)
    .accounts({
      infrastructure: infrastructurePDA,
      subscription: subscriptionPDA,
      currency: currency,
      merchantTokenAccount: merchantTokenAccount,
      merchant: merchant.publicKey,
    })
    .rpc();
  return signature;
};

export const updateInfrastructureInstruction = async (
  program: any,
  payload: UpdateInfrastructurePayload,
  merchant: any
): Promise<string> => {
  const infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  const signature: string = await program.methods
    .updateInfrastructure(payload)
    .accounts({
      infrastructure: infrastructurePDA,
      merchant: merchant.publicKey,
    })
    .rpc();
  return signature;
};

export const updateProductInstruction = async (
  program: any,
  payload: UpdateProductPayload,
  merchant: any
): Promise<string> => {
  const infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  const productPDA: PublicKey = await getProductPDA(program, merchant);
  const signature: string = await program.methods
    .updateProduct(payload)
    .accounts({
      infrastructure: infrastructurePDA,
      product: productPDA,
      merchant: merchant.publicKey,
    })
    .rpc();
  return signature;
};

export const updateSubscriptionInstruction = async (
  program: any,
  payload: UpdateSubscriptionPayload,
  merchant: any
): Promise<string> => {
  const infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  const subscriptionPDA: PublicKey = await getSubscriptionPDA(
    program,
    merchant
  );
  const signature: string = await program.methods
    .updateSubscription(payload)
    .accounts({
      infrastructure: infrastructurePDA,
      subscription: subscriptionPDA,
      merchant: merchant.publicKey,
    })
    .rpc();
  return signature;
};

export const purchaseProductInstruction = async (
  program: any,
  currency: PublicKey,
  merchantTokenAccount: PublicKey,
  merchant: any,
  customer: Keypair,
  customerTokenAccount: PublicKey
): Promise<string> => {
  const infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  const productPDA: PublicKey = await getProductPDA(program, merchant);
  const productVaultPDA = await getProductVaultPDA(program, merchant, customer);
  const paymentPDA = await getpaymentPDA(
    program,
    merchant,
    customer
  );
  console.log("infrastructurePDA", infrastructurePDA);
  console.log("productPDA", productPDA);
  console.log("customer", customer.publicKey);
  console.log("merchant", merchant.publicKey);
  console.log("currency", currency);
  console.log("customerTokenAccount", customerTokenAccount);
  console.log("merchantTokenAccount", merchantTokenAccount);
  console.log("paymentPDA", paymentPDA);
  console.log("vault", productVaultPDA);
  const signature: string = await program.methods
    .purchaseProduct()
    .accounts({
      infrastructure: infrastructurePDA,
      product: productPDA,
      customer: customer.publicKey,
      merchant: merchant.publicKey,
      currency: currency,
      customerTokenAccount: customerTokenAccount,
      merchantTokenAccount: merchantTokenAccount,
      payment: paymentPDA,
      vault: productVaultPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([customer])
    .rpc();
  return signature;
};

import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Payments } from "../types/payments";

async function getInfrastructurePDA(
  program: any,
  merchant: any
): Promise<PublicKey> {
  let [infrastructurePDA, _] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("infrastructure"),
      merchant.publicKey.toBuffer(),
    ],
    program.programId
  );
  return infrastructurePDA;
}

async function getProductPDA(program: any, merchant: any) {
  let infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  let [productPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("product"),
      infrastructurePDA.toBuffer(),
      merchant.publicKey.toBuffer(),
    ],
    program.programId
  );
  return productPDA;
}

async function getSubscriptionPDA(
  program: any,
  merchant: any
): Promise<PublicKey> {
  let infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  let [subscriptionPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("subscription"),
      infrastructurePDA.toBuffer(),
      merchant.publicKey.toBuffer(),
    ],
    program.programId
  );
  return subscriptionPDA;
}

async function getpaymentPDA(
  program: any,
  merchant: any,
  customer: any
): Promise<PublicKey> {
  let infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  let productPDA: PublicKey = await getProductPDA(program, merchant);
  let [paymentPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("payment"),
      infrastructurePDA.toBuffer(),
      productPDA.toBuffer(),
      merchant.publicKey.toBuffer(),
      customer.publicKey.toBuffer(),
    ],
    program.programId
  );
  return paymentPDA;
}

async function getProductVaultPDA(
  program: any,
  merchant: any,
  customer: any
): Promise<PublicKey> {
  let infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  let productPDA: PublicKey = await getProductPDA(program, merchant);
  let [productVaultPDA, _] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode("product_vault"),
      infrastructurePDA.toBuffer(),
      productPDA.toBuffer(),
      merchant.publicKey.toBuffer(),
      customer.publicKey.toBuffer(),
    ],
    program.programId
  );
  return productVaultPDA;
}

async function getSubscriptionVaultPDA(
  program: Program<Payments>,
  merchant: any
): Promise<PublicKey> {
  let infrastructurePDA: PublicKey = await getInfrastructurePDA(
    program,
    merchant
  );
  let subscriptionPDA: PublicKey = await getSubscriptionPDA(program, merchant);
  let [subscriptionVaultPDA, _] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode("subscription_vault"),
        infrastructurePDA.toBuffer(),
        subscriptionPDA.toBuffer(),
        merchant.publicKey.toBuffer(),
      ],
      program.programId
    );
  return subscriptionVaultPDA;
}

export {
  getInfrastructurePDA,
  getProductPDA,
  getSubscriptionPDA,
  getpaymentPDA,
  getProductVaultPDA,
  getSubscriptionVaultPDA,
};

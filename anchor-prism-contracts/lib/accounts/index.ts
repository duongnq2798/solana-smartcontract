import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Payments } from "./types/payments";

const getInfrastructureAccount = async (
  program: any,
  pda: PublicKey
): Promise<any> => {
  let infrastructureAccount = await program.account.infrastructure.fetch(pda);
  return infrastructureAccount;
};

const getProductAccount = async (
  program: any,
  pda: PublicKey
): Promise<any> => {
  let productAccount = await program.account.product.fetch(pda);
  return productAccount;
};

const getSubscriptionAccount = async (
  program: any,
  pda: PublicKey
): Promise<any> => {
  let subscriptionAccount = await program.account.subscription.fetch(pda);
  return subscriptionAccount;
};

const getpaymentAccount = async (
  program: any,
  pda: PublicKey
): Promise<any> => {
  let paymentAccount = await program.account.payment.fetch(pda);
  return paymentAccount;
};

const getProductVaultAccount = async (
  program: any,
  pda: PublicKey
): Promise<any> => {
  let productVaultAccount = await program.account.productVault.fetch(pda);
  return productVaultAccount;
};

const getSubscriptionVaultAccount = async (
  program: any,
  pda: PublicKey
): Promise<any> => {
  let subscriptionVaultAccount = await program.account.subscriptionVault.fetch(
    pda
  );
  return subscriptionVaultAccount;
};

export {
  getInfrastructureAccount,
  getProductAccount,
  getSubscriptionAccount,
  getpaymentAccount,
  getProductVaultAccount,
  getSubscriptionVaultAccount,
};

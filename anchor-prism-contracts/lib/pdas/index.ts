import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export const getPaymentPDA = async (
  program: any
  // productUuid: string,
): Promise<[PublicKey, number]> => {
  let [paymentPDA, paymentBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from(anchor.utils.bytes.utf8.encode("payment"))],
      program.programId
    );
  return [paymentPDA, paymentBump];
};

export const getProductPDA = async (
  program: any,
  productId: number
): Promise<[PublicKey, number]> => {
  let [productPDA, productBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("product")),
        Buffer.from(anchor.utils.bytes.utf8.encode(productId.toString())),
      ],
      program.programId
    );
  return [productPDA, productBump];
};

export const getTokenVaultPDA = async (
  program: any,
  productId: number,
  orderId: number
): Promise<[PublicKey, number]> => {
  let [tokenVaultPDA, tokenVaultBump] =
    await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("token-vault")),
        Buffer.from(productId.toString()),
        Buffer.from(orderId.toString()),
      ],
      program.programId
    );
  return [tokenVaultPDA, tokenVaultBump];
};


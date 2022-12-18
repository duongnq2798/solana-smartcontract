import { PublicKey, Keypair, Signer } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

export const cancelPurchaseInstruction = async (
  program: any,
  productId: number,
  productPDA: PublicKey,
  vaultAccountPDA: PublicKey,
  vaultAuthorityPDA: PublicKey,
  customerMainAccount: Keypair,
  customerTokenAccount: PublicKey,
  payment: PublicKey
): Promise<string> => {
  const signature: string = await program.rpc.cancelPurchase(
    new anchor.BN(productId),
    {
      accounts: {
        product: productPDA,
        customer: customerMainAccount.publicKey,
        customerDepositTokenAccount: customerTokenAccount,
        vaultAccount: vaultAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        payment: payment,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [customerMainAccount],
    }
  );
  return signature;
};

export const createProductInstruction = async (
  program: any,
  treasury: PublicKey,
  productId: number,
  price: number,
  cancellable: boolean,
  productPDA: PublicKey,
  productBump: number,
  mint: PublicKey,
  merchantReceiveTokenAccount: PublicKey,
  merchant: Keypair
): Promise<string> => {
  const signature: string = await program.methods
    .createProduct(
      new anchor.BN(productId),
      new anchor.BN(price),
      cancellable,
      productBump
    )
    .accounts({
      treasury: treasury,
      product: productPDA,
      mint: mint,
      merchantReceiveTokenAccount: merchantReceiveTokenAccount,
      merchant: merchant.publicKey,
    })
    .signers([merchant])
    .rpc();
  return signature;
};

export const deleteProductInstruction = async (
  program: any, 
  productId: number,
  productPDA: PublicKey,
  merchantMainAccount: Keypair
) => {
  const signature: string = await program.rpc.deleteProduct(
    new anchor.BN(productId),
    {
      accounts: {
        product: productPDA,
        merchant: merchantMainAccount.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [merchantMainAccount],
    }
  );
  return signature;
}

export const deliverProductInstruction = async (
  program: any,
  productId: number,
  productPDA: PublicKey,
  vaultAccountPDA: PublicKey,
  vaultAuthorityPDA: PublicKey,
  merchantMainAccount: Keypair,
  merchantTokenAccount: PublicKey,
  customer: PublicKey,
  payment: PublicKey
): Promise<string> => {
  const signature: string = await program.rpc.deliverProduct(
    new anchor.BN(productId),
    {
      accounts: {
        product: productPDA,
        merchant: merchantMainAccount.publicKey,
        merchantReceiveTokenAccount: merchantTokenAccount,
        customer: customer,
        payment: payment,
        vaultAccount: vaultAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [merchantMainAccount],
    }
  );
  return signature;
};

export const purchaseProductInstruction = async (
  program: any,
  orderId: number,
  productId: number,
  productPDA: PublicKey,
  price: number,
  vaultAccountPDA: PublicKey,
  vaultAccountBump: number,
  mint: Token,
  customerMainAccount: Keypair,
  customerTokenAccount: PublicKey,
  merchantMainAccount: PublicKey,
  merchantTokenAccount: PublicKey,
  payment: Keypair
): Promise<string> => {
  const signature: string = await program.rpc.purchaseProduct(
    new anchor.BN(orderId),
    new anchor.BN(productId),
    new anchor.BN(price),
    vaultAccountBump,
    {
      accounts: {
        product: productPDA,
        customer: customerMainAccount.publicKey,
        mint: mint.publicKey,
        vaultAccount: vaultAccountPDA,
        customerDepositTokenAccount: customerTokenAccount,
        merchant: merchantMainAccount,
        merchantReceiveTokenAccount: merchantTokenAccount,
        payment: payment.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: [
        await program.account.payment.createInstruction(payment),
      ],
      signers: [payment, customerMainAccount],
    }
  );
  return signature;
};

export const refundPurchaseInstruction = async (
  program: any,
  productId: number,
  productPDA: PublicKey,
  vaultAccountPDA: PublicKey,
  vaultAuthorityPDA: PublicKey,
  customerMainAccount: Keypair,
  customerTokenAccount: PublicKey,
  payment: Keypair
): Promise<string> => {
  const signature: string = await program.rpc.refundPurchase(
    new anchor.BN(productId),
    {
      accounts: {
        product: productPDA,
        customer: customerMainAccount.publicKey,
        customerDepositTokenAccount: customerTokenAccount,
        vaultAccount: vaultAccountPDA,
        vaultAuthority: vaultAuthorityPDA,
        payment: payment.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [customerMainAccount],
    }
  );
  return signature;
};


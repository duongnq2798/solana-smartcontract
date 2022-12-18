import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Account, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { expect } from 'chai';
import {
  createKeypair,
  createRandomMint,
  createTokenAccount,
  airdropSol,
  deserializeString,
  deserializeBN,
  // mintTokensTo,
  // TxWithSigners,
} from './tools/utils';
import { Payments } from '../target/types/payments';
import * as SDK from '../../packages/ts/index';

anchor.setProvider(anchor.AnchorProvider.env());
const provider: anchor.Provider = anchor.getProvider();
const connection: Connection = provider.connection;

describe('product', () => {
  const program: Program<Payments> = anchor.workspace.Payments;
  const programProvider = program.provider as anchor.AnchorProvider;
  const customer: Keypair = createKeypair();
  const merchant = programProvider.wallet;

  var currency: PublicKey;
  var mintKeypair: Keypair;
  var merchantTokenAccount: Account;
  var customerTokenAccount: Account;

  before(async () => {
    [mintKeypair, currency] = await createRandomMint(merchant, 9);
    merchantTokenAccount = await createTokenAccount(merchant, currency);
    customerTokenAccount = await createTokenAccount(customer, currency);
    // const signature = await mintTokensTo(
    //   customerTokenAccount.address,
    //   currency,
    //   mintKeypair,
    //   1000000000,
    // )

    // await connection.confirmTransaction(signature)
  });

  it('merchant successfully creates product', async () => {
    await airdropSol(connection, merchant.publicKey, 1);
    const payload: SDK.CreateProductPayload = {
      name: 'name',
      description: 'description',
      price: new anchor.BN(10),
      inventory: new anchor.BN(20),
    };
    const signature: string = await SDK.createProductInstruction(
      program,
      payload,
      currency,
      merchantTokenAccount.address,
      merchant
    );
    const productPDA: PublicKey = await SDK.getProductPDA(program, merchant);
    const productAccount = await SDK.getProductAccount(program, productPDA);
    expect(signature).to.not.eql(null);
    expect(deserializeString(productAccount.name)).to.eql('name');
    expect(deserializeString(productAccount.description)).to.eql('description');
    expect(productAccount.currency).to.eql(currency);
    expect(productAccount.merchantTokenAccount).to.eql(
      merchantTokenAccount.address
    );
    expect(deserializeBN(productAccount.price)).to.eql(new anchor.BN(10));
    expect(deserializeBN(productAccount.inventory)).to.eql(new anchor.BN(20));
  });
  it('merchant successfully updates product', async () => {
    await airdropSol(connection, merchant.publicKey, 1);
    const payload: SDK.UpdateProductPayload = {
      name: 'name2',
      description: 'description2',
      active: false,
      price: new anchor.BN(20),
      inventory: new anchor.BN(50),
    };
    const signature: string = await SDK.updateProductInstruction(
      program,
      payload,
      merchant
    );
    const productPDA: PublicKey = await SDK.getProductPDA(program, merchant);
    const productAccount = await SDK.getProductAccount(program, productPDA);
    expect(signature).to.not.eql(null);
    expect(deserializeString(productAccount.name)).to.eql('name2');
    expect(deserializeString(productAccount.description)).to.eql(
      'description2'
    );
    expect(productAccount.active).to.eql(false);
    expect(deserializeBN(productAccount.price)).to.eql(new anchor.BN(20));
    expect(deserializeBN(productAccount.inventory)).to.eql(new anchor.BN(50));
  });
});

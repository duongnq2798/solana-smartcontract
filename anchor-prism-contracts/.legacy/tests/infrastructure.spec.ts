import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import { airdropSol, deserializeString } from './tools/utils';
import { Payments } from '../target/types/payments';
import * as SDK from '../../packages/ts/index';

anchor.setProvider(anchor.AnchorProvider.env());
const provider: anchor.Provider = anchor.getProvider();
const connection: Connection = provider.connection;

describe('infrastructure', () => {
  const program: Program<Payments> = anchor.workspace.Payments;
  const programProvider = program.provider as anchor.AnchorProvider;

  it('merchant successfully creates infrastructure', async () => {
    const merchant = programProvider.wallet;
    await airdropSol(connection, merchant.publicKey, 1);
    const payload: SDK.CreateInfrastructurePayload = {
      name: 'name',
      description: 'description',
      selfCustody: true,
    };
    const signature: string = await SDK.createInfrastructureInstruction(
      program,
      payload,
      merchant
    );
    const infrastructurePDA: PublicKey = await SDK.getInfrastructurePDA(
      program,
      merchant
    );
    const infrastructureAccount = await SDK.getInfrastructureAccount(
      program,
      infrastructurePDA
    );
    expect(signature).to.not.eql(null);
    expect(deserializeString(infrastructureAccount.name)).to.eql('name');
    expect(deserializeString(infrastructureAccount.description)).to.eql(
      'description'
    );
    expect(infrastructureAccount.selfCustody).to.eql(true);
    expect(infrastructureAccount.active).to.eql(true);
    expect(infrastructureAccount.authority).to.eql(merchant.publicKey);
  });
  it('merchant successfully updates infrastructure', async () => {
    const merchant = programProvider.wallet;
    await airdropSol(connection, merchant.publicKey, 1);
    const payload: SDK.UpdateInfrastructurePayload = {
      name: 'name2',
      description: 'description2',
      active: false,
    };
    const signature: string = await SDK.updateInfrastructureInstruction(
      program,
      payload,
      merchant
    );
    const infrastructurePDA: PublicKey = await SDK.getInfrastructurePDA(
      program,
      merchant
    );
    const infrastructureAccount = await SDK.getInfrastructureAccount(
      program,
      infrastructurePDA
    );
    expect(signature).to.not.eql(null);
    expect(deserializeString(infrastructureAccount.name)).to.eql('name2');
    expect(deserializeString(infrastructureAccount.description)).to.eql(
      'description2'
    );
    expect(infrastructureAccount.active).to.eql(false);
  });
});

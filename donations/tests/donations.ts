import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Donations } from '../target/types/donations';
import { Keypair, SystemProgram, PublicKey } from '@solana/web3.js';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('donations', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Donations as Program<Donations>;

  const donationPlatformData = program.account.donationPlatform;
  const donationData = program.account.donation;
  const donatorsData = program.account.donators;

  const authority = provider.wallet.publicKey;
  const systemProgram = SystemProgram.programId;

  async function find_donation_platform() {
    return await PublicKey.findProgramAddress(
      [Buffer.from('donation_platform'), authority.toBuffer()],
      program.programId
    );
  }

  async function find_donation(donationPlatform: PublicKey, donationId: number) {
    return await PublicKey.findProgramAddress(
      [Buffer.from('donation'), donationPlatform.toBuffer(), Buffer.from(donationId.toString())],
      program.programId
    );
  }

  async function find_donators() {
    return await PublicKey.findProgramAddress([Buffer.from('donators'), authority.toBuffer()], program.programId);
  }

  async function get_lamports(to: PublicKey) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(to, 10 * anchor.web3.LAMPORTS_PER_SOL)
    );
  }

  async function get_balance(address: PublicKey) {
    return await provider.connection.getBalance(address);
  }

  const donatorKeypair = Keypair.generate();

  before(async () => {
    await get_lamports(donatorKeypair.publicKey);
  });

  it('Is initialized', async () => {
    const [donationPlatformPDA] = await find_donation_platform();
    const [donatorsPDA] = await find_donators();

    await program.methods
      .initialize()
      .accounts({
        authority,
        donationPlatform: donationPlatformPDA,
        donators: donatorsPDA,
        systemProgram,
      })
      .rpc();

    const donationPlatform = await donationPlatformData.fetch(donationPlatformPDA);

    expect(donationPlatform.authority).to.eql(authority, 'Authorities do not match');
    expect(donationPlatform.amount.toNumber()).to.eq(0, 'Amount of lamports is not zero');
  });

  it('Is allowed to donate lamports', async () => {
    const [donationPlatformPDA] = await find_donation_platform();
    const donationId = (await donationPlatformData.fetch(donationPlatformPDA)).counter.toNumber();
    const [donationPDA] = await find_donation(donationPlatformPDA, donationId);
    const [donatorsPDA] = await find_donators();

    const balanceBefore = await get_balance(donationPlatformPDA);
    const amount = 7000;

    await program.methods
      .donate(new anchor.BN(donationId), new anchor.BN(amount))
      .accounts({
        authority: donatorKeypair.publicKey,
        donation: donationPDA,
        donationPlatform: donationPlatformPDA,
        donators: donatorsPDA,
      })
      .signers([donatorKeypair])
      .rpc();

    const balanceAfter = await get_balance(donationPlatformPDA);

    expect(balanceAfter).to.eq(balanceBefore + amount, 'Incorrect platfrom balance');

    const dnData = await donationData.fetch(donationPDA);

    expect(dnData.authority).to.eql(donatorKeypair.publicKey, 'Unknown donator');
    expect(dnData.amount.toNumber()).to.eq(amount, 'Incorrect donator balance');
  });

  it('Is forbidden to donate zero lamports', async () => {
    const [donationPlatformPDA] = await find_donation_platform();
    const donationId = (await donationPlatformData.fetch(donationPlatformPDA)).counter.toNumber();
    const [donationPDA] = await find_donation(donationPlatformPDA, donationId);
    const [donatorsPDA] = await find_donators();

    expect(
      (async () =>
        await program.methods
          .donate(new anchor.BN(donationId), new anchor.BN(0))
          .accounts({
            authority: donatorKeypair.publicKey,
            donation: donationPDA,
            donationPlatform: donationPlatformPDA,
            donators: donatorsPDA,
          })
          .signers([donatorKeypair])
          .rpc())()
    ).to.be.rejectedWith(/Amount of lamports must be more than zero/);
  });

  it('Is forbidden to withdraw lamports for non-owner', async () => {
    const [donationPlatformPDA] = await find_donation_platform();

    expect(
      (async () =>
        await program.methods
          .withdraw()
          .accounts({
            authority: donatorKeypair.publicKey,
            donationPlatform: donationPlatformPDA,
          })
          .signers([donatorKeypair])
          .rpc())()
    ).to.be.rejectedWith(/A has one constraint was violated/);
  });

  it('Is allowed to withdraw lamports for owner', async () => {
    const [donationPlatformPDA] = await find_donation_platform();
    const amount = (await donationPlatformData.fetch(donationPlatformPDA)).amount.toNumber();

    const platformBalanceBefore = await get_balance(donationPlatformPDA);
    const ownerBalanceBefore = await get_balance(authority);

    await program.methods
      .withdraw()
      .accounts({
        authority,
        donationPlatform: donationPlatformPDA,
      })
      .rpc();

    const platformBalanceAfter = await get_balance(donationPlatformPDA);
    const ownerBalanceAfter = await get_balance(authority);

    expect(platformBalanceBefore - platformBalanceAfter).to.eq(amount, 'Incorrect platform balance');
    // expect(ownerBalanceAfter - ownerBalanceBefore).to.eq(amount, 'Incorrect owner balance');
  });

  it('Is forbidden to withdraw lamports if amount is zero', async () => {
    const [donationPlatformPDA] = await find_donation_platform();

    expect(
      (async () =>
        await program.methods
          .withdraw()
          .accounts({
            authority,
            donationPlatform: donationPlatformPDA,
          })
          .rpc())()
    ).to.be.rejectedWith(/There is no lamports to withdraw/);
  });

  it('Is allowed to get the list of donators', async () => {
    const [donationPlatformPDA] = await find_donation_platform();
    let donationId = (await donationPlatformData.fetch(donationPlatformPDA)).counter.toNumber();
    let [donationPDA] = await find_donation(donationPlatformPDA, donationId);
    const [donatorsPDA] = await find_donators();

    await program.methods
      .donate(new anchor.BN(donationId), new anchor.BN(1000))
      .accounts({
        authority: donatorKeypair.publicKey,
        donation: donationPDA,
        donationPlatform: donationPlatformPDA,
        donators: donatorsPDA,
      })
      .signers([donatorKeypair])
      .rpc();

    donationId = (await donationPlatformData.fetch(donationPlatformPDA)).counter.toNumber();
    [donationPDA] = await find_donation(donationPlatformPDA, donationId);
    let dntKeypair = Keypair.generate();
    await get_lamports(dntKeypair.publicKey);

    await program.methods
      .donate(new anchor.BN(donationId), new anchor.BN(1000))
      .accounts({
        authority: dntKeypair.publicKey,
        donation: donationPDA,
        donationPlatform: donationPlatformPDA,
        donators: donatorsPDA,
      })
      .signers([dntKeypair])
      .rpc();

    const donators = (await donatorsData.fetch(donatorsPDA)).donators;

    expect(donators.length).to.eq(2, 'Incorrect amount of donators');
    expect(donators[0].authority).to.eql(donatorKeypair.publicKey, 'Authorities do not match');
    expect(donators[0].amount.toNumber()).to.eq(8000, 'Donations do not match');
    expect(donators[1].authority).to.eql(dntKeypair.publicKey, 'Authorities do not match');
    expect(donators[1].amount.toNumber()).to.eq(1000, 'Donations do not match');
  });
});

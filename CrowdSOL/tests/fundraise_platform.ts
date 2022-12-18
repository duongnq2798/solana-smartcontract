import * as anchor from '@project-serum/anchor';
import { Program, web3 } from '@project-serum/anchor';
import { FundraisePlatform } from '../goal/types/fundraise_platform';
import chai, { assert, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const { SystemProgram } = anchor.web3;

describe('fundraise platform simulation tests', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace
    .FundraisePlatform as Program<FundraisePlatform>;

  const fundsInfo = program.account.funds;
  const contributorInfo = program.account.contributor;
  const topContributorsInfo = program.account.topTenContributors;

  const systemProgram = SystemProgram.programId;
  let owner = provider.wallet;
  let authority = owner.publicKey;

  async function search_fundraise_platform(authority: anchor.web3.PublicKey) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('fundraise_platform'), authority.toBuffer()],
      program.programId
    );
  }

  async function search_top_ten_contributors(authority: anchor.web3.PublicKey) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('top_ten_contributors'), authority.toBuffer()],
      program.programId
    );
  }

  async function getTop10(authority: anchor.web3.PublicKey) {
    let [topTenContributors] = await search_top_ten_contributors(authority);
    let data = await topContributorsInfo.fetch(topTenContributors);
    let top = data.contributors;
    top.sort((a, b) => b.amount - a.amount);
    return top;
  }

  async function search_contributor_acc(
    fundraisePlatform: anchor.web3.PublicKey,
    id: number
  ) {
    return await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from('fundraise_platform_contributor'),
        fundraisePlatform.toBuffer(),
        Buffer.from(id.toString()),
      ],
      program.programId
    );
  }

  async function get_lamports(to: anchor.web3.PublicKey) {
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        to,
        20 * anchor.web3.LAMPORTS_PER_SOL
      ),
      'success'
    );
  }

  async function get_balance(address: anchor.web3.PublicKey) {
    return await provider.connection.getBalance(address);
  }

  let contributorKeypair = anchor.web3.Keypair.generate();
  let contributor = contributorKeypair.publicKey;

  before(async () => {
    await get_lamports(contributor);
  });

  it('throw error if set goal is 0', async () => {
    let [fundraisePlatform] = await search_fundraise_platform(authority);

    expect(
      (async () =>
        await program.methods
          .initialize(new anchor.BN(0))
          .accounts({
            fundraisePlatform,
            authority,
            systemProgram,
          })
          .rpc())()
    ).to.be.rejectedWith(/Lamports amount must be greater than 0/);
  });

  it('initialization success!', async () => {
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    let [topTenContributors] = await search_top_ten_contributors(authority);

    const goal = 10000;
    await program.methods
      .initialize(new anchor.BN(goal))
      .accounts({
        fundraisePlatform,
        authority,
        topTenContributors,
      })
      .rpc();

    let funds = await fundsInfo.fetch(fundraisePlatform);
    assert.equal(
      funds.goal,
      goal,
      'goals are different! check const goal and the goal in the lib!'
    );
    assert.deepEqual(funds.authority, authority, 'different authorities!');
    assert.equal(funds.raised, 0, "raised amount ain't 0!");
  });

  it('User ID=0 can contribute x amount of lamports', async () => {
    let contributorID = 0;
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    let [topTenContributors] = await search_top_ten_contributors(authority);

    let [contributorAcc] = await search_contributor_acc(
      fundraisePlatform,
      contributorID
    );

    let lamportsBefore = await get_balance(fundraisePlatform);
    let change = 5000;

    await program.methods
      .contribute(new anchor.BN(contributorID), new anchor.BN(change))
      .accounts({
        contributor,
        contributorAcc,
        fundraisePlatform,
        topTenContributors,
      })
      .signers([contributorKeypair])
      .rpc();

    let lamportsAfter = await get_balance(fundraisePlatform);
    assert.equal(
      lamportsAfter,
      lamportsBefore + change,
      'Unexpected amount of lamports after contribute!'
    );

    let funds = await fundsInfo.fetch(fundraisePlatform);
    [contributorAcc] = await search_contributor_acc(
      fundraisePlatform,
      contributorID
    );
    let cntrbData = await contributorInfo.fetch(contributorAcc);

    assert.deepEqual(
      cntrbData.address,
      contributor,
      'The last contributor is not ours!'
    );
    assert.equal(cntrbData.amount, change, 'Amount of donations is different!');
  });

  it("User ID=0 can't contribute 0 lamports", async () => {
    let contributorID = 0;
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    let [contributorAcc] = await search_contributor_acc(
      fundraisePlatform,
      contributorID
    );

    expect(
      (async () =>
        await program.methods
          .contribute(new anchor.BN(contributorID), new anchor.BN(0))
          .accounts({
            contributor,
            contributorAcc,
            fundraisePlatform,
          })
          .signers([contributorKeypair])
          .rpc())()
    ).to.be.rejectedWith(
      /Amount of lamports must be greater than zero to contribute/
    );
  });

  it("unautherized user can't withdraw funds", async () => {
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    expect(
      (async () =>
        await program.methods
          .withdraw()
          .accounts({
            fundraisePlatform,
            authority: contributor,
          })
          .signers([contributorKeypair])
          .rpc())()
    ).to.be.rejectedWith(/oops! check if there was no constraints /);
  });

  it('Authorized user can withdraw funds', async () => {
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    let progBefore = await get_balance(fundraisePlatform);
    let authBefore = await get_balance(authority);
    let raised = (
      await program.account.funds.fetch(fundraisePlatform)
    ).raised.toNumber();

    await program.methods
      .withdraw()
      .accounts({
        fundraisePlatform,
        authority,
      })
      .rpc();

    let progAfter = await get_balance(fundraisePlatform);
    let authAfter = await get_balance(authority);

    assert.equal(
      progBefore - progAfter - raised,
      authAfter - authBefore,
      'oops! you are not autherized to withdraw!'
    );
  });

  it("Authorized user can't withdraw lamports if there was no donations", async () => {
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    expect(
      (async () =>
        await program.methods
          .withdraw()
          .accounts({
            fundraisePlatform,
            authority,
          })
          .rpc())()
    ).to.be.rejectedWith(
      /violation happened! check authorities and raised amount/
    );
  });

  it('ID increment works only 1 time for existing user', async () => {
    let newId = 1;
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    let [topTenContributors] = await search_top_ten_contributors(authority);
    let [contributorAcc] = await search_contributor_acc(
      fundraisePlatform,
      newId
    );

    await program.methods
      .contribute(new anchor.BN(newId), new anchor.BN(100))
      .accounts({
        contributor,
        contributorAcc,
        fundraisePlatform,
        topTenContributors,
      })
      .signers([contributorKeypair])
      .rpc();
    let cntrbData = await contributorInfo.fetch(contributorAcc);
    let ptData = await fundsInfo.fetch(fundraisePlatform);

    assert.equal(ptData.idCounter, newId + 1, 'counter has different IDs');
  });

  it('incrementing ID works 2 times for a new user', async () => {
    let newId = 2;
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    let [topTenContributors] = await search_top_ten_contributors(authority);
    let [contributorAcc] = await search_contributor_acc(
      fundraisePlatform,
      newId
    );

    let contributorKeypair = anchor.web3.Keypair.generate();
    let contributor = contributorKeypair.publicKey;
    await get_lamports(contributor);

    await program.methods
      .contribute(new anchor.BN(newId), new anchor.BN(77))
      .accounts({
        contributor,
        contributorAcc,
        fundraisePlatform,
        topTenContributors,
      })
      .signers([contributorKeypair])
      .rpc();

    let cntrbData = await contributorInfo.fetch(contributorAcc);
    let ptData = await fundsInfo.fetch(fundraisePlatform);

    assert.equal(ptData.idCounter, newId + 1, 'counter has different IDs!');
    assert.deepEqual(
      cntrbData.address,
      contributor,
      'oops, not matching addresses!'
    );
  });

  it('newId is greater than idcounter, must not work! ', async () => {
    let newId = 10;
    let [fundraisePlatform] = await search_fundraise_platform(authority);
    let [topTenContributors] = await search_top_ten_contributors(authority);
    let [contributorAcc] = await search_contributor_acc(
      fundraisePlatform,
      newId
    );

    expect(
      (async () =>
        await program.methods
          .contribute(new anchor.BN(newId), new anchor.BN(10))
          .accounts({
            contributor,
            contributorAcc,
            fundraisePlatform,
            topTenContributors,
          })
          .signers([contributorKeypair])
          .rpc())()
    ).to.be.rejectedWith(
      /Error Message: Passed ID is greater than current ID counter/
    );
  });

  it('contribute process works for new contributor and owner', async () => {
    let owner = web3.Keypair.generate();
    let contributor = web3.Keypair.generate();
    await Promise.all([
      get_lamports(owner.publicKey),
      get_lamports(contributor.publicKey),
    ]);

    let [fundraisePlatform] = await search_fundraise_platform(owner.publicKey);
    let [topTenContributors] = await search_top_ten_contributors(
      owner.publicKey
    );

    await program.methods
      .initialize(new anchor.BN(1000))
      .accounts({
        fundraisePlatform,
        authority: owner.publicKey,
        topTenContributors,
      })
      .signers([owner])
      .rpc();

    let [contributorAcc] = await search_contributor_acc(fundraisePlatform, 0);
    let lamportsBefore = await get_balance(fundraisePlatform);
    let change = 100;

    await program.methods
      .contribute(new anchor.BN(0), new anchor.BN(change))
      .accounts({
        contributor: contributor.publicKey,
        contributorAcc,
        fundraisePlatform,
        topTenContributors,
      })
      .signers([contributor])
      .rpc();

    let lamportsAfter = await get_balance(fundraisePlatform);
    assert.equal(
      lamportsAfter,
      lamportsBefore + change,
      'remaining amount of lamports are unexpected after contribute!'
    );
  });

  it('save top ten contributers in list', async () => {
    let top = await getTop10(authority);
    assert.equal(top[0].amount, 100, 'Top #1 contributor amount must be 100');
    assert.equal(top[1].amount, 77, 'Top #2 contributor amount must be 77');
  });
});

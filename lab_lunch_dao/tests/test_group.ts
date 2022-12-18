import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LabLunchDao } from "../target/types/lab_lunch_dao";
import assert from 'assert';
import { initGroup, createUser } from "./util";

describe("group", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.LabLunchDao as Program<LabLunchDao>;
  let owner: anchor.web3.Keypair;

  before(async ()=>{
    owner = await createUser(program);
  })

  it("inits", async () => {
    const group = await initGroup("groupName", program, owner);
    const groupAccount = await program.account.group.fetch(group);
    assert.equal(groupAccount.members[0].toBase58(), owner.publicKey.toBase58());
  });

  it("add members and update quorum", async () => {
    const group = await initGroup("newGroup",program, owner);

    const newMemberNum = 10;

    let newPublicKeys = [];
    for (let i = 0; i < newMemberNum; i++) {
      newPublicKeys.push(anchor.web3.Keypair.generate().publicKey);
    }

    await program.methods.addMembersToGroup(newPublicKeys)
      .accounts({ group, owner: owner.publicKey })
      .signers([owner]).rpc()

    let groupAccount = await program.account.group.fetch(group);
    assert.equal(groupAccount.members.length, newMemberNum + 1);
    assert.equal(groupAccount.seqNo.toNumber(), 1);

    await program.methods.updateQuorum(3)
      .accounts({ group, owner: owner.publicKey })
      .signers([owner]).rpc()

    groupAccount = await program.account.group.fetch(group);
    assert.equal(groupAccount.quorum, 3);

  });
});

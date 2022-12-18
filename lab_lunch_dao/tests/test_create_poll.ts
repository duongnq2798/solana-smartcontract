import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LabLunchDao } from "../target/types/lab_lunch_dao";
import { initGroup, createUser, newKeyPair, stringToBytes, findAddress, batchAddCater } from "./util";
import caters from "./caters.json";
import { BN } from "bn.js";
import { assert } from "chai";

describe("creates the two polls in discussion", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.LabLunchDao as Program<LabLunchDao>;

    let owner: anchor.web3.Keypair;
    let group: anchor.web3.PublicKey;
    let list: anchor.web3.PublicKey;
    let caterMenuList;
    let now;
    let due;
    let topic;

    before(async () => {
        owner = await createUser(program);
        group = await initGroup("testTopicGroup", program, owner);
        let findList = await findAddress([stringToBytes("cater_list"), group.toBuffer()])
        list = findList[0];

        await program.methods.initCaterList().accounts({
            list,
            group,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc();

        caterMenuList = await Promise.all(caters.map(c => batchAddCater(c, owner, list, group, program)))
    });

    beforeEach(async ()=> {
        now = new Date();        
        due = (new Date(now.getTime() + 1000 * 10).getTime() / 1000).toFixed(); // 10 seconds
        topic = newKeyPair();
    })

    it("creates a cater poll", async () => {
        await program.methods.createCaterTopic(new BN(due)).accounts({
            topic: topic.publicKey,
            owner: owner.publicKey,
            caterList: list,
            group,
        }).signers([owner, topic]).rpc();

        const topicAccount = await program.account.topic.fetch(topic.publicKey);
        assert.equal(topicAccount.options.length, 3);
    });

    it("creates a lunch poll", async () => {

        const cater = caterMenuList[0].cater;

        await program.methods.createLunchTopic(new BN(due), "the next 15 seconds").accounts({
            topic: topic.publicKey,
            owner: owner.publicKey,
            cater,
            group,
        }).signers([owner, topic]).rpc();

        const topicAccount = await program.account.topic.fetch(topic.publicKey);
        assert.equal(topicAccount.options.length, 4);
    });
})
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LabLunchDao } from "../target/types/lab_lunch_dao";
import assert from 'assert';
import { initGroup, createUser, newKeyPair, stringToBytes, findAddress, batchAddCater } from "./util";
import caters from "./caters.json";

describe("caters and menus", () => {
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.LabLunchDao as Program<LabLunchDao>;

    let owner: anchor.web3.Keypair;
    let group: anchor.web3.PublicKey;
    let groupCounter: number;
    let list: anchor.web3.PublicKey;
    let listBump: number;

    before(async()=>{
        owner = await createUser(program);
        groupCounter = 0;
    });

    beforeEach(async()=>{
        group = await initGroup(`groupName_${groupCounter}`, program, owner);
        groupCounter++;
        [list, listBump] = await findAddress([stringToBytes("cater_list"), group.toBuffer()]);
    });

    it("inits cater list, a cater and one menu", async () => {

        await program.methods.initCaterList().accounts({
            list,
            group,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc();

        let listAccount = await program.account.caterList.fetch(list);
        assert.equal(listAccount.bump, listBump);

        const caterName = "Delicious Palace";
        const caterUrl = "https://google.com";
        const [cater, _cBump] = await findAddress([stringToBytes("cater"), list.toBuffer(), stringToBytes(caterName)]);

        await program.methods.pushCater(caterName, caterUrl).accounts({
            caterList: list,
            cater,
            group,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc()

        const menuName = "carbonara"
        const [menu, _mBump] = await findAddress([stringToBytes("menu"), cater.toBuffer(), stringToBytes(menuName)]);

        await program.methods.pushMenu(menuName, 1.0, 15.0)
            .accounts({
                cater,
                menu,
                owner: owner.publicKey
            }).signers([owner]).rpc()

    });

    it("batch adds, one cater and it's menus", async () => {
        await program.methods.initCaterList().accounts({
            list,
            group,
            owner: owner.publicKey
        })
            .signers([owner])
            .rpc();

        const { cater, menu: _menu } = await batchAddCater(caters[0], owner, list, group, program);

        const caterAccount = await program.account.caterItem.fetch(cater);
        assert.equal(caterAccount.menus.length, 4);

        const menuAccounts = await program.account.menuItem.all([
            {
                memcmp: {
                    offset: 8,
                    bytes: cater.toBase58()
                }
            }
        ]);
        assert.equal(menuAccounts.length, 4);
    });
});

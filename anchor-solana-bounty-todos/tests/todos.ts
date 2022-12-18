import * as anchor from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Todos } from "../target/types/todos";
import { expect } from "chai"
import { BN } from "bn.js";

describe('todos', () => {
	const program = anchor.workspace.Todos as anchor.Program<Todos>;
	const provider = anchor.AnchorProvider.env() as anchor.AnchorProvider;
	anchor.setProvider(provider);

	const LPS = anchor.web3.LAMPORTS_PER_SOL;

	// { == Helper funcitons ==>
	const createUser = async () => {
		const userKeypair = Keypair.generate();

		// Airdrop SOL
		const airdropSignature = await provider.connection.requestAirdrop(userKeypair.publicKey, 10 * LPS);
		const latestBlockHash = await provider.connection.getLatestBlockhash();
		await provider.connection.confirmTransaction({
			blockhash: latestBlockHash.blockhash,
			lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
			signature: airdropSignature,
		});

		return userKeypair
	}

	const createUsers = (num: number) => {
		let promises = [];
		for (let i = 0; i < num; i++) promises.push(createUser());
		return Promise.all(promises);
	}

	const getAccountBalance = async (pubkey: PublicKey) => {
		let account = await provider.connection.getAccountInfo(pubkey);
		return account?.lamports ?? 0;
	}

	const expectBalance = (actual: number, expected: number, message: string, slack = 20000) => {
		expect(actual, message).within(expected - slack, expected + slack)
	}

	const createList = async (owner: any, name: string, capacity = 16) => {
		const [listAccount, bump] = await PublicKey.findProgramAddress([
			"todolist",
			owner.publicKey.toBuffer(),
			name.slice(0, 32)
		], program.programId);

		await program.methods.newList(name, capacity, bump)
			.accounts({ list: listAccount, user: owner.publicKey })
			.signers(owner instanceof (anchor.Wallet as any) ? [] : [owner])
			.rpc();

		let list = await program.account.todoList.fetch(listAccount);
		return { publicKey: listAccount, data: list };
	}

	const addItem = async ({ list, user, name, bounty }) => {
		const itemAccount = Keypair.generate();
		await program.methods.add(list.data.name, name, new BN(bounty))
			.accounts({
				list: list.publicKey,
				listOwner: list.data.listOwner,
				item: itemAccount.publicKey,
				user: user.publicKey,
				systemProgram: anchor.web3.SystemProgram.programId,
			})
			.signers([user, itemAccount])
			.rpc()

		let [listData, itemData] = await Promise.all([
			program.account.todoList.fetch(list.publicKey),
			program.account.listItem.fetch(itemAccount.publicKey),
		]);

		return {
			list: { publicKey: list.publicKey, data: listData },
			item: { publicKey: itemAccount.publicKey, data: itemData }
		};
	}

	const cancelItem = async ({ list, item, itemCreator, user }) => {
		await program.methods.cancel(list.data.name)
			.accounts({
				list: list.publicKey,
				listOwner: list.data.listOwner,
				item: item.publicKey,
				itemCreator: itemCreator.publicKey,
				user: user.publicKey,
			})
			.signers([user])
			.rpc()

		let listData = await program.account.todoList.fetch(list.publicKey);
		return { list: { publicKey: list.publicKey, data: listData } }
	}

	const finishItem = async ({ list, listOwner, item, user, expectAccountClosed }) => {
		await program.methods.finish(list.data.name)
			.accounts({
				list: list.publicKey,
				listOwner: listOwner.publicKey,
				item: item.publicKey,
				user: user.publicKey,
			})
			.signers([user])
			.rpc()

		let [listData, itemData] = await Promise.all([
			program.account.todoList.fetch(list.publicKey),
			expectAccountClosed ? null : await program.account.listItem.fetch(item.publicKey),
		]);

		return {
			list: {
				publicKey: list.publicKey,
				data: listData,
			},
			item: {
				publicKey: item.publicKey,
				data: itemData,
			}
		};
	}
	// <== }

	// { == Tests ==> 
	describe('create lists', () => {
		it('can create a list', async () => {
			const owner = provider.wallet;
			const list = await createList(owner, 'A list');
			expect(list.data.listOwner.toString(), 'List owner is set').equals(owner.publicKey.toString());
			expect(list.data.name, 'List name is set').equals('A list');
			expect(list.data.lines.length, 'List has no items').equals(0);
		});
		it('can create another list for a user with an active list', async () => {
			const owner = provider.wallet;
			const list = await createList(owner, 'Another list');
			expect(list.data.listOwner.toString(), 'List owner is set').equals(owner.publicKey.toString());
			expect(list.data.name, 'List name is set').equals('Another list');
			expect(list.data.lines.length, 'List has no items').equals(0);
		});
	});

	describe('add items', () => {
		it('can add items from different users', async () => {
			const [owner, adder, otherUser] = await createUsers(3);

			const adderStartingBalance = await getAccountBalance(adder.publicKey);
			const list = await createList(owner, 'list');
			const result = await addItem({ list, user: adder, name: 'Do something', bounty: 1 * LPS });

			expect(result.list.data.lines, 'Item is added').deep.equals([result.item.publicKey]);
			expect(result.item.data.creator.toString(), 'Item marked with creator').equals(adder.publicKey.toString());
			expect(result.item.data.creatorFinished, 'creator_finished is false').equals(false);
			expect(result.item.data.listOwnerFinished, 'list_owner_finished is false').equals(false);
			expect(result.item.data.name, 'Name is set').equals('Do something');
			expect(await getAccountBalance(result.item.publicKey), 'List account balance').equals(1 * LPS);

			const userNewBalance = await getAccountBalance(adder.publicKey);
			expectBalance(adderStartingBalance - userNewBalance, LPS, 'Number of lamports removed from adder is equal to bounty');

			// Add item from another use
			const resultTwo = await addItem({ list, user: otherUser, name: 'Do something more', bounty: 1 * LPS });
			expect(resultTwo.list.data.lines, 'Item is added').deep.equals([result.item.publicKey, resultTwo.item.publicKey]);

			// Add item from user who already added an item
			const resultThree = await addItem({ list, user: adder, name: 'Another item', bounty: 1 * LPS });
			expect(resultThree.list.data.lines, 'Item is added').deep.equals([result.item.publicKey, resultTwo.item.publicKey, resultThree.item.publicKey]);
		});

		it('cannot add items when the list is full', async () => {
			const owner = await createUser()

			const MAX_LIST_SIZE = 4;
			const list = await createList(owner, 'list', MAX_LIST_SIZE);

			await Promise.all(new Array(MAX_LIST_SIZE).fill(0).map((_, i) => {
				return addItem({
					list,
					user: owner,
					name: `Filler item ${i}`,
					bounty: 1 * LPS,
				});
			}));

			const adderStartingBalance = await getAccountBalance(owner.publicKey);

			// Try to add to list that should be full
			try {
				let addResult = await addItem({
					list,
					user: owner,
					name: 'Overflow item',
					bounty: 1 * LPS,
				});

				console.dir(addResult, { depth: null });
				expect.fail('Adding to full list should have failed');
			} catch (e) {
				expect(e.error.errorCode.code).equals("ListFull");
			}

			let adderNewBalance = await getAccountBalance(owner.publicKey);
			expect(adderStartingBalance, 'Adder balance is unchanged').equals(adderNewBalance);
		});

		it('cannot use a bounty smaller than the rent-exempt amount', async () => {
			const owner = await createUser()

			const list = await createList(owner, 'list');
			const adderStartingBalance = await getAccountBalance(owner.publicKey);

			try {
				await addItem({
					list,
					user: owner,
					name: 'Small bounty item',
					bounty: 10,
				});
				expect.fail('Should have failed');
			} catch (e) {
				expect(e.error.errorCode.code).equals("BountyTooSmall");
			}

			let adderNewBalance = await getAccountBalance(owner.publicKey);
			expect(adderStartingBalance, 'Adder balance is unchanged').equals(adderNewBalance);
		});
	});

	describe('cancel items', () => {
		it('can cancel item: list owner', async () => {
			const [owner, adder] = await createUsers(2);
			const adderStartingBalance = await getAccountBalance(adder.publicKey);

			const list = await createList(owner, 'list');
			const result = await addItem({
				list,
				user: adder,
				bounty: LPS,
				name: 'An item',
			});

			const adderBalanceAfterAdd = await getAccountBalance(adder.publicKey);

			expect(result.list.data.lines, 'Item is added to list').deep.equals([result.item.publicKey]);
			expect(adderBalanceAfterAdd, 'Bounty is removed from adder').lt(adderStartingBalance);

			const cancelResult = await cancelItem({
				list,
				item: result.item,
				itemCreator: adder,
				user: owner,
			});

			const adderBalanceAfterCancel = await getAccountBalance(adder.publicKey);
			expectBalance(adderBalanceAfterCancel, adderBalanceAfterAdd + LPS, 'Cancel returns bounty to adder');
			expect(cancelResult.list.data.lines, 'Cancel removes item from list').deep.equals([]);
		});

		it('can cancel item: item creator', async () => {
			const [owner, adder] = await createUsers(2);

			const list = await createList(owner, 'list');
			const adderStartingBalance = await getAccountBalance(adder.publicKey);

			const result = await addItem({
				list,
				user: adder,
				bounty: LPS,
				name: 'An item',
			});

			const adderBalanceAfterAdd = await getAccountBalance(adder.publicKey);

			expect(result.list.data.lines, 'Item is added to list').deep.equals([result.item.publicKey]);
			expect(adderBalanceAfterAdd, 'Bounty is removed from adder').lt(adderStartingBalance);

			const cancelResult = await cancelItem({
				list,
				item: result.item,
				itemCreator: adder,
				user: adder,
			});

			const adderBalanceAfterCancel = await getAccountBalance(adder.publicKey);
			expectBalance(adderBalanceAfterCancel, adderBalanceAfterAdd + LPS, 'Cancel returns bounty to adder');
			expect(cancelResult.list.data.lines, 'Cancel removes item from list').deep.equals([]);
		});

		it('cannot cancel item: other user', async () => {
			const [owner, adder, otherUser] = await createUsers(3);

			const list = await createList(owner, 'list');

			const adderStartingBalance = await getAccountBalance(adder.publicKey);

			const result = await addItem({
				list,
				user: adder,
				bounty: LPS,
				name: 'An item',
			});

			const adderBalanceAfterAdd = await getAccountBalance(adder.publicKey);

			expect(result.list.data.lines, 'Item is added to list').deep.equals([result.item.publicKey]);
			expect(adderBalanceAfterAdd, 'Bounty is removed from adder').lt(adderStartingBalance);

			try {
				await cancelItem({
					list,
					item: result.item,
					itemCreator: adder,
					user: otherUser,
				});
				expect.fail(`Removing another user's item should fail`);
			} catch (e) {
				expect(e.error.errorCode.code).equals("CancelPermissions");
			}

			const adderBalanceAfterCancel = await getAccountBalance(adder.publicKey);
			expect(adderBalanceAfterCancel, 'Failed cancel does not change adder balance').equals(adderBalanceAfterAdd);

			let listData = await program.account.todoList.fetch(list.publicKey);
			expect(listData.lines, 'Item is still in list after failed cancel').deep.equals([result.item.publicKey]);

			const itemBalance = await getAccountBalance(result.item.publicKey);
			expect(itemBalance, 'Item balance is unchanged after failed cancel').equals(LPS);
		});

		it('cannot cancel item: item creator with wrong key', async () => {
			const [owner, adder] = await createUsers(2);
			const list = await createList(owner, 'list');

			const result = await addItem({
				list,
				user: adder,
				bounty: LPS,
				name: 'An item',
			});

			try {
				await cancelItem({
					list,
					item: result.item,
					itemCreator: owner, // Wrong creator
					user: owner,
				});
				expect.fail(`Listing the wrong item creator should fail`);
			} catch (e) {
				expect(e.error.errorCode.code).equals("WrongItemCreator");
			}
		});

		it('cannot cancel item in other list', async () => {
			const [owner, adder] = await createUsers(2);
			const [list1, list2] = await Promise.all([
				createList(owner, 'list1'),
				createList(owner, 'list2'),
			]);

			const result = await addItem({
				list: list1,
				user: adder,
				bounty: LPS,
				name: 'An item',
			});

			try {
				await cancelItem({
					list: list2, // Wrong list
					item: result.item,
					itemCreator: adder,
					user: owner,
				});
				expect.fail(`Cancelling from the wrong list should fail`);
			} catch (e) {
				expect(e.error.errorCode.code).equals("ItemNotFound");
			}
		});
	});

	describe('finish', () => {
		it('can finish items: first owner then item creator', async () => {
			const [owner, adder] = await createUsers(2);

			const list = await createList(owner, 'list');
			const ownerInitial = await getAccountBalance(owner.publicKey);

			const bounty = 5 * LPS;
			const { item } = await addItem({
				list,
				user: adder,
				bounty,
				name: 'An item',
			});

			expect(await getAccountBalance(item.publicKey), 'initialized account has bounty').equals(bounty);

			const firstResult = await finishItem({
				list,
				item,
				user: owner,
				listOwner: owner,
				expectAccountClosed: false,
			});

			expect(firstResult.list.data.lines, 'Item still in list after first finish').deep.equals([item.publicKey]);
			expect(firstResult.item.data.creatorFinished, 'Creator finish is false after owner calls finish').equals(false);
			expect(firstResult.item.data.listOwnerFinished, 'Owner finish flag gets set after owner calls finish').equals(true);
			expect(await getAccountBalance(firstResult.item.publicKey), 'Bounty remains on item after one finish call').equals(bounty);

			const finishResult = await finishItem({
				list,
				item,
				user: adder,
				listOwner: owner,
				expectAccountClosed: true,
			});

			expect(finishResult.list.data.lines, 'Item removed from list after both finish').deep.equals([]);
			expect(await getAccountBalance(finishResult.item.publicKey), 'Bounty remains on item after one finish call').equals(0);
			expectBalance(await getAccountBalance(owner.publicKey), ownerInitial + bounty, 'Bounty transferred to owner');
		});


		it('can finish items: first item creator then list owner', async () => {
			const [owner, adder] = await createUsers(2);

			const list = await createList(owner, 'list');
			const ownerInitial = await getAccountBalance(owner.publicKey);

			const bounty = 5 * LPS;
			const { item } = await addItem({
				list,
				user: adder,
				bounty,
				name: 'An item',
			});

			expect(await getAccountBalance(item.publicKey), 'initialized account has bounty').equals(bounty);

			const firstResult = await finishItem({
				list,
				item,
				user: adder,
				listOwner: owner,
				expectAccountClosed: false,
			});

			expect(firstResult.list.data.lines, 'Item still in list after first finish').deep.equals([item.publicKey]);
			expect(firstResult.item.data.creatorFinished, 'Creator finish is true after creator calls finish').equals(true);
			expect(firstResult.item.data.listOwnerFinished, 'Owner finish flag is false after creator calls finish').equals(false);
			expect(await getAccountBalance(firstResult.item.publicKey), 'Bounty remains on item after one finish call').equals(bounty);

			const finishResult = await finishItem({
				list,
				item,
				user: owner,
				listOwner: owner,
				expectAccountClosed: true,
			});

			expect(finishResult.list.data.lines, 'Item removed from list after both finish').deep.equals([]);
			expect(await getAccountBalance(finishResult.item.publicKey), 'Bounty remains on item after one finish call').equals(0);
			expectBalance(await getAccountBalance(owner.publicKey), ownerInitial + bounty, 'Bounty transferred to owner');
		});

		it('cannot finish items: other user', async () => {
			const [owner, adder, otherUser] = await createUsers(3);

			const list = await createList(owner, 'list');

			const bounty = 5 * LPS;
			const { item } = await addItem({
				list,
				user: adder,
				bounty,
				name: 'An item',
			});

			try {
				await finishItem({
					list,
					item,
					user: otherUser,
					listOwner: owner,
					expectAccountClosed: false,
				});
				expect.fail('Finish by other user should have failed');
			} catch (e) {
				expect(e.error.errorCode.code).equals("FinishPermissions");
			}

			expect(await getAccountBalance(item.publicKey), 'Item balance did not change').equal(bounty);
		});

		it('cannot finish item in other list', async () => {
			const [owner, adder] = await createUsers(3);

			const [list1, list2] = await Promise.all([
				createList(owner, 'list1'),
				createList(owner, 'list2'),
			]);

			const bounty = 5 * LPS;
			// TODO: create item with same name in other list and test finishing
			const { item } = await addItem({
				list: list1,
				user: adder,
				bounty,
				name: 'An item',
			});

			try {
				await finishItem({
					list: list2,
					item,
					user: adder,
					listOwner: owner,
					expectAccountClosed: false,
				});
				expect.fail('Finish in other list should have failed');
			} catch (e) {
				expect(e.error.errorCode.code).equals("ItemNotFound");
			}

			expect(await getAccountBalance(item.publicKey), 'Item balance did not change').equal(bounty);
		});

		it('cannot finish item with wrong list owner', async () => {
			const [owner, adder] = await createUsers(2);

			const list = await createList(owner, 'list1');

			const bounty = 5 * LPS;
			const { item } = await addItem({
				list,
				user: adder,
				bounty,
				name: 'An item',
			});

			try {
				await finishItem({
					list,
					item,
					user: owner,
					listOwner: adder,
					expectAccountClosed: false,
				});

				expect.fail('Finish by other user should have failed');
			} catch (e) {
				expect(e.error.errorCode.code).equals("ConstraintSeeds");
			}

			expect(await getAccountBalance(item.publicKey), 'Item balance did not change').equal(bounty);
		});

		it('cannot finish an already-finished item', async () => {
			const [owner, adder] = await createUsers(2);

			const list = await createList(owner, 'list');
			const ownerInitial = await getAccountBalance(owner.publicKey);

			const bounty = 5 * LPS;
			const { item } = await addItem({
				list,
				user: adder,
				bounty,
				name: 'An item',
			});

			expect(await getAccountBalance(item.publicKey), 'initialized account has bounty').equals(bounty);

			await Promise.all([
				finishItem({
					list,
					item,
					user: owner,
					listOwner: owner,
					expectAccountClosed: true,
				}),

				finishItem({
					list,
					item,
					user: adder,
					listOwner: owner,
					expectAccountClosed: true,
				})
			]);

			try {
				await finishItem({
					list,
					item,
					user: owner,
					listOwner: owner,
					expectAccountClosed: true,
				});

				expect.fail('Finish on an already-closed item should fail');
			} catch (e) {
				expect(e.error.errorCode.code).equals("AccountNotInitialized");
			}

			expectBalance(await getAccountBalance(owner.publicKey), ownerInitial + bounty, 'Bounty transferred to owner just once');
		});
	});
});


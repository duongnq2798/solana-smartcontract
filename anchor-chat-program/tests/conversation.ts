import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SplTokenInstructionCoder } from "@project-serum/anchor/dist/cjs/coder/spl-token/instruction";
import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { BN } from "bn.js";
import { expect } from "chai";
import { Conversation } from "../target/types/conversation";
import * as borsh from "borsh";
import { utf8 } from "@project-serum/anchor/dist/cjs/utils/bytes";

/**
 * 
 * @param num the number to make a BN of
 * @param length the number of bytes of the resulting buffer
 * @returns 
 */
export const numberToLeBytes = (num: number, length: number) => {
  const n = new anchor.BN(num);
  const buffer = n.toBuffer("le", length);
  return buffer;
};

export const createConversationTrackerPda = async (
  programId: anchor.web3.PublicKey,
  sender: anchor.web3.PublicKey,
  receiver: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  let seeds = [sender.toBuffer(), receiver.toBuffer(), anchor.utils.bytes.utf8.encode("conversation_tracker")];
  return await anchor.web3.PublicKey.findProgramAddress(seeds, programId);
}

export const createMessagePda = async (
  programId: anchor.web3.PublicKey,
  sender: anchor.web3.PublicKey,
  receiver: anchor.web3.PublicKey,
  messageNonce: number
): Promise<[anchor.web3.PublicKey, number]> => {
  let seeds = [sender.toBuffer(), receiver.toBuffer(), anchor.utils.bytes.utf8.encode("conversation_message")];
  return await anchor.web3.PublicKey.findProgramAddress(seeds, programId);
}

describe("conversation", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Conversation as Program<Conversation>;
  const programProvider = program.provider as anchor.AnchorProvider;

  const alice = programProvider.wallet.publicKey;
  const bhai = anchor.web3.Keypair.generate();
  let bhaiWallet = new anchor.Wallet(bhai);

  const initializer = alice;
  const initializedWith = bhai.publicKey;
  const message: number[] = [];
  const messages = new Map();
  // the index is message_nonce of the message PDA account
  // const messages: anchor.web3.PublicKey[] = [];
  let conversationTracker: anchor.web3.PublicKey = null;
  let conversationTrackerBumpSeed: number = null;
  let trackerData = null;
  let messageData = null;

  const MAX_MESSAGE_SIZE = 32;
  const EMPTY_MESSAGE = Array<number>(MAX_MESSAGE_SIZE);

  it("Alice initialized conversation with Bhai", async () => {
    [conversationTracker, conversationTrackerBumpSeed] = await createConversationTrackerPda(program.programId, initializer, initializedWith);

    await program.methods.initialize().accounts({
      initializer: initializer,
      initializedWith: initializedWith,
      conversationTracker,
    }).signers([]).rpc();

    trackerData = await program.account.conversationTracker.fetch(conversationTracker);
    expect(trackerData.bumpSeed).to.equal(conversationTrackerBumpSeed);

    expect(trackerData.initializer.toBase58()).to.equal(initializer.toBase58());
    expect(trackerData.initializedWith.toBase58()).to.equal(initializedWith.toBase58());
  });

  it("Alice says hello to bhai!", async () => {
    let sender = initializer;
    let receiver = bhai.publicKey;
    let [messagePda, messagePdaBump] = await createMessagePda(program.programId, sender, receiver, trackerData.bumpSeed);

    // [u8;32] is expected by Borsh as InstructionData, so we use pubkeys for convenience.
    let bhaiMessage = initializedWith.toBytes();
    for (let i = 0; i < bhaiMessage.length; i++) {
      message[i] = bhaiMessage[i];
    }
    // FIXME error in giving message pda the conversation_tracker.conversation_nonce. (sig verification fails)
    await program.methods.sendMessage(message).accounts({
      sender: sender,
      receiver,
      conversationTracker,
      message: messagePda
    })
      .signers([])
      .rpc();

    trackerData = await program.account.conversationTracker.fetch(conversationTracker);
    messageData = await program.account.message.fetch(messagePda);

    expect(trackerData.conversationNonce, "Unexpected conversation nonce").to.equal(1);
    expect(messageData.bumpSeed, "Unexpected message pda bump seed").to.equal(messagePdaBump);

    // save the message address with its conversation nonce
    messages.set(trackerData.conversationNonce-1, messagePda);
  });

  it("Alice deletes a message",async ()=>{
    let sender = initializer;
    let receiver = bhai.publicKey;
    let message = messages.get(trackerData.conversationNonce-1);
    await program.methods.deleteMessage().accounts({
      sender,
      receiver,
      conversationTracker,
      message
    })
    .signers([])
    .rpc();

    messageData = await program.account.message.fetch(message);
    expect(messageData.message.every(val => val === 0)).to.equal(true);
  });
});

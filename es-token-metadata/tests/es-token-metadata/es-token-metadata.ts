import * as anchor from "@project-serum/anchor";
import {
  ACCOUNT_DISCRIMINATOR_SIZE,
  BorshCoder,
  Program,
  Wallet,
} from "@project-serum/anchor";
import { EsTokenMetadata } from "../../target/types/es_token_metadata";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  MINT_SIZE,
  mintTo,
} from "@solana/spl-token"; // IGNORE THESE ERRORS IF ANY
import dotenv from "dotenv";
const { SystemProgram } = anchor.web3;

dotenv.config();

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.EsTokenMetadata as Program<EsTokenMetadata>;
const myWallet = provider.wallet;

describe("es-token-metadata", () => {
  it("Create Metadata Account!", async () => {
    const idl = await anchor.Program.fetchIdl(process.env.PROGRAM_ID);
    // console.log(idl);

    const lamports: number =
      await program.provider.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      );
    // minted token address
    const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();

    let ata: anchor.web3.PublicKey = undefined;
    let pda: anchor.web3.PublicKey = undefined;
    let token_metadata: any = undefined;

    // Mint token
    {
      console.log("Minting token...");

      // create ata address (minted token <- ata)
      ata = await getAssociatedTokenAddress(
        mintKey.publicKey,
        myWallet.publicKey
      );
      console.log("ata:", ata.toBase58());
      console.log("\n");

      const tx = new anchor.web3.Transaction();

      // Use anchor to create an account from the mint key that we created
      const create_account_ix = anchor.web3.SystemProgram.createAccount({
        fromPubkey: myWallet.publicKey,
        newAccountPubkey: mintKey.publicKey,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID,
        lamports,
      });
      tx.add(create_account_ix);

      // Fire a transaction to create our mint account that is controlled by our anchor wallet
      const initialize_mint_ix = createInitializeMintInstruction(
        mintKey.publicKey,
        0,
        myWallet.publicKey,
        myWallet.publicKey
      );
      tx.add(initialize_mint_ix);

      // Create the ATA account that is associated with our mint on our anchor wallet
      const create_ata_ix = createAssociatedTokenAccountInstruction(
        myWallet.publicKey,
        ata,
        myWallet.publicKey,
        mintKey.publicKey
      );
      tx.add(create_ata_ix);

      // sends and create the transaction
      // console.log("Sending transaction...");
      const res = await anchor.AnchorProvider.env().sendAndConfirm(tx, [
        mintKey,
      ]);
      // console.log("res: ", res);

      {
        const account = {
          mintAuthority: myWallet.publicKey,
          mint: mintKey.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenAccount: ata,
          payer: myWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        };

        const tx = await program.methods.mintNft().accounts(account).rpc();
        // console.log("Transaction Signature: ", tx);
      }

      console.log("Mint token completed\n\n");

      // Debug Print
      {
        const objs: [String, any][] = [];
        objs.push(["My Wallet", myWallet.publicKey]);
        objs.push(["Mint Account", mintKey.publicKey]);
        objs.push(["ATA", ata]);
        await logDetails(objs);

        const minted = await getAccountInfo(ata);
        const minted_amount = (
          minted.value.data as anchor.web3.ParsedAccountData
        ).parsed.info.tokenAmount.amount;
        console.log(`minted[${minted_amount}]`);
      }
    }

    // Create Metadata Account.
    {
      console.log("Generating PDA...");

      const getMetadata = async (
        mint: anchor.web3.PublicKey
      ): Promise<anchor.web3.PublicKey> => {
        return (
          await anchor.web3.PublicKey.findProgramAddress(
            [
              Buffer.from("es-metadata"),
              program.programId.toBuffer(),
              mint.toBuffer(),
            ],
            program.programId
          )
        )[0];
      };
      pda = await getMetadata(mintKey.publicKey);
      console.log("pda:", pda.toBase58());
      console.log("Generate PDA completed");

      console.log("Creating Metadata Account...");
      const creators = [
        {
          address: pda,
          verified: false,
          share: new anchor.BN(0),
        },
      ];

      // Add creators
      for (let i = 0; i < 1; ++i) {
        creators.push({
          address: myWallet.publicKey,
          verified: false,
          share: new anchor.BN(i),
        });
      }

      token_metadata = {
        data: {
          name: "name#01",
          symbol: "symbol#01",
          uri: "http://www.uri_01.com",
          sellerFeeBasisPoints: 100,
          shareInsuranceTokenAmount: new anchor.BN(0),
          shareInsuranceMint: null,
          creators: creators,
          referrers: null,
        },
        allowDirectCreatorWrites: false,
        isMutable: true,
      };
      // logObject("data:", token_metadata);

      const account = {
        metadata: pda,
        payer: myWallet.publicKey,
        mint: mintKey.publicKey,
        mintAuthority: myWallet.publicKey,
        updateAuthority: myWallet.publicKey,
        systemProgram: SystemProgram.programId,
        // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      };
      // logObject("account:", account);

      {
        const tx = await program.methods
          .createMetadata(token_metadata)
          .accounts(account)
          // .signers([mintKey]) // don't need signer in this case.
          .rpc();
        console.log("CreateMetadataAccount transaction signature", tx);
      }
      console.log("Create metadata completed\n\n");

      // const metadata = await program.account.metadata.fetch(pda);
      // logObject("metadata:", metadata);

      // Debug Print
      {
        const objs: [String, any][] = [];
        objs.push(["My Wallet", myWallet.publicKey]);
        objs.push(["Mint Account", mintKey.publicKey]);
        objs.push(["Created PDA", pda]);
        await logDetails(objs);
      }
    }

    // Update Metadata Account.
    {
      token_metadata.data.name ="name#02";
      token_metadata.data.symbol = "symbol#02";
      token_metadata.data.uri = "http://www.uri_02.com";
      token_metadata.isMutable = false;

      const account = {
        metadata: pda,
        payer: myWallet.publicKey,
        mint: mintKey.publicKey,
        updateAuthority: myWallet.publicKey,
      };

      {
        const tx = await program.methods
          .updateMetadata(token_metadata)
          .accounts(account)
          // .signers([mintKey]) // don't need signer in this case.
          .rpc();
        console.log("UpdateMetadataAccount transaction signature", tx);
      }
      console.log("Update metadata completed\n\n");

      // Debug Print
      {
        const objs: [String, any][] = [];
        objs.push(["Updated PDA", pda]);
        await logDetails(objs);
      }
    }
  });
});

//#region Debug Function
async function logDetails(objs: [String, any][]) {
  {
    for (const [name, obj] of objs) {
      if (obj instanceof anchor.web3.PublicKey) {
        // check is public key.
        const publicKey: anchor.web3.PublicKey = obj as anchor.web3.PublicKey;
        let accountInfo = await getAccountInfo(publicKey);
        if (
          accountInfo.value.data instanceof Buffer &&
          accountInfo.value.data.toJSON().data.length > 0
        ) {
          const metadata = await program.account.metadata.fetch(publicKey);
          let parsed_data: anchor.web3.ParsedAccountData = {
            program: program.programId.toBase58(),
            parsed: metadata,
            space: 0,
          };
          accountInfo.value.data = parsed_data; // override data to parsed_data
        }

        logObject(`${name}\n(${publicKey.toBase58()}):`, accountInfo);
      } else {
        logObject(`${name}:`, obj);
      }
    }
  }
}

async function getAccountInfo(accountPublicKey: anchor.web3.PublicKey) {
  return program.provider.connection.getParsedAccountInfo(accountPublicKey);
}

function logObject(detail: String, obj: any) {
  if (obj != null) {
    console.log(detail + `\n${JSON.stringify(obj, null, 2)}\n`);
  } else {
    console.log(detail + `is null.\n`);
  }
}
//#endregion

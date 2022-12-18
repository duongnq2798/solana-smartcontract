import * as anchor from "@project-serum/anchor";
import { Keypair, Cluster } from "@solana/web3.js";

import {
  ES_TOKEN_METADATA_PROGRAM,
  ES_TOKEN_METADATA_PROGRAM_PREFIX,
} from "./constant";
import { addSOLToWallet } from "../../cookie-cutter/utils/account";

import { mint } from "./mint";
import { createEsTokenMetadata } from "./create-es-token-metadata";

export const loadEsTokenMetadataProgram = async (
  walletKeyPair: Keypair,
  env: string,
  customRpcUrl?: string
): Promise<anchor.Program> => {
  if (customRpcUrl) console.log("USING CUSTOM URL", customRpcUrl);

  const walletWrapper = new anchor.Wallet(walletKeyPair);

  console.log("deployment env => ", env);

  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl(env as Cluster),
    "confirmed"
  );
  const provider = new anchor.AnchorProvider(connection, walletWrapper, {
    preflightCommitment: "confirmed",
  });

  console.log("fetching IDL using program ID => ", ES_TOKEN_METADATA_PROGRAM);
  const idl = await anchor.Program.fetchIdl(
    ES_TOKEN_METADATA_PROGRAM,
    provider
  );

  return new anchor.Program(idl, ES_TOKEN_METADATA_PROGRAM, provider);
};

export const getMetadata = async (
  esTokenMetadataProgram: anchor.Program,
  mint: anchor.web3.PublicKey
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(ES_TOKEN_METADATA_PROGRAM_PREFIX),
      ES_TOKEN_METADATA_PROGRAM.toBuffer(),
      mint.toBuffer(),
    ],
    ES_TOKEN_METADATA_PROGRAM
  );
};

export const initEsTokenMetadata = async (
  walletKeyPair: anchor.web3.Keypair,
  env: string
): Promise<{
  mintKeypair: anchor.web3.Keypair;
  esTokenMetaDataKey: anchor.web3.PublicKey;
}> => {
  console.log("----------- --------------------- ------------");
  console.log("----------- initEsTokenMetadata   ------------");
  console.log("----------- --------------------- ------------");
  await addSOLToWallet(walletKeyPair);

  const esTokenMetadataProgram = await loadEsTokenMetadataProgram(
    walletKeyPair,
    env
  );

  console.log(
    "[initEsTokenMetadata] esTokenMetadataProgram",
    esTokenMetadataProgram
  );
  const mintKeyPair = await mint(esTokenMetadataProgram, walletKeyPair);

  const metadataKey = await createEsTokenMetadata(
    esTokenMetadataProgram,
    walletKeyPair,
    mintKeyPair
  );

  return {
    esTokenMetaDataKey: metadataKey,
    mintKeypair: mintKeyPair,
  };
};

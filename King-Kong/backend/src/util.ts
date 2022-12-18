import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

import fs from 'fs';
import path from 'path';
import { PROGRAM_ID, USER_DATA_SEED } from './config/constant';

const DUMP_PATH = __dirname + '/../dumps';

export function saveDump(
  dumpType: string,
  content: any,
  cPath: string = DUMP_PATH,
  infos: any = {},
) {
  fs.writeFileSync(
    getDumpPath(dumpType, cPath, infos),
    JSON.stringify(content),
  );
}

/**
 * Restore dump content as file
 * 
 * @param dumpType Type of dump which is used to resolve dump file name
 * @param cPath Location of saved dump file
 * @returns JSON object or undefined
 */
export function loadDump(
  dumpType: string,
  cPath: string = DUMP_PATH,
) {
  const path = getDumpPath(dumpType, cPath);
  return fs.existsSync(path)
    ? JSON.parse(fs.readFileSync(path).toString())
    : undefined;
}

/**
 * Resolve dump file path from dumpType
 * 
 * @param dumpType Type of dump which is used to resolve dump file name
 * @param cPath Location of saved dump file
 * @param infos Optional param for track transactions. Save period info in the dump file name
 * @returns Location of subdirectory of exact dump file
 */
export function getDumpPath(
  dumpType: string,
  cPath: string = DUMP_PATH,
  infos: any = {},
) {
  if (!fs.existsSync(cPath)) fs.mkdirSync(cPath, { recursive: true });
  switch (dumpType) {
    default:
      return path.join(cPath, dumpType);
  }
}

export const sleep = (time: number) => {
  return new Promise(resolve => setTimeout(resolve, time))
}

export const getGamePoolAccount = async (connection: Connection): Promise<PublicKey> => {
  let tokenAccount = await connection.getProgramAccounts(
    PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 1160
        },
        {
          memcmp: {
            offset: 64,
            bytes: '2'
          }
        },
        // {
        //   memcmp: {
        //     offset: 0,
        //     bytes: nftMintPk.toBase58()
        //   }
        // },
      ]
    }
  );
  return tokenAccount[0].pubkey;
}

export const getUserState = async (userAddress: PublicKey, program: anchor.Program) => {

  const [userPool, _] = await PublicKey.findProgramAddress(
    [Buffer.from(USER_DATA_SEED), userAddress.toBuffer()],
    PROGRAM_ID,
  );

  try {
    let userState = await program.account.userPool.fetch(userPool);
    console.log(userState, ">> user state");
    let address = (userState.address as any).toBase58();
    let playedVolume = (userState.playedVolume as any).toNumber();
    let playedNums = (userState.playedNums as any).toNumber();
    let playedBanana = (userState.playedBanana as any).toNumber();
    let buyedBanana = (userState.buyedBanana as any).toNumber();
    let winnedVolume = (userState.winnedVolume as any).toNumber();
    let winnedNums = (userState.winnedNums as any).toNumber();
    let winnedBanana = (userState.winnedBanana as any).toNumber();
    let winnedNft = (userState.winnedNft as any).toNumber();
    let winnerLast = (userState.winnerLast as any);
    console.log(address, ":: user address")
    console.log(playedVolume, ":: playedVolume")
    console.log(playedNums, ":: playedNums")
    console.log(playedBanana, ":: playedBanana")
    console.log(buyedBanana, ":: buyedBanana")
    console.log(winnedVolume, ":: winnedVolume")
    console.log(winnedNums, ":: winnedNums")
    console.log(winnedBanana, ":: winnedBanana")
    console.log(winnedNft, ":: winnedNft")
    console.log(winnerLast, ":: winnerLast")
    return {
      address: address,
      playedVolume: playedVolume,
      playedNums: playedNums,
      playedBanana: playedBanana,
      buyedBanana: buyedBanana,
      winnedVolume: winnedVolume,
      winnedNums: winnedNums,
      winnedBanana: winnedBanana,
      winnedNft: winnedNft,
      winnerLast: winnerLast
    };
  } catch {
    return null;
  }
}
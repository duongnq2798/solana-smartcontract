import * as anchor from '@project-serum/anchor';
import { Program } from "@project-serum/anchor";
import { PublicKey } from '@solana/web3.js';
import { SolBlog } from "../@types/sol_blog";
import idl from "../idl/sol_blog.json";


export const programId = new PublicKey(
    'HT1SvEi8Ku988kYZMe7MF85YtdmYWiZ6vS2A2ky8jDrH',
  )
  

export const getProgramInstance = (connection:anchor.web3.Connection, wallet:any)=>{

    if (!wallet.publicKey) alert('Can get program instance');

    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions(),
    )

    const program = new Program<SolBlog>(idl as any, programId, provider);

    return program
}
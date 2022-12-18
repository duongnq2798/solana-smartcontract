import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { NftMachine } from '../target/types/nft_machine';

describe('nft-machine', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.NftMachine as Program<NftMachine>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});

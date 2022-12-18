import * as anchor from '@project-serum/anchor';
import { Keypair, SystemProgram, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

function readKeypairFromPath(path: string): Keypair {
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  return Keypair.fromSecretKey(Buffer.from(data));
}

async function find_donation_platform(authority: PublicKey, programId: PublicKey) {
  return await PublicKey.findProgramAddress([Buffer.from('donation_platform'), authority.toBuffer()], programId);
}

async function find_donation(donationPlatform: PublicKey, donationId: number, programId: PublicKey) {
  return await PublicKey.findProgramAddress(
    [Buffer.from('donation'), donationPlatform.toBuffer(), Buffer.from(donationId.toString())],
    programId
  );
}

async function find_donators(authority: PublicKey, programId: PublicKey) {
  return await PublicKey.findProgramAddress([Buffer.from('donators'), authority.toBuffer()], programId);
}

async function main() {
  const idl = JSON.parse(readFileSync('../target/idl/donations.json', 'utf8'));
  const programId = new PublicKey('don2A9YodeAqq83ZGUjrXWTvjFBD7FeTUDQMA8XRX3Z');
  const program = new anchor.Program(idl, programId);

  const donationPlatformData = program.account.donationPlatform;
  const donationData = program.account.donation;
  const donatorsData = program.account.donators;

  const authority = provider.wallet.publicKey;

  const [donationPlatformPDA] = await find_donation_platform(authority, program.programId);
  const [donatorsPDA] = await find_donators(authority, program.programId);

  await program.methods
    .initialize()
    .accounts({
      authority,
      donationPlatform: donationPlatformPDA,
      donators: donatorsPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log(provider.wallet.publicKey.toBase58());
  console.log(programId.toBase58());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

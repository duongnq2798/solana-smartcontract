import * as anchor from "@project-serum/anchor";
import { getMetadata } from "./account";
import { Creator } from "./interface";

export const createEsTokenMetadata = async (
  esTokenMetadataProgram: anchor.Program,
  walletKeyPair: anchor.web3.Keypair,
  mintKeyPair: anchor.web3.Keypair
): Promise<anchor.web3.PublicKey> => {
  const [metadataKey, metadataKeyBump] = await getMetadata(
    esTokenMetadataProgram,
    mintKeyPair.publicKey
  );
  console.log(
    "[createEsTokenMetadata] metadataKey:",
    metadataKey.toBase58(),
    metadataKeyBump
  );

  const creators: Creator[] = [
    {
      address: walletKeyPair.publicKey,
      verified: false,
      share: new anchor.BN(10),
    },
  ];

  // NOTE: Add creators with specified shares
  [10, 30, 40, 10].map((share) => {
    const _walletKeyPair = anchor.web3.Keypair.generate();
    creators.push({
      address: _walletKeyPair.publicKey,
      verified: false,
      share: new anchor.BN(share),
    });
  });

  const esTokenMeta = {
    data: {
      name: "name_str",
      symbol: "symbol_str",
      uri: "uri_str",
      sellerFeeBasisPoints: 10,
      creators: creators,
      shareInsuranceTokenAmount: new anchor.BN(0),
      shareInsuranceMint: null,
      referrers: null,
    },
    allowDirectCreatorWrites: false,
    isMutable: true,
  };

  const tokenAccounts = {
    metadata: metadataKey,
    payer: walletKeyPair.publicKey,
    mint: mintKeyPair.publicKey,
    mintAuthority: walletKeyPair.publicKey,
    updateAuthority: walletKeyPair.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  };

  const tx_token = await esTokenMetadataProgram.methods
    .createMetadata(esTokenMeta)
    .accounts(tokenAccounts)
    .rpc();

  console.log("[createEsTokenMetadata] tx_token =>", tx_token);
  console.log("Create metadata completed\n\n");

  return metadataKey;
};

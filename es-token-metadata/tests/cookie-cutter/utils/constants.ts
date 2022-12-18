import { AnchorProvider, web3 } from "@project-serum/anchor";
import { PublicKey, clusterApiUrl, Keypair } from "@solana/web3.js";

export const COOKIE_CUTTER = "cookie_cutter";
export const FEE_PAYER = "fee_payer";
export const TREASURY = "treasury";
export const SIGNER = "signer";
export const METADATA = "metadata";

export const COOKIE_CUTTER_PROGRAM_ID = new PublicKey(
  "5ZCWy1KnjskpikJGTrbRVNLw6pyRmS1GjbQfqwwqgG5X"
);

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const TREASURY_WALLET_KEY = new PublicKey(
  "FMCFRg2wct97arsFKfqpgcKafszWAWhpPcg3LqCCdnr7"
);

export const FEE_DESTINATION_WALLET_KEY = new PublicKey(
  "62Y9187d4PufGT948wrLrNeqDgZcdfEUEZj9kwfmn9Lw"
);

export const ES_TOKEN_METADATA_PROGRAM = new web3.PublicKey(
  "DTdBgGUYz2Lov3W418Zz4XgKiM7nLGh1EFXJAk4T4epS"
);

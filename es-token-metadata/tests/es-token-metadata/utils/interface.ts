import * as anchor from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";

export type Creator = {
  address: anchor.web3.PublicKey;
  verified: boolean;
  share: BN;
};

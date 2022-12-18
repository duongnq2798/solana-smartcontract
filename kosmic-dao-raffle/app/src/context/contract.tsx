import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { createContext, FC, useMemo } from "react";
import { AnchorProvider, Idl, Program } from "@project-serum/anchor";
import idl from './kosmic_dao_raffle.json';
import { KosmicRaffle, IDL } from "./kosmic_dao_raffle";

type WorkSpace = {
    program: Program<KosmicRaffle>;
    provider: AnchorProvider;
    wallet: AnchorWallet;
    connection: Connection;
};

export const ContractContext = createContext<WorkSpace | null>(null);


const preflightCommitment = "processed";
const commitment = "processed";
const programID = new PublicKey(idl.metadata.address);
const connection = new Connection('https://ssc-dao.genesysgo.net/');

export const ContractProvider: FC<any> = ({ children }) => {
  const wallet: any = useAnchorWallet();

  const provider = useMemo(() => {
    return new AnchorProvider(connection, wallet, {
      preflightCommitment,
      commitment,
    });
  }, [wallet]);

  const program = useMemo(() => {
    return new Program<KosmicRaffle>(IDL, programID, provider);
  }, [provider]);

  return (
    <ContractContext.Provider
      value={{
        wallet,
        connection,
        provider,
        program,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
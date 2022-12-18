import {PublicKey} from "@solana/web3.js";

export type CaterAccount = {
    caterList: PublicKey,
    name: string,
    menus: PublicKey[],
    bump: number
}

export interface CaterInfo {
    name: string,
    url: string,
    menu: MenuItem[]
}

export interface MenuItem {
    name: string,
    footPrint: number,
    cost: number
}
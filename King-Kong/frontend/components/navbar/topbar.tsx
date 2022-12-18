import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import styles from './topbar.module.css';
import { withRouter, NextRouter, useRouter } from 'next/router'

import {
    history as HistoryIcon,
    leaderboard as LeaderboardIcon,
    balance as BalanceIcon,
    banana as BananaIcon,
    win as WinsIcon
} from '../svgIcons'
import { useWallet } from '@solana/wallet-adapter-react';
import { Program, web3 } from '@project-serum/anchor';

import getConfig from 'next/config'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BANANA_TOKEN_MINT } from '../../context/types';
import { getTokenAccount, getTokenAccountBalance } from '../../context/utils';
import { getUserState } from '../../context/script';

const { publicRuntimeConfig } = getConfig()
const cluster = publicRuntimeConfig.SOLANA_NETWORK;

let solConnection = new web3.Connection(web3.clusterApiUrl(cluster));

const TopBar = () => {

    const router = useRouter();
    const wallet = useWallet()
    const [solbalance, setSolbalance] = React.useState(0);
    const [bnnBalance, setBnnBalance] = React.useState(0);
    const [wins, setWins] = React.useState(0)
    const setUserInfo = async () => {
        if (!wallet.publicKey) return;
        let balance = await solConnection.getBalance(wallet?.publicKey)
        let balanceFloatString =
            (balance / LAMPORTS_PER_SOL).toString().split(".").length == 2 ?
                (balance / LAMPORTS_PER_SOL).toString().split(".")[0] + "." + (balance / LAMPORTS_PER_SOL).toString().split(".")[1].slice(0, Math.min(2, (balance / LAMPORTS_PER_SOL).toString().split(".")[1].length)) :
                (balance / LAMPORTS_PER_SOL).toString()
        setSolbalance(parseFloat(balanceFloatString));

        // let bnnAmount = await solConnection.getTokenSupply(BANANA_TOKEN_MINT);
        // console.log(bnnAmount, "==============================")
        // setBnnBalance(bnnAmount.value.uiAmount as number);

        let tokenAccount = await getTokenAccount(BANANA_TOKEN_MINT, wallet.publicKey, solConnection);
        let result = await getTokenAccountBalance(tokenAccount, solConnection)
        setBnnBalance(result ? result : 0);

        let userstate = await getUserState(wallet.publicKey);
        setWins(userstate ? userstate.winnedNums : 0)
    }
    React.useEffect(() => {
        console.log(router, " >> router")
        if (wallet.connected && wallet.publicKey) {
            setUserInfo()
        }
    }, [wallet.connected])

    return (
        <>
            <div className={styles.container}>
                <a href='/'>
                    <span>
                        Logo
                    </span>
                </a>
                <a href='/history'>

                    <span>
                        <span className={styles.icon}>
                            <HistoryIcon />
                        </span>
                        History
                    </span>
                </a>
                <a href='/leaderboard'>
                    <span>
                        <span className={styles.icon}>
                            <LeaderboardIcon />
                        </span>
                        Leaderboard
                    </span>
                </a>
                <span className={`${wallet.connected && styles.detailMode}`}>
                    {
                        (!wallet || !wallet.connected) ?
                            <>
                                <span className={styles.icon}>
                                    <BalanceIcon />
                                </span>
                                Balance
                            </> :
                            <>
                                <span>
                                    {solbalance} SOL
                                </span>
                                <span>
                                    <span className={styles.icon}>
                                        <BalanceIcon />
                                    </span>
                                    Balance
                                </span>
                            </>
                    }
                </span>
                <span className={`${wallet.connected && styles.detailMode}`}>
                    {
                        (!wallet || !wallet.connected) ?
                            <>
                                <span className={styles.icon}>
                                    <BananaIcon />
                                </span>
                                Bananas
                            </> :
                            <>
                                <span>
                                    {bnnBalance}
                                </span>
                                <span>
                                    <span className={styles.icon}>
                                        <BananaIcon />
                                    </span>
                                    Bananas
                                </span>
                            </>
                    }

                </span>
                <span className={`${wallet.connected && styles.detailMode}`}>
                    {
                        (!wallet || !wallet.connected) ?
                            <>
                                <span className={styles.icon}>
                                    <WinsIcon />
                                </span>
                                Wins
                            </> :
                            <>
                                <span>
                                    {wins}
                                </span>
                                <span>
                                    <span className={styles.icon}>
                                        <WinsIcon />
                                    </span>
                                    Wins
                                </span>
                            </>
                    }
                </span>
            </div>

        </>
    )
}

export default TopBar;

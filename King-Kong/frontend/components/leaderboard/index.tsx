/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
    WalletConnectButton
} from '@solana/wallet-adapter-react-ui';
import styles from './index.module.css';
import { useWallet } from '@solana/wallet-adapter-react';

import { sleep } from '../../context/utils';
import axios from 'axios';
import getConfig from 'next/config'
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
const { publicRuntimeConfig } = getConfig()
const cluster = publicRuntimeConfig.SOLANA_NETWORK;
const SERVER_URL = publicRuntimeConfig.SERVER_URL;

const LeaderboardContent = () => {
    const [menu, setMenu] = React.useState("day")
    const [tableData, setTableData] = React.useState<any[]>([])
    const loadData = async () => {
        let result = await axios.get(SERVER_URL + "/api/user_stats");
        let arrayData: any[] = [];

        for (let item in result.data) {

            let temp = result.data[item];
            // temp['name'] = item;
            arrayData.push(temp);
        }

        let sortedData = arrayData.sort((a: any, b: any) => {
            return (a.winnedVolume ? a.winnedVolume : 0) > (b.winnedVolume ? b.winnedVolume : 0) ? -1 : 1
        }).slice(-100)

        console.log(sortedData)
        setTableData(sortedData)
    }
    React.useEffect(() => {
        loadData()
    }, [])
    return (

        <div className={styles.container}>
            <div className={styles.content}>
                <p className={styles.title}>
                    Leaderboard
                </p>
                <div className={styles.menuContainer}>
                    <div className={styles.menuWrapper}>
                        <span className={`${menu == "day" && styles.menuActive}`} onClick={() => setMenu("day")}>
                            Daily
                            <div className={styles.menuBorder}>
                            </div>
                        </span>
                        <span className={`${menu == "week" && styles.menuActive}`} onClick={() => setMenu("week")}>
                            Weekly
                            <div className={styles.menuBorder}>
                            </div>
                        </span>
                        <span className={`${menu == "all" && styles.menuActive}`} onClick={() => setMenu("all")}>
                            All Time
                            <div className={styles.menuBorder}>
                            </div>
                        </span>
                    </div>

                </div>
                <div className={styles.dataTable}>
                    <div className={styles.header}>
                        <span>
                            Player ID
                        </span>
                        <span>
                            Amount Won
                        </span>
                    </div>

                    {
                        tableData.map((item, idx) => {
                            if (item.address && item.playedNums && (item.winnedVolume !== undefined && item.winnedVolume >= 0))
                                return (
                                    <div className={styles.row} key={idx}>
                                        <span >
                                            <img src={'https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https%3A%2F%2Fbafybeigkkv6w7dbkygm7jjnxfeqkkb5lpjt7umihturkgxf7qnjt5lxtg4.ipfs.dweb.link%2F5752.png%3Fext%3Dpng'} alt="pfp" className={styles.pfp} />
                                            <span className={styles.userInfo}>
                                                <span>
                                                    {
                                                        item.address
                                                    }
                                                </span>
                                                <span>
                                                    {item.playedNums} games played
                                                </span>
                                            </span>

                                        </span>
                                        <span>
                                            {
                                                item.winnedVolume != 0 ?
                                                    (item.winnedVolume / LAMPORTS_PER_SOL).toFixed(1) : 0
                                            } SOL
                                        </span>
                                    </div>
                                )
                        })
                    }

                </div>
            </div>


        </div>


    )
}

export default LeaderboardContent;

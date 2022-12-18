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

const StatsContent = () => {
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
                    Stats
                </p>

                <div className={styles.dataTable}>
                    <table className={styles.table}>
                        <thead>
                            <tr className=''>
                                <th>
                                    User
                                </th>
                                <th>
                                    Games <br /> Played
                                </th>
                                <th>
                                    Games <br />Won
                                </th>
                                <th>
                                    XP Rank
                                </th>
                                <th>
                                    SOL P&L
                                </th>
                                <th>
                                    Reached <br />Final Round
                                </th>
                            </tr>
                        </thead>
                        <tbody >
                            {
                                tableData &&
                                tableData.map((item, index) => {
                                    if (item.address)
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    {
                                                        item.address
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        item.playedNums
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        item.winnedNums
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        item.xp ? item.xp : 0
                                                    }
                                                    XP
                                                </td>
                                                <td>
                                                    {
                                                        (item.winnedNums * 1.6 - item.playedNums * 0.1).toFixed(2)
                                                    } SOL
                                                </td>
                                                <td>
                                                    {item.playedNums} times
                                                </td>
                                            </tr>
                                        )
                                })
                            }


                        </tbody>


                    </table>
                </div>
            </div>


        </div>


    )
}

export default StatsContent;

/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
    WalletConnectButton
} from '@solana/wallet-adapter-react-ui';
import styles from './gameStatusShow.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import {
    lock as LockIcon,
    cross as CrossIcon
} from '../svgIcons'
import { getGamePoolData } from '../../context/script';
import axios from 'axios';
import socketIOClient from "socket.io-client";

import getConfig from 'next/config'
import { sleep } from '../../context/utils';
const { publicRuntimeConfig } = getConfig()
const SERVER_URL = publicRuntimeConfig.SERVER_URL;


interface Props {
    setPageStatus: Function
    round: number
    setRound: Function
    setPfps: Function
    gameData: any
    setGameData: Function
}

const GameStatusShow = (props: Props) => {

    const [players, setPlayers] = React.useState<any[]>([]);
    const [pfpArray, setPfpArray] = React.useState<any[]>([]);
    const [round1result, setRound1result] = React.useState<number[]>([])
    const [round2result, setRound2result] = React.useState<number[]>([])
    const [round3result, setRound3result] = React.useState<number[]>([])
    const [round4result, setRound4result] = React.useState<number[]>([])

    const [roundCountdown, setRoundCountdown] = React.useState(5);
    const [countdownShow, setCountdownShow] = React.useState(false)
    const [forceWaitingShow, setForceWaitingShow] = React.useState(true)
    // const [pfps, setPfps] = React.useState<any[]>([]);
    const pfps = new Map<string, string>();
    const wallet = useWallet();

    const checkStatus = async () => {
        let gamePoolData = await getGamePoolData();
        setPlayers(gamePoolData.players);
        setUserPfpsFunc(gamePoolData);
        // await Promise.allSettled(gamePoolData.players.map(async (player: string) => {
        //     let result = await axios.get(`${SERVER_URL}/api/get_player_info?player=${player}`)
        //     console.log(">>>>>>>>>>>>>>>>>player: ", player, result.data)
        //     if (result.status == 200) pfps.set(player, result.data.pfp)
        // }))
        // let pfpArrayTmp = [];
        // for (let i = 0; i < gamePoolData.players.length; i++) {
        //     pfpArrayTmp.push(pfps.get(gamePoolData.players[i]) ? pfps.get(gamePoolData.players[i]) : "https://dh5ldbe3dvj5maffoufi3evamiklis3my2gik44ql2fortazonpq.arweave.net/GfqxhJsdU9YApXUKjZKgYhS0S2zGjIVzkF6K6MwZc18?ext=png")
        // }

        // setPfpArray(pfpArrayTmp);
    }
    const countdownFunc = async () => {
        await sleep(1000)
        setRoundCountdown(4)
        await sleep(1000)
        setRoundCountdown(3)
        await sleep(1000)
        setRoundCountdown(2)
        await sleep(1000)
        setRoundCountdown(1)
        await sleep(1000)
        setRoundCountdown(0)
    }

    const startRound1 = async () => {

        await sleep(3000)
        setCountdownShow(true)
        await countdownFunc();
        setForceWaitingShow(false)
        await sleep(1000)
        setCountdownShow(false)
        await sleep(1000)
        props.setRound(1);
        props.setPageStatus("gameRoundShow")
        // await sleep(3000)
        // props.setRound(2);
        // await sleep(3000)
        // props.setRound(3);
    }

    const startRound2 = async () => {
        await sleep(3000)
        setCountdownShow(true)
        await countdownFunc();
        await sleep(1000)
        setCountdownShow(false)
        await sleep(1000)
        props.setRound(2);
        props.setPageStatus("gameRoundShow")
    }

    const startRound3 = async () => {
        await sleep(3000)
        setCountdownShow(true)
        await countdownFunc();
        await sleep(1000)
        setCountdownShow(false)
        await sleep(1000)
        props.setRound(3);
        props.setPageStatus("gameRoundShow")
    }

    const startRound4 = async () => {
        await sleep(3000)
        setCountdownShow(true)
        await countdownFunc();
        await sleep(1000)
        setCountdownShow(false)
        await sleep(1000)
        props.setRound(4);
        props.setPageStatus("gameRoundShow")
    }

    const startRound5 = async () => {
        setCountdownShow(false)
        await sleep(3000)
        // setCountdownShow(true)
        // await countdownFunc();
        // await sleep(1000)
        // await sleep(1000)
        props.setRound(5);
        props.setPageStatus("gameRoundShow")
    }

    const setUserPfpsFunc = async (data: any) => {
        await Promise.allSettled(data.players.map(async (player: string) => {
            let result = await axios.get(`${SERVER_URL}/api/get_player_info?player=${player}`)

            if (result.status == 200) pfps.set(player, result.data.pfp)
        }))
        let pfpArrayTmp = [];
        for (let i = 0; i < data.players.length; i++) {
            pfpArrayTmp.push(pfps.get(data.players[i]) ? pfps.get(data.players[i]) : "https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https%3A%2F%2Fbafybeihg4mg4265jbgb77izpufexe5ei2lw3rndbjy536pqmsue6ufdtyq.ipfs.dweb.link%2F9885.png%3Fext%3Dpng")
        }

        setPfpArray(pfpArrayTmp);

        if (data.players.length == 16 && props.round == 0 && !props.gameData) {
            props.setGameData(data);
            props.setPfps(pfpArrayTmp)
            await startRound1();
        }
    }

    React.useEffect(() => {
        if (props.round > 0) {
            setRoundCountdown(5)
            setPlayers(props.gameData.players);
            setUserPfpsFunc(props.gameData);
            setRound1result(props.gameData.round1Result);
            setRound2result(props.gameData.round2Result);
            setRound3result(props.gameData.round3Result);
            setRound4result(props.gameData.round4Result);


        }
    }, [props.round])

    React.useEffect(() => {
        if (props.round == 1) {

            startRound2();
        }
        if (props.round == 2) {

            startRound3();
        }
        if (props.round == 3) {

            startRound4();
        }
        if (props.round == 4) {

            startRound5();
        }

        if (wallet.connected && props.round == 0) checkStatus();

        console.log(props.round, "<<<<<<<<<<<<<<<<< round")

        const socket = socketIOClient(SERVER_URL);
        socket.on("game_play", data => {
            console.log('socket stat data received : ', data);
            setPlayers(data.players);
            setUserPfpsFunc(data);
        });


    }, [])


    return (
        <div className={styles.container}>
            <img src={'/img/KK_Logo_Text.png'} alt='kkMark' className={styles.gameMark} />
            <img src={'/img/GrandPrize.png'} alt='PrizeBox' className={styles.prizeBox} />
            <div className={styles.leftPanel}>
                <img src={'/img/LHS_Lines.png'} alt='lhs' className={styles.lhsLine} />

                {/* <div className={`${styles.r4Player1} ${styles.r4Player}`}>
                    <span className={styles.r4LockIcon}>
                        <LockIcon />
                    </span>
                </div> */}
                {/* round3 result */}
                <>
                    {
                        props.round < 3 ?
                            <div className={`${styles.r4Player} ${styles.r4Player1}`}>
                                <span className={styles.r4LockIcon}>

                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 3 || props.round > 3 && pfpArray.length == 16 && round4result.length == 1 && round3result.length == 2 && round3result[0] == round4result[0]) ?
                                <img src={pfpArray[round3result[0]]} alt='avatar' className={`${styles.r4RealAvatar} ${styles.r4Player1}`} /> :
                                <>
                                    <img src={pfpArray[(round3result[0] as number)]} alt='avatar' className={`${styles.r4UnrealAvatar} ${styles.r4Player1}`} />

                                    <span className={`${styles.crossIconR4} ${styles.r4Player1}`}>
                                        <span className={styles.r4crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }
                </>

                {/* round2 result */}
                <>
                    {
                        props.round < 2 ?
                            <div className={`${styles.r3Player} ${styles.r3PlayerL1}`}>
                                <span className={styles.r3LockIcon}>

                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 2 || props.round > 2 && pfpArray.length == 16 && round2result.length == 4 && round3result.length == 2 && round3result[0] == round2result[0]) ?
                                <img src={pfpArray[round2result[0]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r3PlayerL1}`} /> :
                                <>
                                    <img src={pfpArray[(round2result[0] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r3PlayerL1}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r3PlayerL1}`}>
                                        <span className={styles.crossIcon}>

                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }
                    {
                        props.round < 2 ?
                            <div className={`${styles.r3Player} ${styles.r3PlayerL2}`}>
                                <span className={styles.r3LockIcon}>

                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 2 || props.round > 2 && pfpArray.length == 16 && round2result.length == 4 && round3result.length == 2 && round3result[0] == round2result[1]) ?
                                <img src={pfpArray[round2result[1]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r3PlayerL2}`} /> :
                                <>
                                    <img src={pfpArray[(round2result[1] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r3PlayerL2}`} />
                                    <span className={`${styles.crossIconR2} ${styles.r3PlayerL2}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }
                </>

                {/* round1 result */}
                <>
                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerL1}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[0] == round1result[0]) ?
                                <img src={pfpArray[round1result[0]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerL1}`} /> :
                                <div className={styles.r2UnrealAvatarWrapper}>
                                    <img src={pfpArray[(round1result[0] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerL1}`} />

                                    <span className={styles.crossIcon}>
                                        <CrossIcon />
                                    </span>
                                </div>
                    }

                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerL2}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[0] == round1result[1]) ?
                                <img src={pfpArray[round1result[1]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerL2}`} /> :
                                <>
                                    <img src={pfpArray[(round1result[1] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerL2}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r2PlayerL2}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }

                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerL3}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :


                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[1] == round1result[2]) ?
                                <img src={pfpArray[round1result[2]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerL3}`} /> :
                                <>
                                    <img src={pfpArray[(round1result[2] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerL3}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r2PlayerL3}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }


                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerL4}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :


                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[1] == round1result[3]) ?
                                <img src={pfpArray[round1result[3]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerL4}`} /> :
                                <>
                                    <img src={pfpArray[(round1result[3] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerL4}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r2PlayerL4}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }

                </>



                {/* round0 result */}
                <>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL1}`}>

                        {
                            props.round == 0 && pfpArray.length < 1 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 1 && round1result.length > 0 && round1result[0] == 0) ?
                                        <img src={pfpArray[0]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[0]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL2}`}>
                        {
                            props.round == 0 && pfpArray.length < 2 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 2 && round1result.length > 0 && round1result[0] == 1) ?
                                        <img src={pfpArray[1]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[1]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL3}`}>
                        {
                            props.round == 0 && pfpArray.length < 3 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 3 && round1result.length > 1 && round1result[1] == 2) ?
                                        <img src={pfpArray[2]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[2]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL4}`}>
                        {
                            props.round == 0 && pfpArray.length < 4 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 4 && round1result.length > 1 && round1result[1] == 3) ?
                                        <img src={pfpArray[3]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[3]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL5}`}>
                        {
                            props.round == 0 && pfpArray.length < 5 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 5 && round1result.length > 2 && round1result[2] == 4) ?
                                        <img src={pfpArray[4]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[4]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL6}`}>
                        {
                            props.round == 0 && pfpArray.length < 6 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 6 && round1result.length > 2 && round1result[2] == 5) ?
                                        <img src={pfpArray[5]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[5]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL7}`}>
                        {
                            props.round == 0 && pfpArray.length < 7 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 7 && round1result.length > 3 && round1result[3] == 6) ?
                                        <img src={pfpArray[6]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[6]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerL8}`}>
                        {
                            props.round == 0 && pfpArray.length < 8 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 8 && round1result.length > 3 && round1result[3] == 7) ?
                                        <img src={pfpArray[7]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[7]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                </>


            </div>

            <div className={styles.rightPanel}>
                <img src={'/img/RHS_Lines.png'} alt='lhs' className={styles.rhsLine} />


                <>
                    {
                        props.round < 3 ?
                            <div className={`${styles.r4Player} ${styles.r4Player2}`}>
                                <span className={styles.r4LockIcon}>

                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 3 || props.round > 3 && pfpArray.length == 16 && round4result.length == 1 && round3result.length == 2 && round3result[1] == round4result[0]) ?
                                <img src={pfpArray[round3result[1]]} alt='avatar' className={`${styles.r4RealAvatar} ${styles.r4Player2}`} /> :
                                <>
                                    <img src={pfpArray[(round3result[1] as number)]} alt='avatar' className={`${styles.r4UnrealAvatar} ${styles.r4Player2}`} />

                                    <span className={`${styles.crossIconR4} ${styles.r4Player2}`}>
                                        <span className={styles.r4LockIcon}>

                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }
                </>

                <>
                    {
                        props.round < 2 ?
                            <div className={`${styles.r3Player} ${styles.r3PlayerR1}`}>
                                <span className={styles.r3LockIcon}>

                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 2 || props.round > 2 && pfpArray.length == 16 && round2result.length == 4 && round3result.length == 2 && round3result[1] == round2result[2]) ?
                                <img src={pfpArray[round2result[2]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r3PlayerR1}`} /> :
                                <>
                                    <img src={pfpArray[(round2result[2] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r3PlayerR1}`} />
                                    <span className={`${styles.crossIconR2} ${styles.r3PlayerR1}`}>

                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }
                    {
                        props.round < 2 ?
                            <div className={`${styles.r3Player} ${styles.r3PlayerR2}`}>
                                <span className={styles.r3LockIcon}>

                                    <LockIcon />
                                </span>
                            </div> :
                            (props.round == 2 || props.round > 2 && pfpArray.length == 16 && round2result.length == 4 && round3result.length == 2 && round3result[1] == round2result[3]) ?
                                <img src={pfpArray[round2result[3]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r3PlayerR2}`} /> :
                                <>
                                    <img src={pfpArray[(round2result[3] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r3PlayerR2}`} />
                                    <span className={`${styles.crossIconR2} ${styles.r3PlayerR2}`}>

                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }

                </>

                <>
                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerR1}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :


                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[2] == round1result[4]) ?
                                <img src={pfpArray[round1result[4]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerR1}`} /> :
                                <>
                                    <img src={pfpArray[(round1result[4] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerR1}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r2PlayerR1}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }

                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerR2}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :


                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[2] == round1result[5]) ?
                                <img src={pfpArray[round1result[5]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerR2}`} /> :
                                <>
                                    <img src={pfpArray[(round1result[5] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerR2}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r2PlayerR2}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }

                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerR3}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :


                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[3] == round1result[6]) ?
                                <img src={pfpArray[round1result[6]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerR3}`} /> :
                                <>
                                    <img src={pfpArray[(round1result[6] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerR3}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r2PlayerR3}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }

                    {
                        props.round == 0 ?
                            <div className={`${styles.r3Player} ${styles.r2PlayerR4}`}>
                                <span className={styles.r3LockIcon}>
                                    <LockIcon />
                                </span>
                            </div> :


                            (props.round == 1 || props.round > 1 && pfpArray.length == 16 && round1result.length == 8 && round2result.length == 4 && round2result[3] == round1result[7]) ?
                                <img src={pfpArray[round1result[7]]} alt='avatar' className={`${styles.r2RealAvatar} ${styles.r2PlayerR4}`} /> :
                                <>
                                    <img src={pfpArray[(round1result[7] as number)]} alt='avatar' className={`${styles.r2UnrealAvatar} ${styles.r2PlayerR4}`} />

                                    <span className={`${styles.crossIconR2} ${styles.r2PlayerR4}`}>
                                        <span className={styles.crossIcon}>
                                            <CrossIcon />
                                        </span>
                                    </span>
                                </>
                    }

                </>


                {/* r1 players */}
                <>
                    <div className={`${styles.r1Player} ${styles.r1PlayerR1}`}>
                        {
                            props.round == 0 && pfpArray.length < 9 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 9 && round1result.length > 4 && round1result[4] == 8) ?
                                        <img src={pfpArray[8]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[8]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerR2}`}>
                        {
                            props.round == 0 && pfpArray.length < 10 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 10 && round1result.length > 4 && round1result[4] == 9) ?
                                        <img src={pfpArray[9]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[9]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerR3}`}>
                        {
                            props.round == 0 && pfpArray.length < 11 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 11 && round1result.length > 5 && round1result[5] == 10) ?
                                        <img src={pfpArray[10]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[10]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerR4}`}>
                        {
                            props.round == 0 && pfpArray.length < 12 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 12 && round1result.length > 5 && round1result[5] == 11) ?
                                        <img src={pfpArray[11]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[11]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>

                    <div className={`${styles.r1Player} ${styles.r1PlayerR5}`}>
                        {
                            props.round == 0 && pfpArray.length < 13 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 13 && round1result.length > 6 && round1result[6] == 12) ?
                                        <img src={pfpArray[12]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[12]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerR6}`}>
                        {
                            props.round == 0 && pfpArray.length < 14 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 14 && round1result.length > 6 && round1result[6] == 13) ?
                                        <img src={pfpArray[13]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[13]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerR7}`}>
                        {
                            props.round == 0 && pfpArray.length < 15 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 15 && round1result.length > 7 && round1result[7] == 14) ?
                                        <img src={pfpArray[14]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[14]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                    <div className={`${styles.r1Player} ${styles.r1PlayerR8}`}>
                        {
                            props.round == 0 && pfpArray.length < 16 ?
                                <img src={'/img/avatar.png'} alt='avatar' className={styles.r1Avatar} /> :
                                (
                                    (props.round == 0 || props.round > 0 && pfpArray.length >= 16 && round1result.length > 7 && round1result[7] == 15) ?
                                        <img src={pfpArray[15]} alt='avatar' className={styles.r1RealAvatar} /> :
                                        <div className={styles.r1UnrealAvatarWrapper}>
                                            <img src={pfpArray[15]} alt='avatar' className={styles.r1UnrealAvatar} />
                                            <span className={styles.crossIcon}>
                                                <CrossIcon />
                                            </span>
                                        </div>
                                )
                        }
                    </div>
                </>
            </div>
            {
                (countdownShow || props.round == 0 && !countdownShow && forceWaitingShow) &&
                <div className={`${styles.waitingPanel} ${countdownShow && styles.countdownPanel}`}>
                    {
                        props.round == 0 && !countdownShow && forceWaitingShow &&

                        <>
                            <p className={styles.waitingText1}>
                                {pfpArray.length} &nbsp;/&nbsp;16
                            </p>
                            <p className={styles.waitingText2}>
                                WAITING FOR MORE PLAYERS
                            </p>
                        </>

                    }
                    {
                        countdownShow &&
                        <>
                            <p className={styles.countdown}>
                                {roundCountdown}
                            </p>
                            <p className={styles.startingRoundText}>
                                STARTING ROUND {props.round + 1}
                            </p>
                            <p className={styles.onlinePlayersText}>
                                {32 / Math.pow(2, props.round + 1)} Players Online
                            </p>
                        </>
                    }
                </div>
            }


        </div>
    )
}

export default GameStatusShow;

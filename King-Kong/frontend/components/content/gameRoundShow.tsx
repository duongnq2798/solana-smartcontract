/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
    WalletConnectButton
} from '@solana/wallet-adapter-react-ui';
import styles from './gameRoundShow.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import {
    lock as LockIcon
} from '../svgIcons'
import { getGamePoolData } from '../../context/script';
import axios from 'axios';
import socketIOClient from "socket.io-client";

import getConfig from 'next/config'
import { sleep } from '../../context/utils';
import { Wallet } from '@project-serum/anchor';
const { publicRuntimeConfig } = getConfig()
const SERVER_URL = publicRuntimeConfig.SERVER_URL;


interface Props {
    setPageStatus: Function,
    gameData: any,
    round: number,
    pfps: any[],
    setCurGameResult: Function
}

const GameRoundShow = (props: Props) => {
    const wallet = useWallet()

    const [player1Address, setPlayer1Address] = React.useState("")
    const [player2Address, setPlayer2Address] = React.useState("")
    const [player1Pfp, setPlayer1Pfp] = React.useState("")
    const [player2Pfp, setPlayer2Pfp] = React.useState("")
    const [roundResult, setRoundResult] = React.useState("")

    const gamePlay = async () => {
        let idx = props.gameData.players.indexOf(wallet.publicKey?.toBase58())
        setPlayer1Address(props.gameData.players[idx])
        setPlayer1Pfp(props.pfps[idx])
        if (props.round == 1) {
            if (idx % 2 == 1) {
                setPlayer2Address(props.gameData.players[idx - 1])
                setPlayer2Pfp(props.pfps[idx - 1])
            }
            else {
                setPlayer2Address(props.gameData.players[idx + 1])
                setPlayer2Pfp(props.pfps[idx + 1])
            }

            if (props.gameData.round1Result.indexOf(idx) < 0) {
                props.setCurGameResult("lost");
            }

            await sleep(1000)
            if (props.gameData.round1Result.indexOf(idx) >= 0) setRoundResult("win");
            else {
                setRoundResult("lost");

            }
        } else if (props.round == 2) {
            if (props.gameData.round1Result.indexOf(idx) >= 0) {
                let round2idx = props.gameData.round1Result.indexOf(idx);
                let round2player2idx = round2idx % 2 == 1 ? props.gameData.round1Result[round2idx - 1] : props.gameData.round1Result[round2idx + 1]
                setPlayer2Address(props.gameData.players[round2player2idx])
                setPlayer2Pfp(props.pfps[round2player2idx])

                if (props.gameData.round2Result.indexOf(idx) < 0) {
                    props.setCurGameResult("lost");
                }
                await sleep(1000)
                if (props.gameData.round2Result.indexOf(idx) >= 0) setRoundResult("win");
                else {
                    setRoundResult("lost");
                }
            } else {
                props.setPageStatus("landing")
            }
        } else if (props.round == 3) {
            if (props.gameData.round2Result.indexOf(idx) >= 0) {
                let round3idx = props.gameData.round2Result.indexOf(idx);
                let round3player2idx = round3idx % 2 == 1 ? props.gameData.round2Result[round3idx - 1] : props.gameData.round2Result[round3idx + 1]
                setPlayer2Address(props.gameData.players[round3player2idx])
                setPlayer2Pfp(props.pfps[round3player2idx])

                if (props.gameData.round3Result.indexOf(idx) < 0) {
                    props.setCurGameResult("lost");
                }
                await sleep(1000)
                if (props.gameData.round3Result.indexOf(idx) >= 0) setRoundResult("win");
                else {
                    setRoundResult("lost");
                }

            } else {
                props.setPageStatus("landing")
            }
        } else if (props.round == 4) {
            if (props.gameData.round3Result.indexOf(idx) >= 0) {
                let round4idx = props.gameData.round3Result.indexOf(idx);
                let round4player2idx = round4idx % 2 == 1 ? props.gameData.round3Result[round4idx - 1] : props.gameData.round3Result[round4idx + 1]
                setPlayer2Address(props.gameData.players[round4player2idx])
                setPlayer2Pfp(props.pfps[round4player2idx])

                if (props.gameData.round4Result.indexOf(idx) >= 0) {
                    props.setCurGameResult("win");
                } else {
                    props.setCurGameResult("lost");
                }
                await sleep(1000)
                if (props.gameData.round4Result.indexOf(idx) >= 0) {
                    setRoundResult("win");
                } else {
                    setRoundResult("lost");
                }

            } else {
                props.setPageStatus("landing")
            }
        } else if (props.round == 5) {
            if (props.gameData.round4Result.indexOf(idx) >= 0) {
                let round5idx = props.gameData.round4Result.indexOf(idx);
                let round5player2idx = round5idx % 2 == 1 ? props.gameData.round4Result[round5idx - 1] : props.gameData.round4Result[round5idx + 1]
                setPlayer2Address(props.gameData.players[round5player2idx])
                setPlayer2Pfp(props.pfps[round5player2idx])
            } else {
                props.setPageStatus("landing")
            }
        }
    }
    React.useEffect(() => {
        setRoundResult("")
        if (props.gameData && wallet.connected) {
            gamePlay();
        }
    }, [])

    return (
        <div className={styles.container}>
            <img src={'/img/KK_Logo_Text.png'} alt='kkMark' className={styles.gameMark} />

            <img src={player1Pfp} alt="player1" className={styles.leftPlayer} />
            <img src={player2Pfp} alt="player2" className={styles.rightPlayer} />
            {
                roundResult != "" &&
                <span className={`${styles.showResultLabel} ${roundResult == "win" && styles.successResult} ${roundResult == "lost" && styles.failResult}`}>
                    {
                        roundResult
                    }
                </span>
            }

        </div>
    )
}

export default GameRoundShow;

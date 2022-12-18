/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
    WalletConnectButton
} from '@solana/wallet-adapter-react-ui';
import styles from './content.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import LandingPage from './landingPage';
import GameStatusShow from './gameStatusShow';
import GameRoundShow from './gameRoundShow';
import { sleep } from '../../context/utils';



const Content = () => {
    const [showStatus, setShowStatus] = React.useState('landing');
    // const [player1Address, setPlayer1Address] = React.useState("");
    // const [player2Address, setPlayer2Address] = React.useState("");
    // const [player1Pfp, setPlayer1Pfp] = React.useState("");
    // const [player2Pfp, setPlayer2Pfp] = React.useState("");
    const [round, setRound] = React.useState(0);
    const [gameData, setGameData] = React.useState<any>();
    const [pfps, setPfps] = React.useState<any[]>([]);

    const [curGameResult, setCurGameResult] = React.useState("");

    const setCurrentRound = (round: number) => {
        setRound(round)
    }

    const toggleCurGameResult = (result: string) => {
        setCurGameResult(result)
        if (result == "lost") {
            localStorage.setItem("gameStatus", "lost");
        } else if (result == "win") {
            localStorage.setItem("gameStatus", "win");
        }
    }

    const toggleShowStatus2Round = async (status: string) => {
        if (curGameResult == "lost" || curGameResult == "win") {
            setShowStatus("landing");
        } else {
            setShowStatus("gameRoundShow");
            await sleep(5000)
            if (curGameResult == "lost" || curGameResult == "win") {
                setShowStatus("landing");
            } else {
                setShowStatus("gameStatus");
            }
        }
    }
    const wallet = useWallet();
    React.useEffect(() => {
        if (wallet.connected)
            console.log(wallet.publicKey?.toBase58());
    }, [wallet])


    return (
        <>
            <div className={styles.container}>
                <img src={'/img/BG.png'} alt='bg' className={styles.bgImg} />
                {

                    showStatus == 'landing' &&
                    <LandingPage
                        setPageStatus={(status: string) => setShowStatus(status)}
                    />
                }
                {
                    showStatus == 'gameStatus' &&
                    <GameStatusShow
                        setPageStatus={(status: string) => toggleShowStatus2Round(status)}
                        round={round}
                        setRound={(round: number) => setCurrentRound(round)}
                        setPfps={(pfpData: any[]) => setPfps(pfpData)}
                        gameData={gameData}
                        setGameData={(data: any) => setGameData(data)}
                    />
                }
                {
                    showStatus == 'gameRoundShow' &&
                    <GameRoundShow
                        setPageStatus={(status: string) => setShowStatus(status)}
                        gameData={gameData}
                        pfps={pfps}
                        round={round}
                        setCurGameResult={(result: string) => toggleCurGameResult(result)}
                    />
                }


            </div>

        </>
    )
}

export default Content;

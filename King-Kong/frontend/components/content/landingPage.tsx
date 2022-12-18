/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton,
    WalletConnectButton
} from '@solana/wallet-adapter-react-ui';
import styles from './landingPage.module.css';
import { useWallet } from '@solana/wallet-adapter-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import {
} from '../svgIcons'
import {
    rightArrow as RightArrowIcon,
    leftArrow as LeftArrowIcon,
    star as StarIcon,
    onebnn as OneBnnIcon,
    twobnn as TwoBnnIcon
} from '../svgIcons'
import { gamePlayTx, getGamePoolData, getGameState, getUserState } from '../../context/script';
import { buyBnn, claimReward, initUserPool, playGame } from '../../context/scripts';
import Divider from '@mui/material/Divider';
import axios from 'axios';
import {
    successAlert,
    errorAlert
} from "../toastGroup";


import {
    getParsedNftAccountsByOwner
} from "@nfteyez/sol-rayz";
import { web3 } from '@project-serum/anchor';

import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BANANA_TOKEN_DECIMAL, BANANA_TOKEN_MINT } from '../../context/types';
import { resourceLimits } from 'worker_threads';
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
const cluster = publicRuntimeConfig.SOLANA_NETWORK;
const SERVER_URL = publicRuntimeConfig.SERVER_URL;

let solConnection = new web3.Connection(web3.clusterApiUrl(cluster));

interface Props {
    setPageStatus: Function
}

const LandingPage = (props: Props) => {

    const wallet = useWallet();
    const [prePlayDialog, setPrePlayDialog] = React.useState(false);
    const [userNFTInfo, setUserNFTInfo] = React.useState<any[]>([]);
    const [userNFTInfoIdx, setUserNFTInfoIdx] = React.useState(0);
    const [showSelectAvatarDialog, setShowSelectAvatarDialog] = React.useState(false);
    const [bnnItemSelected, setBnnItemSelected] = React.useState(1);

    const [loading, setLoading] = React.useState(false);
    const [showRewardDialog, setShowRewardDialog] = React.useState(false);

    const enterGame = async () => {
        setPrePlayDialog(true);
    }

    const setCharacterSelected = (index: number) => {
        setUserNFTInfoIdx(index);
        setShowSelectAvatarDialog(false);
    }

    async function get_nft_api_rec(url: any, mint: any) {

        try {
            const response = await axios.get(url);
            // console.log(response.data.collection.name + '-' + response.status)
            if (response.status == 200) {
                let ColName = '';
                let collectionName = '';
                let familyName = '';
                if (response.data.collection) {
                    if (typeof (response.data.collection) === 'string') {
                        collectionName = response.data.collection;
                    } else if (response.data.collection.name) {
                        collectionName = response.data.collection.name;
                    }
                    if (response.data.collection.family) {
                        familyName = response.data.collection.family;
                    }
                }

                if (ColName == '') {
                    const colArray = response.data.name.split(" #");
                    ColName = colArray['0'];
                }

                const nftArray = response.data.name.split("#");
                let nftName = nftArray['1'] ? nftArray['1'] : response.data.name;

                return {
                    mint: mint,
                    projectname: ColName ? ColName : '',
                    collectionname: collectionName,
                    familyname: familyName,
                    nftname: nftName,
                    image: response.data.image,
                    symbol: response.data.symbol,
                    url: url
                };
            }
        } catch (error) {
            console.error(error);
        }

    }

    const getNFTInfo = async () => {
        var holderAccount: any[] = [];
        holderAccount.push({
            image: "https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https%3A%2F%2Fbafybeihg4mg4265jbgb77izpufexe5ei2lw3rndbjy536pqmsue6ufdtyq.ipfs.dweb.link%2F9885.png%3Fext%3Dpng",
            nftname: "Default"
        })
        if (!wallet.connected || !wallet.publicKey)
            return;
        var address = wallet.publicKey?.toBase58();
        const nftAccounts = await getParsedNftAccountsByOwner({ publicAddress: address, connection: solConnection });
        await Promise.allSettled(
            nftAccounts.map(async (holder) => {
                try {
                    let res = await get_nft_api_rec(holder.data.uri, holder.mint);
                    if (res?.image.indexOf("http") >= 0)
                        holderAccount.push({
                            // ...res,
                            // nftname: nftAccounts[j].data.name,
                            // nftname: holder.data.name,
                            // nfturi: holder.data.uri,
                            // mint: holder.mint
                            image: res?.image,
                            nftname: holder.data.name
                        });

                } catch (e) {
                    console.log(`   error occured ${e}`);
                };
            })
        );

        console.log(holderAccount)
        setUserNFTInfo(holderAccount);
    }

    const go2nextImg = () => {
        console.log(userNFTInfoIdx)
        if (userNFTInfoIdx < userNFTInfo.length - 1) setUserNFTInfoIdx(userNFTInfoIdx + 1);
    }

    const go2PrevImg = () => {
        console.log(userNFTInfoIdx)
        if (userNFTInfoIdx > 0) setUserNFTInfoIdx(userNFTInfoIdx - 1)
    }

    const buyBnns = async () => {
        let tokenAmount = bnnItemSelected * Math.pow(10, BANANA_TOKEN_DECIMAL);
        setLoading(true)
        setPrePlayDialog(false)

        await buyBnn(wallet, tokenAmount)
        successAlert("Token Purchase Successed!");

        setPrePlayDialog(true)
        setLoading(false)
    }

    const enterRound = async () => {
        if (!wallet.connected || !wallet.publicKey) return;
        await axios.post(`${SERVER_URL}/register_avatar_game`, {
            user: wallet.publicKey?.toBase58(),
            avatar: userNFTInfo[userNFTInfoIdx].image
        })

        console.log(userNFTInfo[userNFTInfoIdx].image)

        // userNFTInfo
        setPrePlayDialog(false)
        setLoading(true);
        let result = await playGame(wallet, 0, 0, 0, 0);
        console.log("game enter result : ", result);
        setLoading(false);
        if (result === 0) {
            successAlert("Game Entered Successfully!");
            props.setPageStatus('gameStatus');
            localStorage.setItem("gameStatus", "running")
        } else {
            errorAlert("Game Entering Failed!");
        }
    }

    const checkUserStatus = async () => {
        let gamePoolData = await getGamePoolData();
        let gameState = await getGameState();
        if (!wallet.publicKey) return;
        let userState = await getUserState(wallet.publicKey);
        if (userState?.winnerLast == 1 || gameState.winner == wallet.publicKey.toBase58()) {
            // claim reward
            setShowRewardDialog(true)
        }
        console.log("gamePoolData  >> ", gamePoolData)
        console.log("gameState  >> ", gameState)
        console.log("userState  >> ", userState)

        // enter the game if already entered.
        if (gamePoolData.players.includes(wallet.publicKey.toBase58()) && (localStorage.getItem("gameStatus") == "running" || !localStorage.getItem("gameStatus"))) {

            props.setPageStatus('gameStatus');
        }
    }

    const claimGameReward = async () => {
        setShowRewardDialog(false)
        setLoading(true);
        let result = await claimReward(wallet);
        if (result?.result == 0) {
            successAlert(result?.msg)
        } else {
            errorAlert(result?.msg)
            setShowRewardDialog(true)
        }
        setLoading(false);
        // setShowRewardDialog(true)
    }

    React.useEffect(() => {
        if (wallet.connected) {
            checkUserStatus();
            getNFTInfo();

        }

    }, [wallet])

    return (
        <>
            <img src={'/img/King_KK 1.png'} alt='LC' className={styles.lCharacter} />
            <img src={'/img/King_KK 2.png'} alt='RC' className={styles.rCharacter} />
            {
                !wallet.connected &&
                <img src={'/img/lightning_bolt_center.png'} alt='lightning' className={styles.cLightning} />
            }
            {

            }
            {
                wallet.connected &&
                <>
                    <img src={'/img/lightning_bolt_left.png'} alt='lightning' className={styles.lLightning} />
                    <div className={styles.gradientBG}>

                    </div>
                    <img src={'/img/lightning_bolt_right.png'} alt='lightning' className={styles.rLightning} />
                </>
            }
            {
                !wallet.connected ?
                    <img src={'/img/KK_Logo_Text.png'} alt='KK_Text' className={styles.kkText} /> :
                    <img src={'/img/KK_Logo_Text.png'} alt='KK_Text' className={styles.kkText2} />
            }



            <span className={styles.wltBtnWrapper}>
                {
                    !wallet.connected && !wallet.connecting &&
                    <WalletMultiButton />
                }
                {
                    wallet.connected &&
                    <>
                        <span className={styles.landingBtn} onClick={() => enterGame()}>
                            ENTER THE JUNGLE
                        </span>
                        <span className={styles.enteryFeeLabel}>
                            0.1 SOL
                        </span>
                    </>
                }
            </span>
            <Dialog
                sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                maxWidth="xs"
                open={wallet.connecting || loading}
                keepMounted
            >

                <DialogContent >
                    <div className={styles.starWrapper}>
                        <span className={styles.starIcon}>
                            <StarIcon />
                        </span>
                        <div className={styles.loading}>
                            Loading<div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                        </div>
                    </div>
                </DialogContent>

            </Dialog>
            <Dialog
                sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: 435 } }}
                maxWidth="md"
                open={prePlayDialog}
                keepMounted
            >

                <DialogContent >
                    <div className={`${styles.prePlayWrapper} ${showSelectAvatarDialog && styles.showSelectAvatarDialog}`}>
                        <div>
                            {
                                !showSelectAvatarDialog ?
                                    <>
                                        <p className={styles.dialogSubTitle}>
                                            Choose Character
                                        </p>
                                        <div className={styles.userNftsSelectPanel}>
                                            {
                                                userNFTInfoIdx > 0 &&
                                                <span className={styles.selectNftLeftArrow} onClick={() => go2PrevImg()}>
                                                    <LeftArrowIcon />
                                                </span>
                                            }
                                            {
                                                userNFTInfoIdx < userNFTInfo.length - 1 &&
                                                <span className={styles.selectNftRightArrow} onClick={() => go2nextImg()}>
                                                    <RightArrowIcon />
                                                </span>
                                            }

                                            {userNFTInfo.length > 0 &&
                                                <div className={`${styles.userNFTsImgWrapper}`}>
                                                    <img src={`${userNFTInfo[userNFTInfoIdx].image}`} className={`${styles.imgAvatar}`} alt="nft" />
                                                </div>
                                            }
                                            <p className={styles.nftNameLabel}>
                                                {
                                                    userNFTInfo.length > 0 &&
                                                    userNFTInfo[userNFTInfoIdx].nftname
                                                }
                                            </p>
                                            {/* {
                                    userNFTInfo.map((value, index) => {
                                        return (
                                            <div key={index} className={`${styles.userNFTsImgWrapper}`}>
                                                <img src={`${value.image}`} className={`${styles.imgAvatar}`} alt="nft" />
                                            </div>
                                        )
                                    })
                                } */}
                                        </div>

                                        <button className={styles.bottomBtn} onClick={() => setShowSelectAvatarDialog(true)}>
                                            CHANGE CHARACTER
                                        </button>
                                    </> :
                                    <>
                                        <p className={styles.dialogSubTitle}>
                                            Choose Character
                                        </p>
                                        <div className={styles.nftsSelectDialogContainer}>
                                            {
                                                userNFTInfo.map((value, index) => {
                                                    return (
                                                        <div key={index} className={styles.userNftsSelectCard}>
                                                            <div className={`${styles.userNFTsImgSelectDialogWrapper} ${index == userNFTInfoIdx && styles.userNFTInfoIdx}`} onClick={() => setCharacterSelected(index)}>
                                                                <img src={`${value.image}`} className={`${styles.imgSelectAvatar}`} alt="nft" />
                                                            </div>
                                                            <p className={styles.nftSelectLabel}>
                                                                {
                                                                    value.nftname
                                                                }
                                                            </p>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </>
                            }

                        </div>
                        {
                            !showSelectAvatarDialog &&
                            <>
                                <Divider orientation="vertical" flexItem>
                                </Divider>
                                <div>
                                    <p className={styles.dialogSubTitle}>
                                        My Bananas
                                    </p>
                                    <div className={styles.bnnPanel}>
                                        <div className={`${styles.buyBnnItemWrapper} ${bnnItemSelected === 1 && styles.bnnItemSelected}`} onClick={() => setBnnItemSelected(1)}>
                                            <span className={styles.bnnIcon}>
                                                <OneBnnIcon />
                                            </span>
                                            <p className={styles.buyBnnSubDescription}>
                                                <span className={styles.bnnPriceLabel}>
                                                    1
                                                </span>
                                                &nbsp;Banana for
                                                &nbsp;<span className={styles.bnnPriceLabel}>
                                                    0.1 SOL
                                                </span>
                                            </p>
                                        </div>
                                        <div className={`${styles.buyBnnItemWrapper} ${bnnItemSelected === 2 && styles.bnnItemSelected}`} onClick={() => setBnnItemSelected(2)} >
                                            <span className={styles.bnnIcon}>
                                                <TwoBnnIcon />
                                            </span>
                                            <p className={styles.buyBnnSubDescription}>
                                                <span className={styles.bnnPriceLabel}>
                                                    2
                                                </span>
                                                &nbsp;Bananas for
                                                &nbsp;<span className={styles.bnnPriceLabel}>
                                                    0.2 SOL
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <button className={styles.bottomBtn} onClick={() => buyBnns()}>
                                            BUY BANANAS
                                        </button>
                                    </div>
                                </div>
                            </>
                        }

                    </div>

                    <div className={styles.startBtnWrapper}>

                        {
                            !showSelectAvatarDialog &&
                            <button onClick={() => enterRound()} className={styles.startBtn}>
                                Start Game
                            </button>
                        }
                    </div>

                </DialogContent>

            </Dialog>

            <Dialog
                sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
                maxWidth="xs"
                open={showRewardDialog}
                keepMounted
            >
                <DialogContent >
                    <p className={styles.claimGameRewardDialogTitle}>
                        Claim Game Reward
                    </p>
                    <div className={styles.claimGameRewardDialogContent}>
                        <img src="/img/GrandPrize.png" alt="prize" className={styles.claimGameRewardImg} />
                        <button onClick={claimGameReward} className={styles.claimGameRewardBtn}>
                            Claim Reward
                        </button>
                    </div>
                </DialogContent>

            </Dialog>
        </>
    )
}

export default LandingPage;

import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Content from '../components/content/content'
import LeaderboardContent from '../components/leaderboard'
import Footer from '../components/navbar/footer'
import TopBar from '../components/navbar/topbar'
import StatsContent from '../components/stats'
import styles from '../styles/Home.module.css'

const Stats: NextPage = () => {
    return (
        <div className={styles.container}>
            <Head>
                <title>King Kong Game</title>
                <meta name="description" content="king kong game" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <TopBar />
            <StatsContent />

        </div>
    )
}

export default Stats

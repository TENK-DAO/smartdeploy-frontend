import { Roboto } from 'next/font/google'
import { use, useEffect, useState } from 'react'
import { isAllowed, setAllowed, getUserInfo, getPublicKey, isConnected, getNetwork } from '@stellar/freighter-api'
import styles from './style.module.css'
import { useThemeContext } from '../../context/ThemeContext'
import { useWalletContext } from '../../context/WalletContext'

const roboto = Roboto({ weight: ['400', '700'], subsets: ['latin'] })

export default function WalletInfo() {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    // Import the wallet Context
    const walletContext = useWalletContext();

    async function connect() {
        const freighterConnected = await isConnected();
        if (!freighterConnected) {
            walletContext.setHasFreighter(false);
        }
        else {
            await setAllowed();
            if (await isAllowed()) {
                walletContext.setAddress(await getPublicKey());
                walletContext.setNetwork(await getNetwork());
                walletContext.setConnected(true);
            }
        }
    }

    async function stayConnected() {
        if (await isAllowed()) {
            walletContext.setConnected(true);
        }
    }

    useEffect(() => {
        stayConnected();
    }, [])

    async function refetchWalletInfo() {
        const userInfo = await getUserInfo();
        if (userInfo.publicKey != "") {
            walletContext.setAddress(userInfo.publicKey);
            walletContext.setNetwork(await getNetwork());
            walletContext.setConnected(true);
        } else {
            walletContext.setConnected(false);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (walletContext.connected) {
                refetchWalletInfo();
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [walletContext.connected])

    return (
        <div className={`${styles.walletInfo} ${roboto.className}`} data-theme={activeTheme}>
            <>
                {(!walletContext.address && walletContext.hasFreighter) || (!walletContext.connected) ? (
                    <button className={styles.connectButton} onClick={() => connect()}><b>Connect Wallet</b></button>
                ) : !walletContext.hasFreighter ? (
                    <p>You don't have <a href="https://www.freighter.app/" target="_blank">Freighter extension</a></p>
                ) : (
                    <>
                        <div className={styles.card} data-theme={activeTheme}>{walletContext.network}</div>
                        <div className={styles.card} data-theme={activeTheme}>{walletContext.address.substring(0, 4) + "..." + walletContext.address.slice(-4)}</div>
                    </>
                )}
            </>
        </div>
    )
}
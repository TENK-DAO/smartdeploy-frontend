import { Inter } from 'next/font/google'
import { useEffect, useState } from 'react';
import { isAllowed, setAllowed, getUserInfo, getPublicKey, isConnected, getNetwork } from '@stellar/freighter-api';
import { StateVariablesProps } from '@/pages';
import styles from './style.module.css';
import { useThemeContext } from '../ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export default function WalletInfo(props: StateVariablesProps) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    const [showWallet, setShowWallet] = useState(false);

    async function connect() {
        const freighterConnected = await isConnected();
        if (!freighterConnected) {
            props.walletInfo.setHasFreighter(false);
        }
        else {
            await setAllowed();
            if (await isAllowed()) {
                const publicKey = await getPublicKey();
                const network   = await getNetwork();
                props.walletInfo.setAddress(publicKey);
                props.walletInfo.setNetwork(network);
                props.walletInfo.setConnected(true);
            }
        }
    }

    async function stayConnected() {
        if (await isAllowed()) {
          const publicKey = await getUserInfo();
          const network   = await getNetwork();
          props.walletInfo.setAddress(publicKey.publicKey);
          props.walletInfo.setNetwork(network);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
          setShowWallet(true);
        }, 1000);
        stayConnected();
        return () => clearTimeout(timer);
    }, []);


    return (
        <div className={`${styles.walletInfo} ${inter.className}`} data-theme={activeTheme}>
            {showWallet && (
                <>
                {!props.walletInfo.address && props.walletInfo.hasFreighter ? (
                    <button className={styles.connectButton} onClick={() => connect()}><b>Connect Wallet</b></button>
                ) : !props.walletInfo.hasFreighter ? (
                    <p>You don't have <a href="https://www.freighter.app/" target="_blank">Freighter extension</a></p>
                ) : (
                    <>
                        <div className={styles.card} data-theme={activeTheme}>{props.walletInfo.network}</div>
                        <div className={styles.card} data-theme={activeTheme}>{props.walletInfo.address.substring(0, 4) + "..." + props.walletInfo.address.slice(-4)}</div>
                    </>
                )}
                </>
            )}
        </div>
    )
}
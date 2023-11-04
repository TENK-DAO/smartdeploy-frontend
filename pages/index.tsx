import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useState, Dispatch, SetStateAction } from 'react'
import styles from '@/styles/Home.module.css'
import WalletInfo from '@/components/wallet'
import PublishedTab from '@/components/published-tab'
import DeployedTab from '@/components/deployed-tab'
import PopupDappInfo from '@/components/dapp-info-popup'
import { FaDiscord, FaTwitter, FaGithub } from "react-icons/fa";
import { BsFillSunFill } from 'react-icons/bs'
import { MdNightlightRound } from 'react-icons/md'
import { Contract, networks } from 'smartdeploy-client';
import { useThemeContext } from '../components/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

// Smartdeploy Contract Instance
export const smartdeploy = new Contract({
  networkPassphrase: "Test SDF Network ; September 2015",
  contractId: "CDNOMEB3ZQHS5WPCUPQ7IS4OKGTOTBRDCZUITBRNSQAB63JJ52JFO4KX",
  rpcUrl: 'https://soroban-testnet.stellar.org:443',
});

export type UserWalletInfo = {
  connected: boolean;
  setConnected: Dispatch<SetStateAction<boolean>>;
  hasFreighter: boolean;
  setHasFreighter: Dispatch<SetStateAction<boolean>>;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
  network: string;
  setNetwork: Dispatch<SetStateAction<string>>;
}

export type FetchDatas = {
  fetch: boolean;
  setFetch: Dispatch<SetStateAction<boolean>>;
}

export type StateVariablesProps = {
  walletInfo: UserWalletInfo;
  fetchDeployed?: FetchDatas;
  fetchPublished?: FetchDatas;
}

export default function Home() {

  // Import the current Theme
  const { activeTheme, setActiveTheme, inactiveTheme } = useThemeContext();

  // State variables from Freighter Wallet
  const [connected, setConnected] = useState<boolean>(false);
  const [hasFreighter, setHasFreighter] = useState<boolean>(true);
  const [address, setAddress] = useState<string>("");
  const [network, setNetwork] = useState<string>("");

  // Parse state variables regarding the Freighter's infos
  const userWalletInfo: UserWalletInfo = {
    connected,
    setConnected,
    hasFreighter,
    setHasFreighter,
    address,
    setAddress,
    network,
    setNetwork,
  }

  // State variable to fetch the published contracts
  const [fetchPublishedContracts, setFetchPublishedContracts] = useState<boolean>(true);

  // Parse state variable for fetching the deployed contracts
  const parsedFetchPublishedContracts: FetchDatas = {
    fetch: fetchPublishedContracts,
    setFetch: setFetchPublishedContracts,
  }

  // State variable to fetch the deployed contracts
  const [fetchDeployedContracts, setFetchDeployedContracts] = useState<boolean>(true);

  // Parse state variable for fetching the deployed contracts
  const parsedFetchDeployedContracts: FetchDatas = {
    fetch: fetchDeployedContracts,
    setFetch: setFetchDeployedContracts,
  }

  return (
    <>
      <Head>
        <title>SmartDeploy Dapp</title>
        <meta name="description" content="A framework for publishing, deploying, and upgrading Soroban smart contracts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/sd-logo-det.ico" />
      </Head>

      <div className={styles.headerBar} data-theme={activeTheme}>
        <div className={styles.container} data-theme={activeTheme}>
          <div className={styles.social} data-theme={activeTheme}>
            {activeTheme === 'dark' ? (
              <a
                href="https://www.smartdeploy.dev/"
                rel="noopener noreferrer"
              >
                <Image
                  className={styles.socialItem}
                  src="/sd-logo-written-header-white.svg"
                  alt="SmartDeploy Logo"
                  width={127}
                  height={26}
                  priority
                />
              </a>
            ) : (
              <a
                href="https://www.smartdeploy.dev/"
                rel="noopener noreferrer"
              >
                <Image
                  className={styles.socialItem}
                  src="/sd-logo-written-header-black.svg"
                  alt="SmartDeploy Logo"
                  width={127}
                  height={26}
                  priority
                />
              </a>
            )}
            <a
              href="https://github.com/TENK-DAO/smartdeploy"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub className={styles.socialItem} style={{ fill: 'var(--social-item)' }}/>
            </a>
            <a
              href="https://discord.com/invite/6fKqnSfr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaDiscord className={styles.socialItem} style={{ fill: 'var(--social-item)' }}/>
            </a>
            <a
              href="https://twitter.com/TENKDAO"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className={styles.socialItem} style={{ fill: 'var(--social-item)' }}/>
            </a>
          </div>
          <WalletInfo walletInfo={userWalletInfo}/>
          { activeTheme === "dark" ? (
              <BsFillSunFill  className={styles.themeChange}
                              style={{ fill: 'var(--social-item)' }}
                              onClick={() => {
                                localStorage.setItem("theme", inactiveTheme);
                                setActiveTheme(inactiveTheme);
                              }} />
            ) : (
              <MdNightlightRound  className={styles.themeChange}
                                  style={{ fill: 'var(--social-item)' }}
                                  onClick={() => {
                                    localStorage.setItem("theme", inactiveTheme);
                                    setActiveTheme(inactiveTheme);
                                  }} />
          )}
        </div>
      </div>

      <main className={`${styles.main} ${inter.className}`} data-theme={activeTheme}>

        <div className={styles.center} data-theme={activeTheme}>
          { activeTheme === "dark" ? (
            <Image
              className={styles.logoW}
              src="/sd-logo-written-white.svg"
              alt="SmartDeploy Logo"
              width={340}
              height={70}
              priority
            />
          ) : (
            <Image
              className={styles.logoB}
              src="/sd-logo-written-black.svg"
              alt="SmartDeploy Logo"
              width={340}
              height={70}
              priority
            />
          )}
          <p className={styles.smartdeployMessage} data-theme={activeTheme}>A framework for publishing, deploying, invoking and upgrading Soroban smart contracts</p>
        </div>

        <PopupDappInfo/>
        <PublishedTab walletInfo={userWalletInfo} fetchDeployed={parsedFetchDeployedContracts} fetchPublished={parsedFetchPublishedContracts}/>
        <DeployedTab fetch={fetchDeployedContracts} setFetch={setFetchDeployedContracts}/>
        
        <div className={styles.grid}>
          <a
            href="https://github.com/TENK-DAO/smartdeploy/blob/main/README.md"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 data-theme={activeTheme}>
              Docs <span>-&gt;</span>
            </h2>
            <p data-theme={activeTheme}>
              Learn how to deploy, invoke and upgrade contracts with smartdeploy
            </p>
          </a>

          <a
            href="https://github.com/TENK-DAO/smartdeploy/blob/main/README.md"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 data-theme={activeTheme}>
              Setup <span>-&gt;</span>
            </h2>
            <p data-theme={activeTheme}>
              Install the smartdeploy-CLI to fully use all its functionnalities
            </p>
          </a>
        </div>        

        

      </main>

      <div className={styles.footer} data-theme={activeTheme}>
        <div className={styles.left} data-theme={activeTheme}>
          <p>© {new Date().getFullYear()} SmartDeploy. All rights reserved.</p>
        </div>
        <div className={styles.tenkLogo}>
          <a
              href="https://tenk.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              By{' '}
              <Image
                src="/TENK_logo-det.svg"
                alt="Tenk Logo"
                width={110}
                height={26}
                priority
              />
            </a>
        </div>
        <div className={styles.right} data-theme={activeTheme}>
          <a
            href="https://smartdeploy.dev/privacy"
            target='_blank'
            data-theme={activeTheme}
            >
              <p>Privacy Policy</p>
          </a>
          <a
            href="https://smartdeploy.dev/terms"
            target='_blank'
            data-theme={activeTheme}
            >
              <p>Terms Of Use</p>
          </a>
          <a
            href="https://smartdeploy.dev/contact"
            target='_blank'
            data-theme={activeTheme}
            >
              <p>Contact Us</p>
          </a>
        </div>
      </div>

    </>
  )
}

import Head from 'next/head'
import Image from 'next/image'
import { Roboto } from 'next/font/google'
import { useState, Dispatch, SetStateAction } from 'react'
import styles from '@/styles/Home.module.css'
import WalletInfo from '@/components/wallet'
import PublishedTab from '@/components/published-tab'
import DeployedTab from '@/components/deployed-tab'
import PopupDappInfo from '@/components/dapp-info-popup'
import { 
  getDeployEvents, DeployEventData,
  getPublishEvents, PublishEventData,
  getClaimEvents, ClaimEventData,
} from '@/mercury_indexer/smartdeploy-api-client'
import { FaDiscord, FaTwitter, FaGithub } from "react-icons/fa"
import { BsFillSunFill } from 'react-icons/bs'
import { MdNightlightRound } from 'react-icons/md'
import { Contract, networks } from 'smartdeploy-client'
import { useThemeContext } from '../context/ThemeContext'

const roboto = Roboto({ weight: ['400', '700'], subsets: ['latin'] })

// Smartdeploy Contract Instance
export const smartdeploy = new Contract({
  ...networks.testnet,
  rpcUrl: 'https://soroban-testnet.stellar.org:443',
});

export default function Home() {

  // Import the current Theme
  const { activeTheme, setActiveTheme, inactiveTheme } = useThemeContext();

  const [deployEvents, setDeployEvents] = useState<DeployEventData[] | undefined>([]);
  const [publishEvents, setPublishEvents] = useState<PublishEventData[] | undefined>([]);
  const [claimEvents, setClaimEvents] = useState<ClaimEventData[] | undefined>([]);

  let newPublishEvents = getPublishEvents();
  // Update publishEvents if necessary
  if (newPublishEvents != publishEvents) {
      setPublishEvents(newPublishEvents);
  }
  console.log("PUBLISH EVENTS: ", publishEvents)

  let newDeployEvents = getDeployEvents();
  // Update deployEvents if necessary
  if (newDeployEvents != deployEvents) {
      setDeployEvents(newDeployEvents);
  }
  console.log("DEPLOY EVENTS: ", deployEvents)

  let newClaimEvents = getClaimEvents();
  // Update deployEvents if necessary
  if (newClaimEvents != claimEvents) {
      setClaimEvents(newClaimEvents);
  }
  console.log("CLAIM EVENTS: ", claimEvents)

  return (
    <>
      <Head>
        <title>SmartDeploy Dapp</title>
        <meta name="description" content="A framework for publishing, deploying, and upgrading Soroban smart contracts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/sd-logo-det.ico" />
      </Head>

      <div className={`${styles.headerBar} ${roboto.className}`} data-theme={activeTheme}>
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
          <WalletInfo/>
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

      <main className={`${styles.main} ${roboto.className}`} data-theme={activeTheme}>

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
        <PublishedTab publishEvents={publishEvents} deployEvents={deployEvents}/>
        <DeployedTab deployEvents={deployEvents} claimEvents={claimEvents}/>
        
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

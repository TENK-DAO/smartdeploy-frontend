import styles from './style.module.css';

import { DeployEventData, ClaimEventData, fetchTtlContractsData } from '@/mercury_indexer/smartdeploy-api-client';
import { DeployedContract, listAllDeployedContracts, getMyDeployedContracts, formatCountDown, bumpAndQueryNewTtl } from './backend';
import { useState, useEffect } from "react";
import { DeployedTabContent } from './deployed-tab-content';
import { ToggleButtons, Tab } from './toggle-button-component';
import { FcOk } from "react-icons/fc";
import { IoMdCloseCircle } from "react-icons/io";
import CopyComponent from './copy-component';
import { useThemeContext } from '../../context/ThemeContext'
import { useWalletContext } from '../../context/WalletContext'
import { useTimeToLiveContext, TimeToLive } from '../../context/TimeToLiveContext'
import { format } from 'date-fns'
import axios from 'axios';
import endpoints from '@/endpoints.config';

const LEDGERS_TO_EXTEND = 535_679;

export default function DeployedTab({
    deployEvents,
    claimEvents,
} : {
    deployEvents: DeployEventData[] | undefined,
    claimEvents: ClaimEventData[] | undefined
}) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();
    // Import wallet infos
    const walletContext = useWalletContext();
    // Import expiration infos
    const timeToLiveMap = useTimeToLiveContext(); 

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<Tab>(Tab.All);
    const [allDeployedContracts, setAllDeployedContracts] = useState<DeployedContract[]>([]);
    const [myDeployedContracts, setMyDeployedContracts] = useState<DeployedContract[] | undefined>([]);

    // useEffect to have All Deployed Contracts
    useEffect(() => {

        async function fetchDeployedContracts() {
            try {
                const datas = await listAllDeployedContracts(deployEvents, claimEvents);
                if (datas != 0) {
                    setAllDeployedContracts(datas as DeployedContract[]);
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
                window.alert(error);
                setError(true);
            }
        }

        fetchDeployedContracts();

    }, [deployEvents, claimEvents]);

    // useEffect to have My Published Contracts
    useEffect(() => {

        if (walletContext.address !== "") {
            const myDeployedContracts = getMyDeployedContracts(allDeployedContracts, walletContext.address);
            setMyDeployedContracts(myDeployedContracts);
        }
        
    }, [allDeployedContracts, walletContext.address])

    // useEffect to fetch bumping data (only when the page load)
    useEffect(() => {

        async function fillAddressToTtlMap() {

            let latestLedger = (await axios.get(endpoints.rpc_endpoint)).data.history_latest_ledger;
            let ttl_datas = await fetchTtlContractsData();

            ///@ts-ignore
            ttl_datas.forEach((data) => {

                // Convert TTL in a date
                const timeToLiveLedger = data.live_until_ttl - latestLedger;
                const timeToLiveSeconds = timeToLiveLedger * 5;
                const now = new Date();
                const expirationDate = format(now.getTime() + timeToLiveSeconds * 1000, "MM/dd/yyyy");

                if (!data.automatic_bump) {
                    timeToLiveMap.setAddressToTtl(prevMap => {
                        const updatedMap = new Map(prevMap);
                        updatedMap.set(data.contract_id as string, {automaticBump: false, date: expirationDate});
                        return updatedMap;
                    })
                } else {
                    timeToLiveMap.setAddressToTtl(prevMap => {
                        const updatedMap = new Map(prevMap);
                        updatedMap.set(data.contract_id as string, {
                            automaticBump: true,
                            date: expirationDate,
                            ttlSec: timeToLiveSeconds,
                            countdown: formatCountDown(timeToLiveSeconds)
                        });
                        return updatedMap;
                    })
                }
            });
        }

        fillAddressToTtlMap();

    }, [])

    // useEffect to count down the next bump
    useEffect(() => {

        const interval = setInterval(() => {

            const newMap = new Map<String, TimeToLive>(timeToLiveMap.addressToTtl);

            newMap.forEach((ttl, address) => {

                if (ttl.ttlSec !== undefined) {

                    // If the contract expire in less than 5 minutes (300 seconds), bump it and update the countdown
                    if (ttl.ttlSec > 300) {
                        const newValue = {
                            ...ttl,
                            ttlSec: ttl.ttlSec - 60,
                            countdown: formatCountDown(ttl.ttlSec - 60)
                        }
                        newMap.set(address, newValue);
                    }
                    else {
                        bumpAndQueryNewTtl(address, LEDGERS_TO_EXTEND, ttl, newMap);
                    }

                }

            })

            timeToLiveMap.setAddressToTtl(newMap);
            
        }, 1000 * 60);

        return () => clearInterval(interval);

    }, [timeToLiveMap.addressToTtl]);

    if (loading) {

        return (
            <div>
                <ToggleButtons selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                {selectedTab == Tab.All ? (
                    <DeployedTabContent title='ALL DEPLOYED CONTRACTS' displayedContracts="Loading..."/>
                ) : (
                    walletContext.connected ? (
                        <DeployedTabContent title='MY DEPLOYED CONTRACTS' displayedContracts="Loading..."/>
                    ) : (
                        <DeployedTabContent title='MY DEPLOYED CONTRACTS' displayedContracts="Wallet not connected. Connect your Stellar account to see your deployed contracts."/>
                    )
                )}
            </div>
        )       
    }        

    else if (error) { throw new Error("Error when trying to fetch Deployed Contracts") }

    else if (allDeployedContracts && selectedTab == Tab.All) {    

        const allDeployedContractsRows: JSX.Element[] = [];

        allDeployedContracts.forEach((deployedContract) => {

            var version_string = undefined;
            if (deployedContract.version) {
                version_string = `v.${deployedContract.version.major}.${deployedContract.version.minor}.${deployedContract.version.patch}`;
            }

            allDeployedContractsRows.push(
                <tr key={deployedContract.index} data-theme={activeTheme} className={styles.relativeRow}>
                    <td className={styles.contractCell}>{deployedContract.name}</td>
                    <td>{deployedContract.address}</td>
                    <td>
                        <div className={styles.fromTd}>
                            {deployedContract.version ? (
                                <p>{deployedContract.fromPublished}</p>
                            ) : (
                                <CopyComponent hash={deployedContract.fromPublished} />
                            )}
                            <p>{version_string && `(${version_string})`}</p>
                        </div>
                    </td>
                    <td>
                    <div className={styles.ttlTd}>
                        <p>{timeToLiveMap.addressToTtl.get(deployedContract.address)?.date}</p>
                        {timeToLiveMap.addressToTtl.get(deployedContract.address)?.automaticBump ? (
                            <p className={styles.bumpLine}><FcOk/>bump in: {timeToLiveMap.addressToTtl.get(deployedContract.address)?.countdown}</p>
                        ) : (
                            <p className={styles.bumpLine}><IoMdCloseCircle style={{ fill: 'rgb(224, 16, 16)' }}/>No automatic bump</p>
                        )}
                    </div>
                    </td>
                </tr>
            );
        });

        return(
            <div>
                <ToggleButtons selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                <DeployedTabContent title='ALL DEPLOYED CONTRACTS' displayedContracts={allDeployedContractsRows}/>
            </div>
        )
    }

    else if (myDeployedContracts && selectedTab == Tab.My) {

        const myDeployedContractsRows: JSX.Element[] = [];

        myDeployedContracts.forEach((deployedContract) => {

            var version_string = "no_evt_data";
            if (deployedContract.version) {
                version_string = `v.${deployedContract.version.major}.${deployedContract.version.minor}.${deployedContract.version.patch}`;
            }

            myDeployedContractsRows.push(
                <tr key={deployedContract.index} data-theme={activeTheme}>
                    <td className={styles.contractCell}>{deployedContract.name}</td>
                    <td>{deployedContract.address}</td>
                    <td>
                        <div className={styles.fromTd}>
                            <p>{deployedContract.fromPublished}</p>
                            <p>({version_string})</p>
                        </div>
                    </td>
                    <td>
                        <div className={styles.ttlTd}>
                            <p>{timeToLiveMap.addressToTtl.get(deployedContract.address)?.date}</p>
                            {timeToLiveMap.addressToTtl.get(deployedContract.address)?.automaticBump ? (
                                <p className={styles.bumpLine}><FcOk/>bump in: {timeToLiveMap.addressToTtl.get(deployedContract.address)?.countdown}</p>
                            ) : (
                                <p className={styles.bumpLine}><IoMdCloseCircle style={{ fill: 'rgb(224, 16, 16)' }}/>No automatic bump</p>
                            )}
                        </div>
                    </td>
                </tr>
            );
        })

        return(
            <div>
                <ToggleButtons selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                {walletContext.connected ? (
                    myDeployedContracts.length > 0 ? (
                        <DeployedTabContent title='MY DEPLOYED CONTRACTS' displayedContracts={myDeployedContractsRows}/>
                    ) : (
                        <DeployedTabContent title='MY DEPLOYED CONTRACTS' displayedContracts="You haven't published or deployed any contract yet"/>
                    )
                ) : (
                    <DeployedTabContent title='MY DEPLOYED CONTRACTS' displayedContracts="Wallet not connected. Connect your Stellar account to see your deployed contracts."/>
                )}
            </div>
        )
    }

}
import styles from './style.module.css';

import { useThemeContext } from '../../context/ThemeContext'
import { useState, useEffect } from 'react';
import { PublishTabContent } from './publish-tab-content';
import { ToggleButtons, Tab } from './toggle-button-component';
import { Version } from 'smartdeploy-client'
import { PublishEventData, DeployEventData } from '@/mercury_indexer/smartdeploy-api-client';
import { PublishedContract, listAllPublishedContracts, getMyPublishedContracts } from './backend'
import { DeployVersionComponent } from './deploy-components'
import { useWalletContext } from '../../context/WalletContext'

export default function PublishedTab({
    publishEvents,
    deployEvents
} : {
    publishEvents: PublishEventData[] | undefined,
    deployEvents: DeployEventData[] | undefined
}) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();
    // Import wallet infos
    const walletContext = useWalletContext();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState<Tab>(Tab.All);
    const [allPublishedContracts, setAllPublishedContracts] = useState<PublishedContract[]>([]);
    const [myPublishedContracts, setMyPublishedContracts] = useState<PublishedContract[]>([]);

    // useEffect to have All Published Binaries
    useEffect(() => {

        async function fetchAllPublishedContracts() {
            try {
              const datas = await listAllPublishedContracts(deployEvents);
              if (datas != 0) {
                  setAllPublishedContracts(datas as PublishedContract[]);
                  setLoading(false);
              }
            } catch (error) {
                console.error(error);
                window.alert(error);
                setError(true);
            }
        }

        fetchAllPublishedContracts();

    }, [publishEvents, deployEvents])

    // useEffect to have My Published Binaries
    useEffect(() => {

        if ((walletContext.address !== "") && deployEvents) {
            const myPublishedContracts = getMyPublishedContracts(allPublishedContracts, deployEvents, walletContext.address);
            setMyPublishedContracts(myPublishedContracts);
        }

    }, [allPublishedContracts, walletContext.address])
    
    if (loading) {

        return (
            <div>
                <ToggleButtons selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                {selectedTab == Tab.All ? (
                    <PublishTabContent title='ALL PUBLISHED BINARIES' displayedContracts="Loading..."/>
                ) : (
                    walletContext.connected ? (
                        <PublishTabContent title='MY PUBLISHED BINARIES' displayedContracts="Loading..."/>
                    ) : (
                        <PublishTabContent title='MY PUBLISHED BINARIES' displayedContracts="Wallet not connected. Connect your Stellar account to see your published binaries."/>
                    )
                )}
            </div>
        );
    }

    else if (error) { throw new Error("Error when trying to fetch Published Binaries");}

    else if (allPublishedContracts && selectedTab == Tab.All) {

        const allPublishedContractsRows: JSX.Element[] = [];

        allPublishedContracts.forEach((publishedContract) => {

            const versions: {version: Version, version_string: string, nb_instances: number}[] = [];

            publishedContract.versions.forEach((obj) => {

                // Version obj
                const version = obj.version;

                // Nb of instances for that version
                const nb_instances = obj.nb_instances;

                // Version string
                const major = version.major;
                const minor = version.minor;
                const patch = version.patch;
                const version_string = `v.${major}.${minor}.${patch}`;

                versions.push({version, version_string, nb_instances});
            })
            versions.reverse();
            
            allPublishedContractsRows.push(
                <tr key={publishedContract.index} data-theme={activeTheme}>
                    <td className={styles.contractCell}>{publishedContract.name}</td>
                    <DeployVersionComponent
                        contract_name={publishedContract.name}
                        contract_author={publishedContract.author}
                        versions={versions}
                    />
                </tr>
            );
        });
        
        return(
            <div>
                <ToggleButtons selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                <PublishTabContent title='ALL PUBLISHED BINARIES' displayedContracts={allPublishedContractsRows}/>
            </div>
        )
    }

    else if (myPublishedContracts && selectedTab == Tab.My) {

        const myPublishedContractsRows: JSX.Element[] = [];

        myPublishedContracts.forEach((publishedContract) => {

            const versions: {version: Version, version_string: string, nb_instances: number}[] = [];

            publishedContract.versions.forEach((obj) => {

                // Version obj
                const version = obj.version;

                // Nb of instances for that version
                const nb_instances = obj.nb_instances;

                // Version string
                const major = version.major;
                const minor = version.minor;
                const patch = version.patch;
                const version_string = `v.${major}.${minor}.${patch}`;

                versions.push({version, version_string, nb_instances});
            })
            versions.reverse();
            
            myPublishedContractsRows.push(
                <tr key={publishedContract.index} data-theme={activeTheme}>
                    <td className={styles.contractCell}>{publishedContract.name}</td>
                    <DeployVersionComponent
                        contract_name={publishedContract.name}
                        contract_author={publishedContract.author}
                        versions={versions}
                    />
                </tr>
            );
        });
        
        return(
            <div>
                <ToggleButtons selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                {walletContext.connected ? (
                    myPublishedContracts.length > 0 ? (
                        <PublishTabContent title='MY PUBLISHED BINARIES' displayedContracts={myPublishedContractsRows}/>
                    ) : (
                        <PublishTabContent title='MY PUBLISHED BINARIES' displayedContracts="You haven't published or deployed any binaries yet"/>
                    )
                ) : (
                    <PublishTabContent title='MY PUBLISHED BINARIES' displayedContracts="Wallet not connected. Connect your Stellar account to see your deployed binaries."/>
                )}
            </div>
        )
    }
}
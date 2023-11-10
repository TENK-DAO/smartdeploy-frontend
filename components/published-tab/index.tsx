import { BsSendPlus } from 'react-icons/bs';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'
import Popup from 'reactjs-popup';
import styles from './style.module.css';
import Dropdown from 'react-dropdown';

import { smartdeploy, StateVariablesProps, UserWalletInfo, FetchDatas } from "@/pages";
import { isConnected } from '@stellar/freighter-api';
import { Ok, Err, Option, Version } from 'smartdeploy-client'
import { useState, useEffect, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useThemeContext } from '../ThemeContext'

interface PublishedContract {
    index: number;
    name: string;
    author: string;
    versions: {
        version: Version,
        hash: string
    }[];
}

type DeployProps = {
    userWalletInfo: UserWalletInfo;
    refetchDeployedContract: FetchDatas;
    contract_name: string;
    versions: {version: Version, version_string: string}[];
}

type DeployVersionProps = {
    userWalletInfo: UserWalletInfo;
    refetchDeployedContract: FetchDatas;
    contract_name: string;
    selected_version: {version: Version, version_string: string};
}

type VersionDropdownProps = {
    versions: {version: Version, version_string: string}[];
    selected_version: {version: Version, version_string: string};
    set_selected_version: Dispatch<SetStateAction<{version: Version, version_string: string}>>;
}

type DeployArgsObj = { 
    contract_name: string,
    version: Option<Version>,
    deployed_name: string,
    owner: string,
    salt: Option<Buffer>
};

async function listAllPublishedContracts() {

    try {

        ///@ts-ignore
        const {result} = await smartdeploy.listPublishedContracts({ start: undefined, limit: undefined });
        const response = result;

        if (response instanceof Ok) {
            let publishedContracts: PublishedContract[] = [];
            
            const contractArray = response.unwrap();

            ///@ts-ignore
            contractArray.forEach(([name, publishedContract], i) => {

                let versions: {version: Version, hash: string}[] = [];

                ///@ts-ignore
                Array.from(publishedContract.versions).forEach((contractDatas: [Version, any]) => {

                    // Version object
                    const version = contractDatas[0];

                    // hash
                    const hash = contractDatas[1].hash.join('');

                    versions.push({version, hash});
                });

                const parsedPublishedContract: PublishedContract = {
                    index: i,
                    name: name,
                    author: publishedContract.author.toString(),
                    versions: versions
                };
                
                publishedContracts.push(parsedPublishedContract);
            });

            return publishedContracts;

        } else if (response instanceof Err) {
            response.unwrap();
        } else {
            throw new Error("listPublishedContracts returns undefined. Impossible to fetch the published contracts.");
        }
    } catch (error) {
        console.error(error);
        window.alert(error);
    }

}

async function deploy(
    userWalletInfo: UserWalletInfo,
    refetchDeployedContract: FetchDatas,
    setIsDeploying: Dispatch<SetStateAction<boolean>>,
    setDeployedName: Dispatch<SetStateAction<string>>,
    setWouldDeploy: Dispatch<SetStateAction<boolean>>,
    argsObj: DeployArgsObj
) {
    
    // Check if the user has Freighter
    if (!(await isConnected())) {
        window.alert("Impossible to interact with Soroban: you don't have Freighter extension.\n You can install the extension here: https://www.freighter.app/");
        setIsDeploying(false);
    }
    else {
        // Check if the Wallet is connected
        if (userWalletInfo.address === "") {
            alert("Wallet not connected. Please, connect a Stellar account.");
            setIsDeploying(false);
        }
        // Check is the network is Futurenet
        else if (userWalletInfo.network.replace(" ", "").toUpperCase() !== "TESTNET") {
            alert("Wrong Network. Please, switch to Testnet.");
            setIsDeploying(false);
        }
        else {
            // Check if deployed name is empty
            if (argsObj.deployed_name === "") {
                alert("Deployed name cannot be empty. Please, choose a deployed name.");
                setIsDeploying(false);
            }
            // Check if deployed name contains spaces
            else if (argsObj.deployed_name.includes(' ')) {
                alert("Deployed name cannot includes spaces. Please, remove the spaces.");
                setIsDeploying(false);
            }
            // Now that everything is ok, deploy the contract
            else {

                try {

                    const tx = await smartdeploy.deploy(argsObj, { responseType: 'full' });
                    console.log(tx);
                    refetchDeployedContract.setFetch(true);
                    setDeployedName("");
                    setWouldDeploy(false);
                    

                } catch (error) {
                    console.error(error);
                    window.alert(error);
                }

                setIsDeploying(false);

            }
        }
    }
}

function VersionDropdownButton(props: VersionDropdownProps) {

    const versions: string[] = [];

    props.versions.forEach((version) => {
        versions.push(version.version_string);
    });

    return(
        <Dropdown
            className={styles.dropdownContainer}
            controlClassName={styles.dropdownControl}
            menuClassName={styles.dropdownMenu}
            options={versions}
            placeholder={versions[0]}
            arrowClosed={<IoMdArrowDropdown/>}
            arrowOpen={<IoMdArrowDropup/>}
            onChange={(version) => {

                const newSelectedVersionString = version.value;
                
                const [major, minor, patch] = version.value.split('.').slice(1);
                const newSelectedVersion: Version = {
                    major: parseInt(major),
                    minor: parseInt(minor),
                    patch: parseInt(patch),
                }
                
                props.set_selected_version({version: newSelectedVersion, version_string: newSelectedVersionString});
            }}
        />
    )
}

function DeployIconComponent(props: DeployVersionProps) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    const [wouldDeploy, setWouldDeploy]   = useState<boolean>(false); 
    const [deployedName, setDeployedName] = useState<string>("");
    const [isDeploying, setIsDeploying]   = useState<boolean>(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDeployedName(e.target.value);
    }
  
    return (
        <>
            {!wouldDeploy ? (
                <td className={styles.deployIconCell}>
                    <BsSendPlus
                        className={styles.deployIcon}
                        onClick={() => setWouldDeploy(true) }
                    />
                </td>
            ) : (
                <>
                    <td className={styles.deployIconCell}>
                        <p className={styles.deployingMessage}>Deploying...</p>
                    </td>
                    <Popup  open={wouldDeploy} closeOnDocumentClick={false}>
                        <div className={styles.popupContainer} data-theme={activeTheme}>
                            <button className={styles.close} onClick={() => setWouldDeploy(false)}>
                                &times;
                            </button>
                            <div className={styles.header}>Deploy <span className={styles.nameColor} data-theme={activeTheme}>{props.contract_name} ({props.selected_version.version_string})</span> </div>
                            <div className={styles.content}>
                                <p className={styles.mainMessage}><b>You are about to create an instance of <span className={styles.nameColor} data-theme={activeTheme}>{props.contract_name}</span> published contract where you will be the owner.</b><br/></p>
                                <div className={styles.deployedNameDiv}>
                                    <b>Please choose a contract instance name:</b>
                                    <input 
                                        className={styles.deployedNameInput}
                                        data-theme={activeTheme}
                                        type="text" 
                                        spellCheck={false} 
                                        placeholder="deployed_name" 
                                        value={deployedName}
                                        onChange={handleInputChange}>
                                    </input>
                                </div>
                            </div>
                            <div className={styles.buttonContainer}>
                                {!isDeploying ? (
                                    <>
                                        <button className={styles.button} 
                                                data-theme={activeTheme}
                                                onClick={() => {

                                                    setIsDeploying(true);

                                                    const argsObj: DeployArgsObj = {
                                                        contract_name: props.contract_name,
                                                        version: props.selected_version.version,
                                                        deployed_name: deployedName,
                                                        owner: props.userWalletInfo.address,
                                                        salt: undefined
                                                    }

                                                    deploy(
                                                        props.userWalletInfo,
                                                        props.refetchDeployedContract,
                                                        setIsDeploying,
                                                        setDeployedName,
                                                        setWouldDeploy,
                                                        argsObj
                                                    );
                                                }}
                                        >
                                            Deploy
                                        </button>
                                        <button className={styles.button} data-theme={activeTheme} onClick={() => setWouldDeploy(false)}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button className={styles.buttonWhenDeploying} data-theme={activeTheme}>
                                        Deploying...
                                    </button>
                                )}
                            </div>
                        </div>
                    </Popup>
                </>
            )}
        </>
    );
}

function DeployVersionComponent(props: DeployProps) {

    // The default selected version is the last one
    const defaultSelectedVersion = {
        version: props.versions[0].version,
        version_string: props.versions[0].version_string
    };

    const [selectedVersion, setSelectedVersion] = useState<{version: Version, version_string: string}>(defaultSelectedVersion);

    return (
        <>
            <td>
                <VersionDropdownButton
                    versions={props.versions}
                    selected_version={selectedVersion}
                    set_selected_version={setSelectedVersion}
                />
            </td>
            <DeployIconComponent
                userWalletInfo={props.userWalletInfo}
                refetchDeployedContract={props.refetchDeployedContract}
                contract_name={props.contract_name}
                selected_version={selectedVersion}
            />
        </>
    )
}


export default function PublishedTab(props: StateVariablesProps) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [publishedContracts, setPublishedContracts] = useState<PublishedContract[]>([]);

    useEffect(() => {

        async function fetchPublishedContracts() {
            try {
              const datas = await listAllPublishedContracts();
              setPublishedContracts(datas as PublishedContract[]);
              setLoading(false);
            } catch (error) {
                console.error(error);
                window.alert(error);
                setError(true);
            }
        }

        if (props.fetchPublished?.fetch === true) {
            setLoading(true);
            fetchPublishedContracts();
            props.fetchPublished.setFetch(false);
        }

    }, [props.fetchPublished?.fetch]);
    
    if (loading) return (
        <div className={styles.publishedTabContainer} data-theme={activeTheme}>
            <table className={styles.publishedTabHead}>
                <caption data-theme={activeTheme}>PUBLISHED CONTRACTS</caption>
                <colgroup>
                    <col className={styles.contractCol}></col>
                    <col className={styles.authorCol}></col>
                    <col className={styles.versionCol}></col>
                    <col className={styles.deployCol}></col>
                </colgroup>
                <thead data-theme={activeTheme}>
                    <tr>
                        <th>Contract</th>
                        <th>Author</th>
                        <th>Version</th>
                        <th>Deploy</th>
                    </tr>
                </thead>
            </table>
            <div className={styles.publishedTabContentContainer}>
                <table className={styles.publishedTabContent}>
                    <colgroup>
                        <col className={styles.contractCol}></col>
                        <col className={styles.authorCol}></col>
                        <col className={styles.versionCol}></col>
                        <col className={styles.deployCol}></col>
                    </colgroup>
                    <tbody>
                        
                    </tbody>
                </table>
            </div>
        </div>
    );

    else if (error) { throw new Error("Error when trying to fetch Published Contracts");}

    else if (publishedContracts) {

        const rows: JSX.Element[] = [];

        publishedContracts.forEach((publishedContract) => {

            const versions: {version: Version, version_string: string}[] = [];

            publishedContract.versions.forEach((obj) => {

                // Version obj
                const version = obj.version;

                // Version string
                const major = version.major;
                const minor = version.minor;
                const patch = version.patch;
                const version_string = `v.${major}.${minor}.${patch}`;

                versions.push({version, version_string});
            })
            versions.reverse();
            
            rows.push(
                <tr key={publishedContract.index} data-theme={activeTheme}>
                    <td className={styles.contractCell}>{publishedContract.name}</td>
                    <td>{publishedContract.author}</td>
                    <DeployVersionComponent
                        userWalletInfo={props.walletInfo}
                        refetchDeployedContract={props.fetchDeployed as FetchDatas}
                        contract_name={publishedContract.name}
                        versions={versions}
                    />
                </tr>
            );
        });
        
        return(
            <div className={styles.publishedTabContainer} data-theme={activeTheme}>
                <table className={styles.publishedTabHead}>
                    <caption data-theme={activeTheme}>PUBLISHED CONTRACTS</caption>
                    <colgroup>
                        <col className={styles.contractCol}></col>
                        <col className={styles.authorCol}></col>
                        <col className={styles.versionCol}></col>
                        <col className={styles.deployCol}></col>
                    </colgroup>
                    <thead data-theme={activeTheme}>
                        <tr>
                            <th>Contract</th>
                            <th>Author</th>
                            <th>Versions</th>
                            <th>Deploy</th>
                        </tr>
                    </thead>
                </table>
                <div className={styles.publishedTabContentContainer}>
                    <table className={styles.publishedTabContent}>
                        <colgroup>
                            <col className={styles.contractCol}></col>
                            <col className={styles.authorCol}></col>
                            <col className={styles.versionCol}></col>
                            <col className={styles.deployCol}></col>
                        </colgroup>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
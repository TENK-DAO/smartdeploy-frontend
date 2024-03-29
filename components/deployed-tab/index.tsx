import { FaRegClipboard } from "react-icons/fa";
import { MdDone } from "react-icons/md"
import styles from './style.module.css';

import { smartdeploy, FetchDatas } from "@/pages";
import { Ok, Err } from 'smartdeploy-client'
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useThemeContext } from '../ThemeContext'

interface DeployedContract {
    index: number;
    name: string;
    address: string;
}

type ClipboardIconComponentProps = {
    address: string;
}


async function listAllDeployedContracts() {

    try {

        ///@ts-ignore
        const { result } = await smartdeploy.listDeployedContracts({ start: undefined, limit: undefined });
        const response = result;

        if (response instanceof Ok) {
            
            let deployedContracts: DeployedContract[] = [];

            const contractArray =  response.unwrap();

            ///@ts-ignore
            contractArray.forEach(([name, address], i) => {

                const parsedDeployedContract: DeployedContract = {
                    index: i,
                    name: name,
                    address: address.toString(),
                }

                deployedContracts.push(parsedDeployedContract);
                
            });
            
            //console.log(deployedContracts);
            return deployedContracts;

        } else if (response instanceof Err) {
            response.unwrap();
        } else {
            throw new Error("listDeployedContracts returns undefined. Impossible to fetch the deployed contracts.");
        }
    } catch (error) {
        console.error(error);
        window.alert(error);
    }
    
}

async function copyAddr(setCopied: Dispatch<SetStateAction<boolean>> , addr: string) {
    await navigator.clipboard
                             .writeText(addr)
                             .then(() => {
                                setCopied(true);
                             })
                             .catch((err) => {
                                console.error("Failed to copy address: ", err);
                                window.alert(err);
                             });
}

function ClipboardIconComponent(props: ClipboardIconComponentProps) {

    const [copied, setCopied] = useState<boolean>(false);
  
    useEffect(() => {
        if(copied === true) {
          const timer = setTimeout(() => {
            setCopied(false)
          }, 1500);
          return () => clearTimeout(timer);
        }
    }, [copied]);
  
    return (
        <>
            {!copied ? (
                <td className={styles.clipboardIconCell}>
                    <FaRegClipboard 
                        className={styles.clipboardIcon}
                        onClick={ () => copyAddr(setCopied, props.address)}
                    />
                </td>
            ) : (
                <td className={styles.clipboardIconCell}>
                    <p className={styles.copiedMessage}><MdDone style={{ marginRight: '0.2rem' }}/>Copied!</p>
                </td>
            )}
        </>
    );
}


export default function DeployedTab(props: FetchDatas) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [deployedContracts, setDeployedContracts] = useState<DeployedContract[]>([]);

    useEffect(() => {

        async function fetchDeployedContracts() {
            try {
              const datas = await listAllDeployedContracts();
              setDeployedContracts(datas as DeployedContract[]);
              setLoading(false);
            } catch (error) {
                console.error(error);
                window.alert(error);
                setError(true);
            }
        }

        if (props.fetch === true) {
            setLoading(true);
            fetchDeployedContracts();
            props.setFetch(false);
        }

    }, [props.fetch]);

    if (loading) return (
        <div className={styles.deployedTabContainer} data-theme={activeTheme}>
            <table className={styles.deployedTabHead}>
                <caption data-theme={activeTheme}>DEPLOYED CONTRACTS</caption>
                <colgroup>
                    <col className={styles.contractCol}></col>
                    <col className={styles.addressCol}></col>
                    <col className={styles.copyCol}></col>
                </colgroup>
                <thead data-theme={activeTheme}>
                    <tr>
                        <th>Contract</th>
                        <th>Address</th>
                        <th className={styles.copyThead}>Copy</th>
                    </tr>
                </thead>
            </table>
            <div className={styles.deployedTabContentContainer}>
                <table className={styles.deployedTabContent}>
                    <colgroup>
                        <col className={styles.contractCol}></col>
                        <col className={styles.addressCol}></col>
                        <col className={styles.copyCol}></col>
                    </colgroup>
                    <tbody>
                        
                    </tbody>
                </table>
            </div>
        </div>
    )

    if (error) { throw new Error("Error when trying to fetch Deployed Contracts") }

    if (deployedContracts) {    

        const rows: JSX.Element[] = [];

        deployedContracts.forEach((deployedContract) => {
            rows.push(
                <tr key={deployedContract.index} data-theme={activeTheme}>
                    <td className={styles.contractCell}>{deployedContract.name}</td>
                    <td>{deployedContract.address}</td>
                    <ClipboardIconComponent address={deployedContract.address}/>
                </tr>
            );
        });

        return(
            <div className={styles.deployedTabContainer} data-theme={activeTheme}>
                <table className={styles.deployedTabHead}>
                    <caption data-theme={activeTheme}>DEPLOYED CONTRACTS</caption>
                    <colgroup>
                        <col className={styles.contractCol}></col>
                        <col className={styles.addressCol}></col>
                        <col className={styles.copyCol}></col>
                    </colgroup>
                    <thead data-theme={activeTheme}>
                        <tr>
                            <th>Contract</th>
                            <th>Address</th>
                            <th className={styles.copyThead}>Copy</th>
                        </tr>
                    </thead>
                </table>
                <div className={styles.deployedTabContentContainer}>
                    <table className={styles.deployedTabContent}>
                        <colgroup>
                            <col className={styles.contractCol}></col>
                            <col className={styles.addressCol}></col>
                            <col className={styles.copyCol}></col>
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
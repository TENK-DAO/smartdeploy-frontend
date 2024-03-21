import { Dispatch, SetStateAction } from 'react'
import { isConnected } from '@stellar/freighter-api'
import { smartdeploy } from "@/pages"
import { PublishEventData, DeployEventData, readTtl, addDbTtlData } from '@/mercury_indexer/smartdeploy-api-client'
import { Ok, Err, Option, Version } from 'smartdeploy-client'
import { WalletContextType } from '@/context/WalletContext'
import { TimeToLiveType } from '@/context/TimeToLiveContext'
import { format } from 'date-fns'
import { formatCountDown } from '../deployed-tab/backend'

export interface PublishedContract {
    index: number;
    name: string;
    author: string;
    versions: {
        version: Version,
        nb_instances: number,
        hash: string
    }[];
}

export async function listAllPublishedContracts(
    deploy_events: DeployEventData[] | undefined,
) {

    if (deploy_events) {
        try {
    
            ///@ts-ignore
            const {result} = await smartdeploy.listPublishedContracts({ start: undefined, limit: undefined });
            const response = result;
    
            if (response instanceof Ok) {
                let publishedContracts: PublishedContract[] = [];
                
                const contractArray = response.unwrap();
    
                ///@ts-ignore
                contractArray.forEach(([name, publishedContract], i) => {
        
                    let versions: {version: Version, hash: string, nb_instances: number}[] = [];
    
                    ///@ts-ignore
                    Array.from(publishedContract.versions).forEach((contractDatas: [Version, any]) => {
    
                        // Version object
                        const version = contractDatas[0];

                        // Nb instances per version
                        const nb_instances = deploy_events.filter(event => (event.publishedName == name && areVersionsEqual(event.version, version))).length ?? 0;
    
                        // hash
                        const hash = contractDatas[1].hash.join('');
    
                        versions.push({version, hash, nb_instances});
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
    else {
        return 0;
    }

}

export function getMyPublishedContracts(
    publishedContracts: PublishedContract[],
    deploy_events: DeployEventData[] | undefined,
    address: string
) {
    
    var myPublishedContracts: PublishedContract[] = [];

    const contractsIOwn = publishedContracts.filter(contract => contract.author === address);

    const nameIDeployed = deploy_events!.filter(event => event.deployer == address).map(event => event.publishedName);
    const contractsIDeployed = publishedContracts.filter(contract => nameIDeployed.includes(contract.name));
    
    myPublishedContracts.push(...contractsIOwn, ...contractsIDeployed);

    const ret = myPublishedContracts.filter((contract, index) => {
        return myPublishedContracts.findIndex(item => item.name === contract.name) === index;
    });
    
    return ret;

}

function areVersionsEqual(v1: Version, v2: Version) {
    return v1.major == v2.major && v1.minor == v2.minor && v1.patch == v2.patch;
}

export type DeployArgsObj = { 
    contract_name: string,
    version: Option<Version>,
    deployed_name: string,
    owner: string,
    salt: Option<Buffer>,
    init: Option<readonly [string, Array<any>]>
};

export async function deploy(
    walletContext: WalletContextType,
    argsObj: DeployArgsObj
) {
    
    // Check if the user has Freighter
    if (!(await isConnected())) {
        window.alert("Impossible to interact with Soroban: you don't have Freighter extension.\n You can install the extension here: https://www.freighter.app/");
    }
    else {
        // Check if the Wallet is connected
        if (walletContext.address === "") {
            alert("Wallet not connected. Please, connect a Stellar account.");
        }
        // Check is the network is Futurenet
        else if (walletContext.network.replace(" ", "").toUpperCase() !== "TESTNET") {
            alert("Wrong Network. Please, switch to Testnet.");
        }
        else {
            // Check if deployed name is empty
            if (argsObj.deployed_name === "") {
                alert("Deployed name cannot be empty. Please, choose a deployed name.");
            }
            // Check if deployed name contains spaces
            else if (argsObj.deployed_name.includes(' ')) {
                alert("Deployed name cannot includes spaces. Please, remove the spaces.");
            }
            // Now that everything is ok, deploy the contract
            else {

                try {

                    const tx = await smartdeploy.deploy(argsObj);
                    // Sign and send the transaction
                    const signedTx = await tx.signAndSend();

                    // Retrieve the id of the deployed contract
                    const contract_id = signedTx.result.unwrap();
                    return contract_id;

                } catch (error) {
                    console.error(error);
                    window.alert(error);
                    return false;
                }

            }
        }
    }
}

export async function deployContract(
    walletContext: WalletContextType,
    deployData: DeployArgsObj,
    timeToLiveMap: TimeToLiveType,
    setIsDeploying: Dispatch<SetStateAction<boolean>>,
    setDeployedName: Dispatch<SetStateAction<string>>,
    setBumping: Dispatch<SetStateAction<boolean | null>>,
    setWouldDeploy: Dispatch<SetStateAction<boolean>>,
    subscribeBumping: boolean
) {

    setIsDeploying(true);

    let id = await deploy(
        walletContext,
        deployData
    );

    if (typeof id === "string") {

        const ttlData = await readTtl(id);

        const latestLedger = ttlData[0];
        const liveUntil = ttlData[1];
        const timeToLiveLedger = liveUntil - latestLedger;

        // Convert TTL in a date
        const timeToLiveSeconds = timeToLiveLedger * 5;
        const now = new Date();
        const expirationDate = format(now.getTime() + timeToLiveSeconds * 1000, "MM/dd/yyyy");

        if (!subscribeBumping) {
            timeToLiveMap.setAddressToTtl(prevMap => {
                const updatedMap = new Map(prevMap);
                updatedMap.set(id as string, {automaticBump: false, date: expirationDate});
                return updatedMap;
            })
        } else {
            timeToLiveMap.setAddressToTtl(prevMap => {
                const updatedMap = new Map(prevMap);
                updatedMap.set(id as string, {
                    automaticBump: true,
                    date: expirationDate,
                    ttlSec: timeToLiveSeconds,
                    countdown: formatCountDown(timeToLiveSeconds)
                });
                return updatedMap;
            })
        }

        await addDbTtlData(id, subscribeBumping, liveUntil);

        setIsDeploying(false)
        setDeployedName("")
        setBumping(null)
        setWouldDeploy(false)
    } else {
        setIsDeploying(false)
    }
}
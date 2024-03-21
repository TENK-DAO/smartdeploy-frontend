import styles from './style.module.css'

import { useThemeContext } from '../../context/ThemeContext'
import { useWalletContext } from '../../context/WalletContext'
import { useTimeToLiveContext } from '../../context/TimeToLiveContext'
import { useState, ChangeEvent, Dispatch, SetStateAction, useEffect } from 'react'
import Popup from 'reactjs-popup'
import Dropdown from 'react-dropdown'
import { BsSendPlus } from 'react-icons/bs'
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io'

import { DeployArgsObj, deployContract } from './backend'
import { Version } from 'smartdeploy-client'

type DeployVersionProps = {
    contract_name: string;
    selected_version: {version: Version, version_string: string};
}

function DeployIconComponent(props: DeployVersionProps) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    const walletContext = useWalletContext();

    // Context to store Data Expiration Ledger
    const timeToLiveMap = useTimeToLiveContext();

    const [wouldDeploy, setWouldDeploy]   = useState<boolean>(false); 
    const [deployedName, setDeployedName] = useState<string>("");
    const [isDeploying, setIsDeploying]   = useState<boolean>(false);
    const [bumping, setBumping] = useState<boolean | null>(null);
    const [showBumpingPopup, setShowBumpingPopup] = useState<boolean>(false);
    const [conditionalDeployButtonCss, setConditionalDeployButtonCss] = useState<boolean>(false);

    useEffect(() => {
        if (bumping != null) {
            setConditionalDeployButtonCss(true);
        } else {
            setConditionalDeployButtonCss(false);
        }
    }, [bumping]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDeployedName(e.target.value);
    }

    const deployData: DeployArgsObj = {
        contract_name: props.contract_name,
        version: props.selected_version.version,
        deployed_name: deployedName,
        owner: walletContext.address,
        salt: undefined,
        init: undefined
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
                            <button className={styles.close} onClick={() => {setWouldDeploy(false), setBumping(null)}}>
                                &times;
                            </button>
                            <div className={styles.header}>Deploy <span className={styles.nameColor} data-theme={activeTheme}>{props.contract_name} ({props.selected_version.version_string})</span> </div>
                            <div className={styles.content}>
                                <p className={styles.mainMessage}><b>You are about to create an instance of <span className={styles.nameColor} data-theme={activeTheme}>{props.contract_name} ({props.selected_version.version_string})</span> where you will be the owner.</b><br/></p>
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
                                <div className={styles.bumpContainer}>
                                    <p>Do you want SmartDeploy to automatically bump your contract instance when it arrives at expiration time?</p>
                                    <div className={styles.checkboxContainer}>
                                        <div>
                                            <input 
                                                type='checkbox'
                                                onChange={() => { if(bumping !== true) setBumping(true)} }
                                                onClick={() => { if(bumping === true) setBumping(null)} }
                                                checked={bumping === true}
                                            />
                                            <label>Yes, I agree to pay bumping fees now</label>
                                        </div>
                                        <div>
                                            <input 
                                                type='checkbox'
                                                onChange={() => { if(bumping !== false) setBumping(false)} }
                                                onClick={() => { if(bumping === false) setBumping(null)} }
                                                checked={bumping === false}
                                            />
                                            <label>No</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.buttonContainer}>
                                {(!isDeploying && !bumping) ? (
                                    <>
                                        <button className={conditionalDeployButtonCss ? styles.button : styles.buttonDisabled}
                                                data-theme={activeTheme}
                                                onClick={async () => {
                                                    deployContract(
                                                        walletContext,
                                                        deployData,
                                                        timeToLiveMap,
                                                        setIsDeploying,
                                                        setDeployedName,
                                                        setBumping,
                                                        setWouldDeploy,
                                                        false
                                                    )
                                                }}
                                                disabled={bumping === null}
                                        >
                                            Deploy
                                        </button>
                                        <button className={styles.button} data-theme={activeTheme} onClick={() => {setWouldDeploy(false); setBumping(null)}}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (!isDeploying && bumping) ? (
                                    <>
                                        <button className={conditionalDeployButtonCss ? styles.button : styles.buttonDisabled}
                                                data-theme={activeTheme}
                                                onClick={() => {
                                                    if(deployData.deployed_name == "") {
                                                        window.alert("Contract name not set. Please enter a name for your contract instance before continuing.")
                                                    } else {
                                                        setShowBumpingPopup(true)
                                                    }
                                                }}
                                                disabled={bumping === null}
                                        >
                                            Continue
                                        </button>
                                        <button className={styles.button} data-theme={activeTheme} onClick={() => {setWouldDeploy(false); setBumping(null)}} disabled={showBumpingPopup}>
                                            Cancel
                                        </button>

                                        {showBumpingPopup && (
                                            <BumpingPopup   showBumpingPopup={showBumpingPopup} 
                                                            setShowBumpingPopup={setShowBumpingPopup}
                                                            setDeployedName={setDeployedName}
                                                            setBumping={setBumping}
                                                            setWouldDeploy={setWouldDeploy}
                                                            deployData={deployData}
                                            />
                                        )}
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

function BumpingPopup({
    showBumpingPopup,
    setShowBumpingPopup,
    setBumping,
    setDeployedName,
    setWouldDeploy,
    deployData
}: {
    showBumpingPopup: boolean
    setShowBumpingPopup: Dispatch<SetStateAction<boolean>>,
    setDeployedName: Dispatch<SetStateAction<string>>,
    setBumping: Dispatch<SetStateAction<boolean | null>>,
    setWouldDeploy: Dispatch<SetStateAction<boolean>>,
    deployData: DeployArgsObj
}) {

    const { activeTheme } = useThemeContext();
    const walletContext = useWalletContext();

    // Context to store Data Expiration Ledger
    const timeToLiveMap = useTimeToLiveContext();

    enum BumpingSubscription {
        SIX_MONTHS,
        ONE_YEAR,
        TWO_YEAR
    }

    const [isDeploying, setIsDeploying] = useState(false);
    const [bumpingSubscription, setBumpingSubscription] = useState<BumpingSubscription | null>(null);
    const [conditionalDeployButtonCss, setConditionalDeployButtonCss] = useState<boolean>(false);

    useEffect(() => {
        if (bumpingSubscription != null) {
            setConditionalDeployButtonCss(true);
        } else {
            setConditionalDeployButtonCss(false);
        }
    }, [bumpingSubscription]);

    return (
        <div style={{position: 'absolute', top: 20, left: 20}}>

        
        <Popup  open={showBumpingPopup} closeOnDocumentClick={false} offsetX={500} offsetY={-150} trigger={<div></div>} arrow={false}>
            <div className={styles.bumpingPopupContainer} data-theme={activeTheme}>
                <button className={styles.close} onClick={() => {setBumpingSubscription(null); setShowBumpingPopup(false)}}>
                    &times;
                </button>
                <div className={styles.header}>Bumping subscription for contract instance <span className={styles.nameColor} data-theme={activeTheme}>{deployData.deployed_name}</span> </div>
                <div className={styles.content}>
                    <div className={styles.bumpContainer}>
                        <p>How long do you want us to keep your contract instance alive?</p>
                        <div className={styles.checkboxContainer}>
                            <div>
                            <input 
                                    type='checkbox'
                                    onChange={() => { if(bumpingSubscription !== BumpingSubscription.SIX_MONTHS) setBumpingSubscription(BumpingSubscription.SIX_MONTHS)} }
                                    onClick={() => { if(bumpingSubscription === BumpingSubscription.SIX_MONTHS) setBumpingSubscription(null)} }
                                    checked={bumpingSubscription === BumpingSubscription.SIX_MONTHS}
                                />
                                <label>6 months (xxx XLM)</label>
                            </div>
                            <div>
                            <input 
                                    type='checkbox'
                                    onChange={() => { if(bumpingSubscription !== BumpingSubscription.ONE_YEAR) setBumpingSubscription(BumpingSubscription.ONE_YEAR)} }
                                    onClick={() => { if(bumpingSubscription === BumpingSubscription.ONE_YEAR) setBumpingSubscription(null)} }
                                    checked={bumpingSubscription === BumpingSubscription.ONE_YEAR}
                                />
                                <label>1 year (xxx XLM)</label>
                            </div>
                            <div>
                                <input 
                                    type='checkbox'
                                    onChange={() => { if(bumpingSubscription !== BumpingSubscription.TWO_YEAR) setBumpingSubscription(BumpingSubscription.TWO_YEAR)} }
                                    onClick={() => { if(bumpingSubscription === BumpingSubscription.TWO_YEAR) setBumpingSubscription(null)} }
                                    checked={bumpingSubscription === BumpingSubscription.TWO_YEAR}
                                />
                                <label>2 years (xxx XLM)</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.buttonContainer}>
                    {!isDeploying ? (
                        <>
                            <button className={conditionalDeployButtonCss ? styles.button : styles.buttonDisabled}
                                    data-theme={activeTheme}
                                    onClick={async () => {
                                        deployContract(
                                            walletContext,
                                            deployData,
                                            timeToLiveMap,
                                            setIsDeploying,
                                            setDeployedName,
                                            setBumping,
                                            setWouldDeploy,
                                            true
                                        )
                                        
                                    }}
                                    disabled={bumpingSubscription === null}
                            >
                                Deploy
                            </button>
                            <button className={styles.button} data-theme={activeTheme} onClick={() => {setBumpingSubscription(null); setShowBumpingPopup(false)}}>
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
        </div>
    )
}

type DeployProps = {
    contract_name: string;
    contract_author: string;
    versions: {version: Version, version_string: string, nb_instances: number}[];
}

export function DeployVersionComponent(props: DeployProps) {

    // The default selected version is the last one
    const defaultSelectedVersion = {
        version: props.versions[0].version,
        version_string: props.versions[0].version_string
    };

    const [selectedVersion, setSelectedVersion] = useState<{version: Version, version_string: string}>(defaultSelectedVersion);

    // Number of deployed instances per version
    const inst = props.versions.find(v => v.version_string === selectedVersion.version_string)?.nb_instances ?? 0;

    return (
        <>
            <td className={styles.instancesTd}>
                {inst}
            </td>
            <td>{props.contract_author}</td>
            <td>
                <VersionDropdownButton
                    versions={props.versions}
                    selected_version={selectedVersion}
                    set_selected_version={setSelectedVersion}
                />
            </td>
            <DeployIconComponent
                contract_name={props.contract_name}
                selected_version={selectedVersion}
            />
        </>
    )
}

type VersionDropdownProps = {
    versions: {version: Version, version_string: string}[];
    selected_version: {version: Version, version_string: string};
    set_selected_version: Dispatch<SetStateAction<{version: Version, version_string: string}>>;
}

export function VersionDropdownButton(props: VersionDropdownProps) {

    const versions: string[] = [];

    props.versions.forEach((version) => {
        versions.push(version.version_string);
    });

    return(
        <div>
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
        </div>
    )
}
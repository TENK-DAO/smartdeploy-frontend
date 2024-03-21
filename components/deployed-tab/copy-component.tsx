import styles from './style.module.css';

import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { FaRegClipboard } from "react-icons/fa";
import { MdDone } from "react-icons/md"
import { useThemeContext } from '@/context/ThemeContext';
import Popup from 'reactjs-popup';

async function copyAddr(setCopied: Dispatch<SetStateAction<boolean>> , text: string) {
    await navigator.clipboard
                             .writeText(text)
                             .then(() => {
                                setCopied(true);
                             })
                             .catch((err) => {
                                console.error("Failed to copy element: ", err);
                                window.alert(err);
                             });
}

export default function CopyComponent ({hash} : {hash: string}) {

    const [copied, setCopied] = useState<boolean>(false);
    const [ openCopyPopUp, setOpenCopyPopup] = useState(false);
  
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
                <p  onClick={() => {copyAddr(setCopied, hash); setOpenCopyPopup(false)}}
                    onMouseEnter={() => setOpenCopyPopup(true)}
                    onMouseLeave={() => setOpenCopyPopup(false)}
                >
                    hash: {hash.slice(0, 7)}...
                </p>
            ) : (
                <p className={styles.copiedMessage}><MdDone style={{ marginRight: '0.2rem' }}/>Hash Copied!</p>
            )}
            <CopyPopUp openCopyPopUp={openCopyPopUp} />
        </>
    );
}

const CopyPopUp = ({openCopyPopUp} : {openCopyPopUp: boolean}) => {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    return (
        <>
            {openCopyPopUp && (
                <div data-theme={activeTheme} className={styles.copyPopupContainer}>
                    <p className={styles.copyPopUpContent}>Click to copy Hash</p>
                </div>
            )}
        </>
    );
}
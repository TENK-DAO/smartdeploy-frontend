import styles from './style.module.css';
import { BiCaretLeft } from "react-icons/bi";
import { useState } from 'react';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useThemeContext } from '../../context/ThemeContext'

export const TtlPopUp = () => {

    // Import the current Theme
    const { activeTheme } = useThemeContext();
    const [ openTtlPopUp, setOpenTtlPopup] = useState(false);

    return (
        <>
            <IoMdInformationCircleOutline   className={styles.ttlInfoIcon}
                                            onMouseEnter={() => setOpenTtlPopup(true)}
                                            onMouseLeave={() => setOpenTtlPopup(false)}
            >
            </IoMdInformationCircleOutline>

            { openTtlPopUp && (
                <div className={styles.popupContainer} data-theme={activeTheme}>
                    <BiCaretLeft className={styles.arrow} style={{ fill: 'var(--ttl-popup-bg-color)' }}/>
                    <div className={styles.ttlPopUpContent} data-theme={activeTheme}>
                        <p>Time To Live of the contract instance</p>
                    </div>
                </div>
            )}
        </>
    );
}

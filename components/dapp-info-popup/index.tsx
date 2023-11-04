import Popup from 'reactjs-popup';
import styles from './style.module.css';
import { useState, useEffect, ChangeEvent } from 'react';
import { useThemeContext } from '../ThemeContext'

export default function PopupDappInfo() {

  // Import the current Theme
  const { activeTheme } = useThemeContext();

  const [isOpen, setIsOpen] = useState(false);

  const handleOnchange = (e: ChangeEvent<HTMLInputElement>) => {
    const hidePopUp = e.target.checked;
    localStorage.setItem("hidePopUp", JSON.stringify(hidePopUp));
  };

  const clearStorage = () => {
    localStorage.clear();
  };

  useEffect(() => {
    //clearStorage();
    const hidePopUp = localStorage.getItem("hidePopUp");
    if (hidePopUp === null) {
      setIsOpen(true);
    } else if (hidePopUp === "true") {
      setIsOpen(false);
    } else if (hidePopUp === "false") {
      setIsOpen(true);
    }
  }, []);

  return (
    <Popup  open={isOpen} closeOnDocumentClick={false}>
        <div className={styles.popupContainer} data-theme={activeTheme}>
          <div className={styles.header}> Important Information </div>
          <div className={styles.content}>
            <p className={styles.mainMessage}><b>To fully use SmartDeploy, you need to connect your Freighter Wallet and select Test Net.</b><br/>
            Below are the steps to follow to interact with smart contracts:</p>
            <p>
            1. Get Freighter: Download the extension <a href="https://www.freighter.app/" target="_blank" data-theme={activeTheme}>here</a><br/>
            2. Enable Experimental Mode (Freighter Settings → Preferences, enable Experimental Mode)<br/>
            3. Select Test Net in the top right.
            </p>
            <input className={styles.checkbox} type="checkbox" onChange={handleOnchange}></input>
            <label className={styles.label}>Don't show again</label>
          </div>
          <div className={styles.buttonContainer}>
            <button
              className={styles.understood}
              data-theme={activeTheme}
              onClick={() => {
                setIsOpen(false)
              }}
            >
              Understood
            </button>
          </div>
        </div>
    </Popup>
  )
}
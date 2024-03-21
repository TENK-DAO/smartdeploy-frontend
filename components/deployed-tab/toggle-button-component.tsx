import styles from './style.module.css'
import { useThemeContext } from '../../context/ThemeContext'
import { Dispatch, SetStateAction } from "react";

export enum Tab {
    All,
    My
}

export function ToggleButtons({
    selectedTab,
    setSelectedTab
}: {
    selectedTab: Tab,
    setSelectedTab: Dispatch<SetStateAction<Tab>>
}) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    return (
        <div className={styles.toggleTabContainer}>
            <div className={selectedTab == Tab.All ? styles.allContractsButtonSelected : styles.allContractsButtonNotSelected}
                 data-theme={activeTheme}
                 onClick={() => { setSelectedTab(Tab.All) }}
            >
                All Contracts
            </div>
            <div className={selectedTab == Tab.My ? styles.myContractsButtonSelected : styles.myContractsButtonNotSelected}
                 data-theme={activeTheme}
                 onClick={() => { setSelectedTab(Tab.My) }}
            >
                My Contracts
            </div>
        </div>
    )
}
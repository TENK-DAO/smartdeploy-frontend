import styles from './style.module.css';
import { useThemeContext } from '../../context/ThemeContext'

type DeployedTabData = {
    title: string;
    displayedContracts: JSX.Element[] | string;
}

export function DeployedTabContent(props: DeployedTabData) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    return (
        <div className={styles.deployedTabContainer} data-theme={activeTheme}>
            <table className={styles.deployedTabHead}>
                <caption data-theme={activeTheme}>{props.title}</caption>
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
                    {typeof(props.displayedContracts) != "string" && (
                        <tbody>
                            {props.displayedContracts}
                        </tbody>
                    )}
                </table>
                {typeof(props.displayedContracts) == "string" && (
                    <div className={styles.tabMessage} data-theme={activeTheme}>{props.displayedContracts}</div>
                )}
            </div>
        </div>
    )
}
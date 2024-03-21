import styles from './style.module.css';
import { useThemeContext } from '../../context/ThemeContext'

type PublishTabData = {
    title: string;
    displayedContracts: JSX.Element[] | string;
}

export function PublishTabContent(props: PublishTabData) {

    // Import the current Theme
    const { activeTheme } = useThemeContext();

    return (
        <div className={styles.publishedTabContainer} data-theme={activeTheme}>
            <table className={styles.publishedTabHead}>
                <caption data-theme={activeTheme}>{props.title}</caption>
                <colgroup>
                    <col className={styles.contractCol}></col>
                    <col className={styles.instancesCol}></col>
                    <col className={styles.authorCol}></col>
                    <col className={styles.versionCol}></col>
                    <col className={styles.deployCol}></col>
                </colgroup>
                <thead data-theme={activeTheme}>
                    <tr>
                        <th>Binary name</th>
                        <th className={styles.instancesThead}>Instances</th>
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
                        <col className={styles.instancesCol}></col>
                        <col className={styles.authorCol}></col>
                        <col className={styles.versionCol}></col>
                        <col className={styles.deployCol}></col>
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
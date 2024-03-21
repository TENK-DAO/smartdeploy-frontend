import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'

export type WalletContextType = {
    hasFreighter: boolean;
    setHasFreighter: Dispatch<SetStateAction<boolean>>;
    connected: boolean;
    setConnected: Dispatch<SetStateAction<boolean>>;
    network: string;
    setAddress: Dispatch<SetStateAction<string>>;
    address: string;
    setNetwork: Dispatch<SetStateAction<string>>;
}

type WalletInfoContextProviderProps = {
    children: ReactNode;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletContextProvider: React.FC<WalletInfoContextProviderProps> = ({ children }) => {

    const [hasFreighter, setHasFreighter] = useState<boolean>(true);
    const [connected, setConnected] = useState<boolean>(false);
    const [network, setNetwork] = useState<string>("");
    const [address, setAddress] = useState<string>("");

    return (
        <WalletContext.Provider 
            value={{
                hasFreighter,
                setHasFreighter,
                connected,
                setConnected,
                network,
                setNetwork,
                address,
                setAddress
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export const useWalletContext = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
      throw new Error('useWalletContext must be used within a WalletContextProvider');
    }
    return context;
};
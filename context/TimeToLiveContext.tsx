import { createContext, useContext, ReactNode, Dispatch, SetStateAction, useState } from 'react';

export interface TimeToLive {
    automaticBump: boolean;
    date: string;
    ttlSec?: number;
    countdown?: String;
}

export type TimeToLiveType = {
  addressToTtl: Map<String, TimeToLive>;
  setAddressToTtl: Dispatch<SetStateAction<Map<String, TimeToLive>>>
}

type TimeToLiveProviderProps = {
  children: ReactNode;
};

const TimeToLiveContext = createContext<TimeToLiveType | undefined>(undefined);

export const TimeToLiveContextProvider: React.FC<TimeToLiveProviderProps> = ({ children }) => {

  const [addressToTtl, setAddressToTtl] = useState<Map<String, TimeToLive>>(new Map<String, TimeToLive>());

  return (
      <TimeToLiveContext.Provider value={{ addressToTtl, setAddressToTtl }}>
          {children}
      </TimeToLiveContext.Provider>
  );
};

export const useTimeToLiveContext = (): TimeToLiveType => {
  const context = useContext(TimeToLiveContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a TimeToLiveContextProvider');
  }
  return context;
};
import { Dispatch, SetStateAction, createContext, useContext, useState, ReactNode, useEffect } from 'react';

type ThemeType = 'light' | 'dark'

type ThemeContexteType = {
  activeTheme: ThemeType;
  setActiveTheme: Dispatch<SetStateAction<ThemeType>>;
  inactiveTheme: ThemeType;
}

type ThemeContextProviderProps = {
  children: ReactNode;
};

const ThemeContext = createContext<ThemeContexteType | undefined>(undefined);

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {


  const [activeTheme, setActiveTheme] = useState<ThemeType>('light');
  const inactiveTheme: ThemeType = activeTheme === "light" ? "dark" : "light";

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    console.log(storedTheme)
    if (storedTheme) {
      setActiveTheme(storedTheme as ThemeType);
    }
    else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setActiveTheme('dark');
      }
      else {
        setActiveTheme('light');
      }
    }
  }, []);

  //useEffect(() => {
  //  localStorage.setItem("theme", activeTheme as ThemeType);
  //}, [activeTheme]);

  return (
      <ThemeContext.Provider value={{ activeTheme, setActiveTheme, inactiveTheme }}>
          {children}
      </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContexteType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};
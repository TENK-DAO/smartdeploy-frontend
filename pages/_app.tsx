import '@/styles/globals.css'
import { ThemeContextProvider } from '../context/ThemeContext'
import { WalletContextProvider } from '../context/WalletContext'
import { TimeToLiveContextProvider } from '@/context/TimeToLiveContext'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeContextProvider>
      <WalletContextProvider>
        <TimeToLiveContextProvider>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </TimeToLiveContextProvider>
      </WalletContextProvider>
    </ThemeContextProvider>
  )
}

import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { ClientWalletProvider } from '../contexts/useWallet'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClientWalletProvider>
      <Toaster position="top-left" reverseOrder={false} />
      <Component {...pageProps} />
    </ClientWalletProvider>
  )
}

export default MyApp

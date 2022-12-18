import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import type { WalletProviderProps } from '@solana/wallet-adapter-react'
import {
    ConnectionProvider, WalletProvider
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter, TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'
require('@solana/wallet-adapter-react-ui/styles.css')


export function ClientWalletProvider(
  props: Omit<WalletProviderProps, 'wallets'>
): JSX.Element {
  const network = WalletAdapterNetwork.Devnet

  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} {...props}>
        <WalletModalProvider {...props} />
      </WalletProvider>
    </ConnectionProvider>
  )
}

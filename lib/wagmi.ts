import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({ target: 'metaMask' }),
    coinbaseWallet({
      appName: 'Goodcoin',
      appLogoUrl: undefined,
    }),
    injected(),
    // Only add WalletConnect if the project ID is available
    ...(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ? [
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      })
    ] : []),
  ],
  transports: {
    [base.id]: http(),
  },
});

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base],
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'Goodcoin',
      appLogoUrl: undefined,
    }),
    injected(),
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

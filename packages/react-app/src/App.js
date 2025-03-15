import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { Contract } from "@ethersproject/contracts";
import { configureChains, createConfig, WagmiConfig, useAccount, useNetwork, useSwitchNetwork, usePublicClient, useWalletClient } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { useQuery } from "@apollo/client";
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  ConnectButton
} from '@rainbow-me/rainbowkit';
import Riddler from './Riddler';
import { Body, Container, Header, Link } from "./components";
import { addresses, abis } from "@my-app/contracts";
import GET_PUZZLES from "./graphql/subgraph";

const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'SEP',
  },
  rpcUrls: {
    public: { http: ['https://rpc.sepolia.org'] },
    default: { http: ['https://rpc.sepolia.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
  },
  testnet: true,
};

const projectId = "82500884f15e70a2c1ab62e717064432";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [
    process.env.REACT_APP_INFURA_ID ? infuraProvider({ apiKey: process.env.REACT_APP_INFURA_ID }) : null,
    process.env.REACT_APP_ALCHEMY_KEY ? alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY }) : null,
    publicProvider()
  ].filter(Boolean)
);

const { connectors } = getDefaultWallets({
  appName: 'The Riddler',
  projectId,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient
});

function RiddlerApp() {
  const [skip, setSkip] = useState(0);
  const [contract, setContract] = useState(null);
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Handle network switching
  useEffect(() => {
    if (isConnected && chain?.id !== sepolia.id) {
      switchNetwork?.(sepolia.id);
    }
  }, [isConnected, chain, switchNetwork]);

  // Handle provider and signer setup
  useEffect(() => {
    if (isConnected && chain?.id === sepolia.id && walletClient) {
      // For connected wallet state
      const provider = new ethers.providers.Web3Provider(walletClient);
      const signer = provider.getSigner();
      setProvider(provider);
      setSigner(signer);
    } else {
      // For read-only state
      const provider = new ethers.providers.JsonRpcProvider('https://rpc.sepolia.org');
      setProvider(provider);
      setSigner(null);
    }
  }, [isConnected, chain, walletClient]);

  useEffect(() => {
    if (signer && isConnected && chain?.id === sepolia.id) {
      const contract = new Contract(addresses.ceaPuzzleGame, abis.PuzzleGame, signer);
      setContract(contract);
    } else {
      setContract(null);
    }
  }, [signer, isConnected, chain]);

  const { loading, error: subgraphQueryError, data, refetch } = useQuery(GET_PUZZLES, {
    variables: { skip },
  });

  useEffect(() => {
    if (subgraphQueryError) {
      console.error("Error while querying subgraph:", subgraphQueryError.message);
      setSkip(0);
      return;
    }
    if (!loading && data && data?.puzzleCreateds) {
      console.log({ puzzleCreateds: data?.puzzleCreateds });
    } 
  }, [loading, subgraphQueryError, data]);

  if (!loading && data && data?.puzzleCreateds.length === 0) {
    setSkip(0);
  }

  const puzzle = data?.puzzleCreateds?.[0];

  const handleNextClick = () => {
    setSkip(skip + 1);
    refetch();
  };

  const handlePreviousClick = () => {
    if (skip > 0) {
      setSkip(skip - 1);
      refetch();
    }
  };

  return (
    <Container>
      <Header>
        <ConnectButton />
      </Header>
      <Body>
        <Riddler 
          provider={provider} 
          signer={signer}
          contract={contract} 
          puzzle={puzzle}
          onPrevious={handlePreviousClick}
          onNext={handleNextClick}
          canGoPrevious={skip > 0}
        />
      </Body>
      <footer className="riddler-footer">
        <Link 
          href="https://sepolia.etherscan.io/address/0x67fad1f2547c62215b17e39e9c2c4c7832d36aeb"
          className="riddler-link"
        >
          Deployed Contract
        </Link>
        <Link 
          href="https://github.com/severiano-sisneros/puzzles_contract_foundry"
          className="riddler-link"
        >
          Contract Source Code
        </Link>
        <Link 
          href="https://github.com/severiano-sisneros/the-riddler"
          className="riddler-link"
        >
          dApp and Subgraph Source Code
        </Link>
      </footer>
    </Container>
  );
}

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider 
        chains={chains}
        projectId={projectId}
        coolMode
        modalSize="compact"
        showRecentTransactions={true}
        initialChain={sepolia}
        theme={darkTheme({
          accentColor: '#7b3fe4',
          accentColorForeground: 'white',
          borderRadius: 'medium'
        })}
      >
        <RiddlerApp />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;

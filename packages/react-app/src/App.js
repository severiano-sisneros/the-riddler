import Riddler from './Riddler';
import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { Body, Container, Header, Link, WalletModal } from "./components";
import { addresses, abis } from "@my-app/contracts";
import GET_PUZZLES from "./graphql/subgraph";

function WalletButton({ setProvider, setContract }) {
  const [showModal, setShowModal] = useState(false);
  const [rendered, setRendered] = useState("");
  const { ens } = useLookupAddress();
  const { account, activateBrowserWallet, deactivate, error } = useEthers();

  useEffect(() => {
    if (ens) {
      setRendered(ens);
    } else if (account) {
      setRendered(shortenAddress(account));
    } else {
      setRendered("");
    }
  }, [account, ens, setRendered]);

  useEffect(() => {
    if (error) {
      console.error("Error while connecting wallet:", error.message);
    }
  }, [error]);

  const handleWalletSelect = async (wallet) => {
    try {
      if (!wallet.getProvider) {
        // Handle WalletConnect case when implemented
        alert('This wallet type is not yet supported');
        return;
      }

      // Activate browser wallet first through useDApp
      await activateBrowserWallet();

      // Get the provider after activation
      const injectedProvider = wallet.getProvider();
      if (!injectedProvider) {
        throw new Error('No provider available');
      }

      // Initialize ethers provider
      const provider = new ethers.providers.Web3Provider(injectedProvider, 'any');

      // Request accounts
      try {
        await provider.send("eth_requestAccounts", []);
      } catch (error) {
        if (error.code === 4001) {
          throw new Error('Please approve the connection request in your wallet.');
        }
        throw error;
      }

      // Get signer after successful activation
      const signer = provider.getSigner();
      
      // Initialize contract
      const contract = new ethers.Contract(addresses.ceaPuzzleGame, abis.PuzzleGame, signer);
      
      // Update state
      setProvider(provider);
      setContract(contract);
      setShowModal(false);

      // Log success but catch any errors to prevent UI disruption
      try {
        console.log('Wallet connected successfully:', {
          address: await signer.getAddress(),
          chainId: (await provider.getNetwork()).chainId
        });
      } catch (error) {
        console.error('Error logging wallet details:', error);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert(error.message || 'Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    deactivate();
    setProvider(null);
    setContract(null);
  };

  return (
    <>
      <button
        className="riddler-button"
        onClick={() => {
          if (!account) {
            setShowModal(true);
          } else {
            handleDisconnect();
          }
        }}
      >
        {rendered === "" && "Connect Wallet"}
        {rendered !== "" && rendered}
      </button>

      {showModal && (
        <WalletModal
          onClose={() => setShowModal(false)}
          onSelectWallet={handleWalletSelect}
        />
      )}
    </>
  );
}

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [skip, setSkip] = useState(0);

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
        <WalletButton setProvider={setProvider} setContract={setContract} />
      </Header>
      <Body>
        <Riddler 
          provider={provider} 
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

export default App;

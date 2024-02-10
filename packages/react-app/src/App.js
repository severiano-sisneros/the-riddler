import Riddler from './Riddler';
import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { Title, Body, Button, Container, Header, Image, ButtonContainer} from "./components";
import logo from "./ethereumLogo.png";

import { addresses, abis } from "@my-app/contracts";
import GET_PUZZLES from "./graphql/subgraph";

function WalletButton({ setProvider, setContract }) {
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

  const initContract = () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(addresses.ceaPuzzleGame, abis.PuzzleGame, signer);
      setProvider(provider);
      setContract(contract);
      window.ethereum.enable(); // Request access to Metamask
    } else {
      console.error("Ethereum object doesn't exist!");
    }
  };

  return (
    <Button
      onClick={() => {
        if (!account) {
          initContract(); // Initialize provider and contract when clicking "Connect Wallet" button
          activateBrowserWallet();
        } else {
          deactivate();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [skip, setSkip] = useState(0); // Initialize skip variable

  const { loading, error: subgraphQueryError, data, refetch } = useQuery(GET_PUZZLES, {
    variables: { skip }, // Use skip variable in the query
  });

  useEffect(() => {
    if (subgraphQueryError) {
      console.error("Error while querying subgraph:", subgraphQueryError.message);
      setSkip(0); // Reset skip to 0 if there's an error  
      return;
    }
    if (!loading && data && data?.puzzleCreateds) {
      console.log({ puzzleCreateds: data?.puzzleCreateds });
    } 
  }, [loading, subgraphQueryError, data]);

  // if data.puzzleCreateds is empty, reset skip to 0
  if (!loading && data && data?.puzzleCreateds.length === 0) {
    setSkip(0);
  }

  const puzzle = data?.puzzleCreateds?.[0]; // Assuming you only expect one puzzle

  const handleNextClick = () => {
    setSkip(skip + 1); // Increment skip by 1 to fetch the next set of puzzles
    refetch(); // Refetch data with the updated skip variable
  };

  const handlePreviousClick = () => {
    if (skip > 0) {
      setSkip(skip - 1); // Decrement skip by 1 to fetch the previous set of puzzles
      refetch(); // Refetch data with the updated skip variable
    }
  };

  return (
    <Container>
      <Header>
        <WalletButton setProvider={setProvider} setContract={setContract} />
      </Header>
      <Title>Welcome to The Riddler?</Title>

      <Body>
        <ButtonContainer>
          {/* Button to navigate to the previous set of puzzles */}
          <Button onClick={handlePreviousClick} disabled={skip === 0}>Previous</Button>
          <Riddler provider={provider} contract={contract} puzzle={puzzle} />
          {/* Button to navigate to the next set of puzzles */}
          <Button onClick={handleNextClick}>Next</Button>
        </ButtonContainer>
      </Body>
    </Container>
  );
}


export default App;

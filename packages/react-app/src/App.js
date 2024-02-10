import Riddler from './Riddler';
import { useQuery } from "@apollo/client";
import { Contract } from "@ethersproject/contracts";
import { shortenAddress, useCall, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import { Title, Body, Button, Container, Header, Image, Link } from "./components";
import logo from "./ethereumLogo.png";

import { addresses, abis } from "@my-app/contracts";
import GET_TRANSFERS from "./graphql/subgraph";

function WalletButton() {
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

  return (
    <Button
      onClick={() => {
        if (!account) {
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
  const { provider, contract } = initContract(); // Initialize provider and contract
  
  return (
    <Container>
      
      <Header>
      
        <WalletButton />
        
      </Header>
      <Title>Welcome to The Riddler!</Title>
      
      <Body>
      <Riddler provider={provider} contract={contract} />
        <Image src={logo} alt="ethereum-logo" />
      </Body>
    </Container>
  );
}

export default App;

// Initialize provider and contract
function initContract() {
  let provider = null;
  let contract = null;
  
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    contract = new ethers.Contract(addresses.ceaPuzzleGame, abis.PuzzleGame, signer);
    window.ethereum.enable(); // Request access to Metamask
  } else {
    console.error("Ethereum object doesn't exist!");
  }

  return { provider, contract };
}
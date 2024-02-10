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

  return (
    <Container>
      <Header>
        <WalletButton setProvider={setProvider} setContract={setContract} />
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

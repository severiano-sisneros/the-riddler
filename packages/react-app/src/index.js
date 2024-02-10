import "./index.css";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { DAppProvider, Sepolia } from "@usedapp/core";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

// Using Alchemy
const ALCHEMY_PROJECT_ID = "kU_dLcYeCZlp0Ld32NbO6bRSrRAk1LTj";
const config = {
  readOnlyChainId: Sepolia.chainId,
  readOnlyUrls: {
    [Sepolia.chainId]: "https://eth-sepolia.g.alchemy.com/v2/" + ALCHEMY_PROJECT_ID,
  },
}

// You should replace this url with your own and put it into a .env file
// See all subgraphs: https://thegraph.com/explorer/
const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app",
});

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
);

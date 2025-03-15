import { gql } from "@apollo/client";

// See more example queries on https://thegraph.com/explorer/subgraph/paulrberg/create-eth-app
const GET_PUZZLES = gql`
query GetPuzzles($skip: Int!)
{
  puzzleCreateds(first: 1, skip: $skip, orderBy: blockTimestamp, orderDirection: desc) {
    author
    solutionCommitment
    maxSolvers
    data
    blockTimestamp
  }
}
`;

export default GET_PUZZLES;

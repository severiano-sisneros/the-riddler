import React, { useState } from 'react';
import { ethers } from 'ethers';

// Smart contract ABI and address
import { addresses, abis } from "@my-app/contracts";

function Riddler() {
const [provider, setProvider] = useState(null);
const [contract, setContract] = useState(null);
const [question, setQuestion] = useState('');
const [authorAddress, setAuthorAddress] = useState('');
const [answer, setAnswer] = useState('');
const [solutionCommitment, setSolutionCommitment] = useState('');
const [maxSolvers, setMaxSolvers] = useState('');
const [guess, setGuess] = useState('');
const puzzleType = 1;

// Initialize ethers provider and contract
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

// Puzzle maker submits a question
const createPuzzle = async () => {
    if (!question) {
        alert('Please enter a question');
        return;
    }

    if (contract) {
        try {
            // Compute solution commitment
            const { address } = await getSolutionCommitment(answer);
            const transaction = await contract.createPuzzle(puzzleType, question, address, maxSolvers);
            await transaction.wait();
            alert('Puzzle created successfully!');
        } catch (error) {
            console.error('Error creating puzzle:', error);
        }
    }
};

// Player submits an answer
const submitAnswer = async () => {
    if (contract && provider) {
        try {
            const signer = await provider.getSigner()
            const solverAddressRaw = await signer.getAddress();
            const solverAddress = ethers.utils.getAddress(solverAddressRaw);
            const { wallet } = await getSolutionCommitment(guess);
            const { signature } = await getSolutionProof(wallet, solutionCommitment, solverAddress);
            const { r, s, v } = signature;
            const transaction = await contract.submitProof(authorAddress, puzzleType, question, solutionCommitment, maxSolvers, [r,s,v], solverAddress);
            await transaction.wait();
            alert('Answer submitted successfully!');
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    }
    else {
        console.error('Contract or provider not initialized');
    }
};

return (
    <div>
        <button onClick={initContract}>Connect Wallet</button>
        <div>
            <h2>Submit Riddle</h2>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter question" />
            <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter answer" />
            <input type="text" value={maxSolvers} onChange={(e) => setMaxSolvers(e.target.value)} placeholder="Max Solvers" />
            <button onClick={createPuzzle}>Submit Question</button>
        </div>
        <div>
            <h2>Solve Riddle</h2>
            <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter question" />
            <input type="text" value={authorAddress} onChange={(e) => setAuthorAddress(e.target.value)} placeholder="Author Address" />
            <input type="text" value={solutionCommitment} onChange={(e) => setSolutionCommitment(e.target.value)} placeholder="Solution Commitment" />
            <input type="text" value={maxSolvers} onChange={(e) => setMaxSolvers(e.target.value)} placeholder="Max Solvers" />
            <input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Your answer" />
            <button onClick={submitAnswer}>Submit Answer</button>
        </div>
    </div>
);
}

async function getSolutionCommitment(solutions) {
    // parse solutions sentence by spaces into array
    solutions = solutions.split(' ');
    if (!Array.isArray(solutions) || solutions.length === 0 || !solutions.every(solution => typeof solution === 'string')) {
        throw new Error('Invalid solutions array');
    }

    // Convert solutions to hexadecimal strings
    const hexSolutions = solutions.map(solution => ethers.utils.formatBytes32String(solution));

    // Concatenate solutions and hash
    const concatenatedHash = ethers.utils.solidityKeccak256(['string[]'], [hexSolutions]);

    // Create an Ethereum signing key from the final hash bytes
    const signingKey = new ethers.utils.SigningKey(concatenatedHash);

    // Create an Ethereum wallet from the signing key
    let wallet = new ethers.Wallet(signingKey);

    // Get the address from the wallet
    let address = wallet.address;

    // Return the wallet and address
    return { wallet, address };
}

async function getSolutionProof(wallet, solutionCommitment, mS) {
    try {
        // Check that the provided wallet's address matches the solution commitment
        if (wallet.address !== solutionCommitment) {
            // display wallet.address and solutionCommitment
            console.log(wallet.address);
            console.log(solutionCommitment);
            throw new Error('Invalid solution');
        }

        // Compute hash of mS
        const mSHash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [mS]));

        // get signing key
        const signingKey = new ethers.utils.SigningKey(wallet.privateKey);
        // sign digest with signing key
        const digest = ethers.utils.arrayify(mSHash);
        const signature = signingKey.signDigest(digest);
        const recovered_address = ethers.utils.recoverAddress(digest, signature);

        if (recovered_address !== wallet.address) {
            throw new Error('SOMETHINGS WRONG: Invalid signature');
        }
        // Return the proof object containing the signature and mS
        return { signature, mS };
    } catch (error) {
        console.error('Error getting solution proof:', error);
        throw error;
    }
}

export default Riddler;

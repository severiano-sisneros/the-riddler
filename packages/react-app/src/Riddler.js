import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Body, Button, Input } from "./components";
// Smart contract ABI and address
import { addresses, abis } from "@my-app/contracts";

function Riddler({provider, contract}) {
const [activeSection, setActiveSection] = useState(null);
const [question, setQuestion] = useState('');
const [authorAddress, setAuthorAddress] = useState('');
const [answer, setAnswer] = useState('');
const [solutionCommitment, setSolutionCommitment] = useState('');
const [maxSolvers, setMaxSolvers] = useState('');
const [solverMaxSolvers, setSolverMaxSolvers] = useState('');
const [solverQuestion, setSolverQuestion] = useState('');
const [guess, setGuess] = useState('');
const puzzleType = 1;

const handleSectionClick = (section) => {
    setActiveSection(section);
};

const handleBackClick = () => {
    setActiveSection(null);
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
            const transaction = await contract.submitProof(authorAddress, puzzleType, solverQuestion, solutionCommitment, solverMaxSolvers, [r,s,v], solverAddress);
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
    <div style={{ textAlign: 'center' }}>
        {activeSection !== 'submit' && activeSection !== 'solve' && (
                <div>
                    <Button onClick={() => handleSectionClick('submit')}>Submit Riddle</Button>
                    <Button onClick={() => handleSectionClick('solve')}>Solve Riddle</Button>
                </div>
            )}
        
        {activeSection === 'submit' && (
            <div>
                <h2>Submit Riddle</h2>
                <div>
                <Input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter question" /><br />
                <Input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter answer" /><br />
                <Input type="text" value={maxSolvers} onChange={(e) => setMaxSolvers(e.target.value)} placeholder="Max Solvers" /><br />
                <Button onClick={createPuzzle}>Submit Question</Button><br />
                </div>
            </div>
        )}
        {activeSection === 'solve' && (
            <div>
                <h2>Solve Riddle</h2>
                <div>
                <Input type="text" value={solverQuestion} onChange={(e) => setSolverQuestion(e.target.value)} placeholder="Enter question" /><br />
                <Input type="text" value={authorAddress} onChange={(e) => setAuthorAddress(e.target.value)} placeholder="Author Address" /><br />
                <Input type="text" value={solutionCommitment} onChange={(e) => setSolutionCommitment(e.target.value)} placeholder="Solution Commitment" /><br />
                <Input type="text" value={solverMaxSolvers} onChange={(e) => setSolverMaxSolvers(e.target.value)} placeholder="Max Solvers" /><br />
                <Input type="text" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Your answer" /><br />
                <Button onClick={submitAnswer}>Submit Answer</Button> <br />
                </div>
            </div>
        )}
        {(activeSection === 'submit' || activeSection === 'solve') && (
                <button onClick={handleBackClick}>Back</button>
            )}
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

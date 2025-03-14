import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
// Smart contract ABI and address
import { addresses, abis } from "@my-app/contracts";

function Riddler({provider, contract, puzzle, onPrevious, onNext, canGoPrevious}) {
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

    useEffect(() => {
        if (activeSection === 'solve' && puzzle) {
            setSolverQuestion(puzzle.data);
            setAuthorAddress(puzzle.author);
            setSolutionCommitment(puzzle.solutionCommitment);
            setSolverMaxSolvers(puzzle.maxSolvers);
            // Reset answer state when navigating to a new riddle
            setGuess('');
            setSubmitError('');
            setCorrectAnswer(false);
            setAnswerData(null);
        }
    }, [activeSection, puzzle]);

    const handleSectionClick = (section) => {
        setActiveSection(section);
    };

    const handleBackClick = () => {
        setActiveSection(null);
    };

    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    // Puzzle maker submits a question
    const createPuzzle = async () => {
        if (!contract || !provider) {
            setCreateError('Please connect your wallet first');
            return;
        }

        if (!question) {
            setCreateError('Please enter a question');
            return;
        }

        if (!answer) {
            setCreateError('Please enter an answer');
            return;
        }

        if (!maxSolvers) {
            setCreateError('Please enter maximum number of solvers');
            return;
        }

        setIsCreating(true);
        setCreateError('');

        try {
            // Check network
            const network = await provider.getNetwork();
            if (network.chainId !== 11155111) {
                throw new Error('Please switch to Sepolia network');
            }

            // Compute solution commitment
            console.log('Generating solution commitment...');
            const { address } = await getSolutionCommitment(answer);
            if (!address) {
                throw new Error('Failed to generate solution commitment');
            }

            // Create puzzle
            console.log('Creating puzzle...');
            const transaction = await contract.createPuzzle(
                puzzleType,
                question,
                address,
                maxSolvers,
                { 
                    gasLimit: 500000,
                    gasPrice: await provider.getGasPrice()
                }
            );

            console.log('Transaction submitted:', transaction.hash);
            console.log('Waiting for confirmation...');

            // Wait for transaction
            const receipt = await transaction.wait();
            
            if (receipt.status === 1) {
                console.log('Transaction confirmed:', receipt);
                // Clear form
                setQuestion('');
                setAnswer('');
                setMaxSolvers('');
                const etherscanUrl = `https://sepolia.etherscan.io/tx/${transaction.hash}`;
                setCreateError('');
                // Show success message
                const successMessage = (
                    <p className="riddler-transaction-success">
                        Puzzle created successfully!
                        <br />
                        Transaction ID: 
                        <code className="riddler-transaction-id">
                            <a 
                                href={etherscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="riddler-transaction-link"
                            >
                                {transaction.hash}
                            </a>
                        </code>
                    </p>
                );
                setCreateError(successMessage);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Error creating puzzle:', error);
            
            let errorMessage = 'Failed to create puzzle: ';
            
            if (error.code === 'ACTION_REJECTED') {
                errorMessage = 'Transaction was rejected. Please try again.';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds to complete transaction.';
            } else if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was cancelled.';
            } else {
                errorMessage += error.message;
            }
            
            setCreateError(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState(false);
    const [answerData, setAnswerData] = useState(null);

    // Check if answer is correct
    const checkAnswer = async () => {
        if (!guess) {
            setSubmitError('Please enter your answer');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Get solution commitment
            console.log('Checking answer...');
            const { wallet } = await getSolutionCommitment(guess);
            if (!wallet) {
                throw new Error('Failed to process answer');
            }

            // Check if the answer matches
            const normalizedCommitment = ethers.utils.getAddress(solutionCommitment);
            const isCorrect = wallet.address === normalizedCommitment;

            if (isCorrect) {
                console.log('Answer is correct!');
                setCorrectAnswer(true);
                setAnswerData({ wallet, solverAddress: null }); // Will set solver address when submitting
            } else {
                throw new Error('Incorrect answer. Please try again.');
            }
        } catch (error) {
            console.error('Error checking answer:', error);
            setSubmitError(error.message || 'Error checking answer');
            setCorrectAnswer(false);
            setAnswerData(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Submit correct answer to blockchain
    const submitToBlockchain = async () => {
        if (!contract || !provider) {
            setSubmitError('Please connect your wallet first');
            return;
        }

        if (!answerData?.wallet) {
            setSubmitError('Please check your answer first');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Get signer and check network
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();
            
            if (network.chainId !== 11155111) {
                throw new Error('Please switch to Sepolia network');
            }

            const solverAddressRaw = await signer.getAddress();
            const solverAddress = ethers.utils.getAddress(solverAddressRaw);
            
            // Get solution proof
            console.log('Generating solution proof...');
            const { signature } = await getSolutionProof(answerData.wallet, solutionCommitment, solverAddress);
            if (!signature) {
                throw new Error('Failed to generate solution proof');
            }

            const { r, s, v } = signature;

            // Submit proof
            console.log('Submitting to blockchain...');
            const transaction = await contract.submitProof(
                authorAddress,
                puzzleType,
                solverQuestion,
                solutionCommitment,
                solverMaxSolvers,
                [r,s,v],
                solverAddress,
                { 
                    gasLimit: 500000,
                    gasPrice: await provider.getGasPrice()
                }
            );

            console.log('Transaction submitted:', transaction.hash);
            console.log('Waiting for confirmation...');

            // Wait for transaction
            const receipt = await transaction.wait();
            
            if (receipt.status === 1) {
                console.log('Transaction confirmed:', receipt);
                setGuess(''); // Clear input
                setCorrectAnswer(false); // Reset state
                setAnswerData(null);
                const etherscanUrl = `https://sepolia.etherscan.io/tx/${transaction.hash}`;
                setSubmitError('');
                // Show success message
                const successMessage = (
                    <p className="riddler-transaction-success">
                        Congratulations! Your solution has been recorded on the blockchain.
                        <br />
                        Transaction ID: 
                        <code className="riddler-transaction-id">
                            <a 
                                href={etherscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="riddler-transaction-link"
                            >
                                {transaction.hash}
                            </a>
                        </code>
                    </p>
                );
                setSubmitError(successMessage);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Error submitting to blockchain:', error);
            
            let errorMessage = 'Failed to submit: ';
            
            if (error.code === 'ACTION_REJECTED') {
                errorMessage = 'Transaction was rejected. Please try again.';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds to complete transaction.';
            } else if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was cancelled.';
            } else {
                errorMessage += error.message;
            }
            
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="riddler-container">
            <h1 className="riddler-title">The Riddler</h1>
            
            <div className="riddler-content">
                {!activeSection && (
                    <p className="riddler-text">
                        Welcome, seeker of mysteries. Choose your path wisely...
                    </p>
                )}

                {!activeSection && (
                    <div className="riddler-section">
                    <button className="riddler-button" onClick={() => handleSectionClick('submit')}>
                        Create Mystery
                    </button>
                    <button className="riddler-button" onClick={() => handleSectionClick('solve')}>
                        Unravel Riddle
                    </button>
                </div>
            )}
            
                {activeSection === 'submit' && (
                    <div className="riddler-section">
                    <h2 className="riddler-text">Forge Your Mystery</h2>
                    <textarea
                        className="riddler-input"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question..."
                        rows={1}
                        onInput={(e) => {
                            // Auto-adjust height
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                    <textarea
                        className="riddler-input"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter the answer..."
                        rows={1}
                        onInput={(e) => {
                            // Auto-adjust height
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                    <input
                        className="riddler-input"
                        type="number"
                        value={maxSolvers}
                        onChange={(e) => setMaxSolvers(e.target.value)}
                        placeholder="Maximum number of solvers"
                    />
                    <button 
                        className="riddler-button" 
                        onClick={createPuzzle}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Creating...' : 'Submit Riddle'}
                    </button>
                    {createError && (
                        <p className="riddler-error">{createError}</p>
                    )}
                </div>
            )}

                {activeSection === 'solve' && (
                    <>
                        <div className="riddler-header">
                            <button 
                                className="riddler-nav-button" 
                                onClick={onPrevious}
                                disabled={!canGoPrevious}
                            >
                                Previous Enigma
                            </button>
                            <button 
                                className="riddler-nav-button" 
                                onClick={onNext}
                            >
                                Next Enigma
                            </button>
                        </div>
                        <div className="riddler-section">
                            <h2 className="riddler-text">Unravel The Mystery</h2>
                            <p className="riddler-text">{solverQuestion}</p>
                            <textarea
                                className="riddler-input"
                                value={guess}
                                onChange={(e) => setGuess(e.target.value)}
                                placeholder="Enter your answer..."
                                rows={1}
                                onInput={(e) => {
                                    // Auto-adjust height
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />
                            {!correctAnswer ? (
                                <button 
                                    className="riddler-button" 
                                    onClick={checkAnswer}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Checking...' : 'Check Answer'}
                                </button>
                            ) : (
                                <div className="riddler-success">
                                    <p className="riddler-success-text">
                                        Correct! Would you like to submit your solution to the blockchain?
                                    </p>
                                    <button 
                                        className="riddler-button" 
                                        onClick={submitToBlockchain}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit to Blockchain'}
                                    </button>
                                </div>
                            )}
                            {submitError && (
                                <p className="riddler-error">{submitError}</p>
                            )}
                        </div>
                    </>
                )}

                {(activeSection === 'submit' || activeSection === 'solve') && (
                    <button className="riddler-button" onClick={handleBackClick}>
                        Return to Sanctum
                    </button>
                )}
            </div>
        </div>
    );
}

async function getSolutionCommitment(solutions) {
    try {
        // Validate input
        if (!solutions || typeof solutions !== 'string') {
            throw new Error('Please enter a valid answer');
        }

        // Parse solutions sentence by spaces into array
        const solutionsArray = solutions.trim().split(' ').filter(s => s.length > 0);
        if (solutionsArray.length === 0) {
            throw new Error('Please enter at least one word');
        }

        // Validate each solution word
        if (!solutionsArray.every(solution => /^[a-zA-Z0-9]+$/.test(solution))) {
            throw new Error('Answer can only contain letters and numbers');
        }

        // Convert solutions to hexadecimal strings
        const hexSolutions = solutionsArray.map(solution => {
            try {
                return ethers.utils.formatBytes32String(solution);
            } catch (error) {
                console.error('Error formatting solution:', error);
                throw new Error('Invalid answer format');
            }
        });

        // Concatenate solutions and hash
        const concatenatedHash = ethers.utils.solidityKeccak256(['string[]'], [hexSolutions]);

        // Create an Ethereum signing key and wallet
        const signingKey = new ethers.utils.SigningKey(concatenatedHash);
        const wallet = new ethers.Wallet(signingKey);

        console.log('Solution commitment generated successfully');
        return { wallet, address: wallet.address };
    } catch (error) {
        console.error('Error generating solution commitment:', error);
        throw new Error(error.message || 'Error processing answer');
    }
}

async function getSolutionProof(wallet, solutionCommitment, mS) {
    try {
        // Validate inputs
        if (!wallet || !solutionCommitment || !mS) {
            throw new Error('Missing required parameters for solution proof');
        }

        // Check that the provided wallet's address matches the solution commitment
        const normalizedCommitment = ethers.utils.getAddress(solutionCommitment);
        if (wallet.address !== normalizedCommitment) {
            console.error('Address mismatch:', {
                walletAddress: wallet.address,
                commitment: normalizedCommitment
            });
            throw new Error('Incorrect answer');
        }

        // Compute hash of mS
        const mSHash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(['address'], [mS])
        );

        // Sign the digest
        const signingKey = new ethers.utils.SigningKey(wallet.privateKey);
        const digest = ethers.utils.arrayify(mSHash);
        const signature = signingKey.signDigest(digest);

        // Verify signature
        const recovered_address = ethers.utils.recoverAddress(digest, signature);
        if (recovered_address !== wallet.address) {
            console.error('Signature verification failed:', {
                recovered: recovered_address,
                expected: wallet.address
            });
            throw new Error('Invalid signature generated');
        }

        console.log('Solution proof generated successfully');
        return { signature, mS };
    } catch (error) {
        console.error('Error generating solution proof:', error);
        throw new Error(error.message || 'Error verifying answer');
    }
}

export default Riddler;

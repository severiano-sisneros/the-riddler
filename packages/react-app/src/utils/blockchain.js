import { ethers } from 'ethers';

export async function getSolutionCommitment(solutions) {
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

export async function getSolutionProof(wallet, solutionCommitment, mS) {
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

export function validateNetwork(provider) {
    return provider.getNetwork().then(network => {
        if (network.chainId !== 11155111) {
            throw new Error('Please switch to Sepolia network');
        }
        return true;
    });
}

export function getTransactionConfig(provider) {
    return provider.getGasPrice().then(gasPrice => ({
        gasLimit: 500000,
        gasPrice: gasPrice.mul(120).div(100) // Add 20% to gas price
    }));
}

export function formatTransactionSuccess(hash) {
    if (!hash) return 'Transaction successful!';
    return `Transaction successful! Transaction hash: ${hash.toString()}`;
}

export function formatTransactionError(error) {
    let errorMessage = 'Transaction failed: ';
    
    if (error.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected. Please try again.';
    } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds to complete transaction.';
    } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled.';
    } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network connection error. Please check your connection and try again.';
    } else if (error.message.includes('transaction failed')) {
        errorMessage = 'Transaction failed. Please try again with a higher gas price.';
    } else {
        errorMessage += error.message;
    }
    
    return errorMessage;
}

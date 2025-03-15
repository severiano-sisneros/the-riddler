import { useState, useEffect } from 'react';
import { useAccount, useNetwork, useSwitchNetwork, useWalletClient, usePublicClient } from 'wagmi';
import { getSolutionCommitment, getSolutionProof, formatTransactionSuccess, formatTransactionError } from '../utils/blockchain';
import { getAddress } from 'viem';
import { abis } from "@my-app/contracts";

export function useSolvePuzzle({ puzzle, contract }) {
    const [guess, setGuess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState(false);
    const [answerData, setAnswerData] = useState(null);

    const { isConnected, address } = useAccount();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    // Reset states when puzzle changes
    useEffect(() => {
        setGuess('');
        setSubmitError('');
        setCorrectAnswer(false);
        setAnswerData(null);
    }, [puzzle]);

    const handleGuessChange = (e) => {
        setGuess(e.target.value);
    };

    const checkAnswer = async () => {
        if (!guess) {
            setSubmitError('Please enter your answer');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Get solution commitment
            const { wallet } = await getSolutionCommitment(guess);
            if (!wallet) {
                throw new Error('Failed to process answer');
            }

            // Check if the answer matches
            const normalizedCommitment = getAddress(puzzle.solutionCommitment);
            const isCorrect = wallet.address === normalizedCommitment;

            if (isCorrect) {
                setCorrectAnswer(true);
                setAnswerData({ wallet });
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

    const submitToBlockchain = async () => {
        if (!isConnected) {
            setSubmitError('Please connect your wallet and switch to Sepolia network');
            return;
        }

        if (!answerData?.wallet) {
            setSubmitError('Please check your answer first');
            return;
        }

        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Switch network if needed
            if (chain?.id !== 11155111) {
                await switchNetwork?.(11155111);
                return; // Return here as switchNetwork will trigger a re-render with the new chain
            }

            if (!contract || !walletClient || !address) {
                throw new Error('Contract or wallet not available');
            }

            // Get solution proof
            const { signature } = await getSolutionProof(
                answerData.wallet,
                puzzle.solutionCommitment,
                address
            );
            if (!signature) {
                throw new Error('Failed to generate solution proof');
            }

            // Submit proof
            console.log('Sending transaction...');
            const hash = await contract.write.submitProof([
                puzzle.author,
                1, // puzzleType
                puzzle.data,
                puzzle.solutionCommitment,
                puzzle.maxSolvers,
                [signature.r, signature.s, signature.v],
                address
            ], {
                account: address,
                chain: chain
            });

            console.log('Transaction hash:', hash);

            // Clear form immediately after transaction is sent
            setGuess('');
            setCorrectAnswer(false);
            setAnswerData(null);

            // Set success message with transaction hash
            setSubmitError(formatTransactionSuccess(hash));

            // Wait for transaction in background
            publicClient.waitForTransactionReceipt({ hash }).then(receipt => {
                if (receipt.status !== 1) {
                    setSubmitError('Transaction failed. Please check Etherscan for details.');
                }
            }).catch(error => {
                console.error('Transaction error:', error);
                setSubmitError(formatTransactionError(error));
            }).finally(() => {
                setIsSubmitting(false);
            });

            // Don't wait for receipt to return
            return;
        } catch (error) {
            console.error('Error submitting to blockchain:', error);
            setSubmitError(formatTransactionError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        guess,
        handleGuessChange,
        checkAnswer,
        submitToBlockchain,
        isSubmitting,
        submitError,
        correctAnswer
    };
}

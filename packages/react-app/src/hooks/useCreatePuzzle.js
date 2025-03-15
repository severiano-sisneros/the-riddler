import { useState } from 'react';
import { useAccount, useNetwork, useSwitchNetwork, useWalletClient, usePublicClient } from 'wagmi';
import { getSolutionCommitment, formatTransactionSuccess, formatTransactionError } from '../utils/blockchain';
import { abis } from "@my-app/contracts";

export function useCreatePuzzle({ contract }) {
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        maxSolvers: ''
    });
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const { isConnected, address } = useAccount();
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.question) {
            throw new Error('Please enter a question');
        }
        if (!formData.answer) {
            throw new Error('Please enter an answer');
        }
        if (!formData.maxSolvers) {
            throw new Error('Please enter maximum number of solvers');
        }
    };

    const handleSubmit = async () => {
        if (!isConnected) {
            setCreateError('Please connect your wallet and switch to Sepolia network');
            return;
        }

        setIsCreating(true);
        setCreateError('');

        try {
            validateForm();

            // Switch network if needed
            if (chain?.id !== 11155111) {
                await switchNetwork?.(11155111);
                return; // Return here as switchNetwork will trigger a re-render with the new chain
            }

            // Generate solution commitment
            const { address: solutionAddress } = await getSolutionCommitment(formData.answer);
            if (!solutionAddress) {
                throw new Error('Failed to generate solution commitment');
            }

            if (!contract || !walletClient) {
                throw new Error('Contract or wallet not available');
            }

            // Create puzzle
            console.log('Sending transaction...');
            const hash = await contract.write.createPuzzle([
                1,
                formData.question,
                solutionAddress,
                formData.maxSolvers
            ], {
                account: address,
                chain: chain
            });

            console.log('Transaction hash:', hash);

            // Clear form immediately after transaction is sent
            setFormData({
                question: '',
                answer: '',
                maxSolvers: ''
            });

            // Set success message with transaction hash
            setCreateError(formatTransactionSuccess(hash));

            // Wait for transaction in background
            publicClient.waitForTransactionReceipt({ hash }).then(receipt => {
                if (receipt.status !== 1) {
                    setCreateError('Transaction failed. Please check Etherscan for details.');
                }
            }).catch(error => {
                console.error('Transaction error:', error);
                setCreateError(formatTransactionError(error));
            }).finally(() => {
                setIsCreating(false);
            });

            // Don't wait for receipt to return
            return;
        } catch (error) {
            console.error('Error creating puzzle:', error);
            setCreateError(formatTransactionError(error));
        } finally {
            setIsCreating(false);
        }
    };

    return {
        formData,
        handleInputChange,
        handleSubmit,
        isCreating,
        createError
    };
}

import React, { memo, useCallback } from 'react';
import { useCreatePuzzle } from '../hooks/useCreatePuzzle';
import { useAccount } from 'wagmi';

const CreatePuzzle = memo(function CreatePuzzle({ contract }) {
    const { isConnected } = useAccount();
    const {
        formData,
        handleInputChange,
        handleSubmit,
        isCreating,
        createError
    } = useCreatePuzzle({ contract });

    const handleAutoResize = useCallback((e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }, []);

    if (!isConnected || !contract) {
        return (
            <div className="riddler-section" style={{ textAlign: 'center', padding: '20px' }}>
                <p>Please connect your wallet to create a puzzle</p>
            </div>
        );
    }

    return (
        <div className="riddler-section">
            <h2 className="riddler-text">Forge Your Mystery</h2>
            <textarea
                className="riddler-input"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="Enter your question..."
                rows={1}
                onInput={handleAutoResize}
            />
            <textarea
                className="riddler-input"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                placeholder="Enter the answer..."
                rows={1}
                onInput={handleAutoResize}
            />
            <input
                className="riddler-input"
                type="number"
                name="maxSolvers"
                value={formData.maxSolvers}
                onChange={handleInputChange}
                placeholder="Maximum number of solvers"
            />
            <button 
                className="riddler-button" 
                onClick={handleSubmit}
                disabled={isCreating}
            >
                {isCreating ? 'Creating...' : 'Submit Riddle'}
            </button>
            {createError && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    {createError.includes('Transaction successful') ? (
                        <>
                            <p className="riddler-success-text">
                                🎉 Puzzle created successfully! 🎉
                            </p>
                            {createError.split('Transaction hash: ')[1] && (
                                <a 
                                    href={`https://sepolia.etherscan.io/tx/${createError.split('Transaction hash: ')[1].trim()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#7b3fe4', textDecoration: 'underline', display: 'block', marginTop: '5px' }}
                                >
                                    View on Etherscan
                                </a>
                            )}
                        </>
                    ) : (
                        <p className="riddler-error">{createError}</p>
                    )}
                </div>
            )}
        </div>
    );
});

export default memo(CreatePuzzle);

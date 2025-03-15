import React, { memo } from 'react';
import { useSolvePuzzle } from '../hooks/useSolvePuzzle';
import { useAccount } from 'wagmi';

const SolvePuzzle = memo(function SolvePuzzle({ puzzle, contract, onPrevious, onNext, canGoPrevious }) {
    const { isConnected } = useAccount();
    const {
        guess,
        handleGuessChange,
        checkAnswer,
        submitToBlockchain,
        isSubmitting,
        submitError,
        correctAnswer
    } = useSolvePuzzle({ puzzle, contract });

    if (!isConnected || !contract) {
        return (
            <div className="riddler-section" style={{ textAlign: 'center', padding: '20px' }}>
                <p>Please connect your wallet to solve puzzles</p>
            </div>
        );
    }

    return (
        <>
            <div className="riddler-section">
                <h2 className="riddler-text">Unravel The Mystery</h2>
                <div className="riddler-text">
                    <p>{puzzle?.data}</p>
                    <p style={{ textAlign: 'right', fontStyle: 'italic', marginTop: '10px' }}>
                        - {puzzle?.author?.slice(0, 6)}...{puzzle?.author?.slice(-4)}
                        <br />
                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                            {new Date(Number(puzzle?.blockTimestamp) * 1000).toLocaleString()}
                        </span>
                    </p>
                </div>
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginTop: '20px',
                    marginBottom: '20px'
                }}>
                    <button 
                        className="riddler-nav-button" 
                        onClick={onPrevious}
                        disabled={!canGoPrevious}
                        style={{
                            flex: 1,
                            padding: '10px'
                        }}
                    >
                        Previous Enigma
                    </button>
                    <button 
                        className="riddler-nav-button" 
                        onClick={onNext}
                        style={{
                            flex: 1,
                            padding: '10px'
                        }}
                    >
                        Next Enigma
                    </button>
                </div>
                <textarea
                    className="riddler-input"
                    value={guess}
                    onChange={handleGuessChange}
                    placeholder="Enter your answer..."
                    rows={1}
                    onInput={(e) => {
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
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        {submitError.includes('Transaction successful') ? (
                            <>
                                <p className="riddler-success-text">
                                    🎉 Solution submitted successfully! 🎉
                                </p>
                                {submitError.split('Transaction hash: ')[1] && (
                                    <a 
                                        href={`https://sepolia.etherscan.io/tx/${submitError.split('Transaction hash: ')[1].trim()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: '#7b3fe4', textDecoration: 'underline', display: 'block', marginTop: '5px' }}
                                    >
                                        View on Etherscan
                                    </a>
                                )}
                            </>
                        ) : (
                            <p className="riddler-error">{submitError}</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
});

export default memo(SolvePuzzle);

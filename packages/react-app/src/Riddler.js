import React, { useState, memo, useCallback } from 'react';
import CreatePuzzle from './components/CreatePuzzle';
import SolvePuzzle from './components/SolvePuzzle';

const Riddler = memo(function Riddler({ contract, puzzle, onPrevious, onNext, canGoPrevious }) {
    const [activeSection, setActiveSection] = useState(null);

    const handleSectionClick = useCallback((section) => {
        setActiveSection(section);
    }, []);

    const handleBackClick = useCallback(() => {
        setActiveSection(null);
    }, []);

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
                        <button 
                            className="riddler-button" 
                            onClick={() => handleSectionClick('submit')}
                        >
                            Create Mystery
                        </button>
                        <button 
                            className="riddler-button" 
                            onClick={() => handleSectionClick('solve')}
                        >
                            Unravel Riddle
                        </button>
                    </div>
                )}
                
                {activeSection === 'submit' && (
                    <CreatePuzzle 
                        contract={contract}
                    />
                )}

                {activeSection === 'solve' && (
                    <SolvePuzzle 
                        puzzle={puzzle}
                        contract={contract}
                        onPrevious={onPrevious}
                        onNext={onNext}
                        canGoPrevious={canGoPrevious}
                    />
                )}

                {(activeSection === 'submit' || activeSection === 'solve') && (
                    <button 
                        className="riddler-button" 
                        onClick={handleBackClick}
                    >
                        Return to Sanctum
                    </button>
                )}
            </div>
        </div>
    );
});

export default memo(Riddler);

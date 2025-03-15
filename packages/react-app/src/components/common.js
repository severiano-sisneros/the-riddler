import React from 'react';

export function Body({ children }) {
    return (
        <div className="riddler-body">
            {children}
        </div>
    );
}

export function Container({ children }) {
    return (
        <div className="riddler-container">
            {children}
        </div>
    );
}

export function Header({ children }) {
    return (
        <header className="riddler-header">
            {children}
        </header>
    );
}

export function Link({ href, className, children }) {
    return (
        <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {children}
        </a>
    );
}

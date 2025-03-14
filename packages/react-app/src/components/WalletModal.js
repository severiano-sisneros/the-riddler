import React from 'react';

const WALLETS = [
  {
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect to your MetaMask Wallet',
    checkInstalled: () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          console.log('No ethereum provider found');
          return false;
        }

        // Check providers array first
        if (Array.isArray(window.ethereum.providers)) {
          console.log('Checking providers array for MetaMask');
          for (const provider of window.ethereum.providers) {
            if (provider.isMetaMask) {
              console.log('Found MetaMask in providers array');
              return true;
            }
          }
        }

        // Check if MetaMask is the primary provider
        if (window.ethereum.isMetaMask) {
          console.log('Found MetaMask as primary provider');
          return true;
        }

        console.log('MetaMask not found');
        return false;
      } catch (error) {
        console.error('Error checking MetaMask:', error);
        return false;
      }
    },
    getProvider: () => {
      try {
        if (typeof window.ethereum === 'undefined') return null;

        // Check providers array first
        if (window.ethereum.providers) {
          const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
          if (metamaskProvider) {
            console.log('Found MetaMask in providers array');
            return metamaskProvider;
          }
        }

        // Check if the current provider is MetaMask
        if (window.ethereum.isMetaMask) {
          console.log('Found MetaMask as primary provider');
          return window.ethereum;
        }

        return null;
      } catch (error) {
        console.error('Error getting MetaMask provider:', error);
        return null;
      }
    },
    downloadUrl: 'https://metamask.io/download/'
  },
  {
    name: 'Rainbow',
    icon: '🌈',
    description: 'Connect to Rainbow Wallet',
    checkInstalled: () => {
      try {
        // Check if window.ethereum exists
        if (typeof window.ethereum === 'undefined') {
          console.log('No ethereum provider found');
          return false;
        }

        // Check providers array first
        if (Array.isArray(window.ethereum.providers)) {
          console.log('Checking providers array:', window.ethereum.providers);
          for (const provider of window.ethereum.providers) {
            if (provider.isRainbow || 
                provider.isRainbowWallet || 
                provider._rainbow ||
                (provider._state && provider._state.isRainbow)) {
              console.log('Found Rainbow in providers array');
              return true;
            }
          }
        }

        // Check if Rainbow is the primary provider
        if (window.ethereum.isRainbow || 
            window.ethereum.isRainbowWallet || 
            window.ethereum._rainbow ||
            (window.ethereum._state && window.ethereum._state.isRainbow)) {
          console.log('Found Rainbow as primary provider');
          return true;
        }

        // Check for window.rainbow global
        if (typeof window.rainbow !== 'undefined') {
          console.log('Found window.rainbow global object');
          return true;
        }

        console.log('Rainbow wallet not found');
        return false;
      } catch (error) {
        console.error('Error checking Rainbow wallet:', error);
        return false;
      }
    },
    getProvider: () => {
      try {
        if (typeof window.ethereum === 'undefined') return null;

        // Check providers array first
        if (window.ethereum.providers) {
          // Try to find Rainbow provider
          const rainbowProvider = window.ethereum.providers.find(p => 
            p.isRainbow || p.isRainbowWallet || 
            (p._state && p._state.isRainbow) ||
            (p.request && p.request.toString().includes('rainbow'))
          );
          if (rainbowProvider) {
            console.log('Found Rainbow in providers array');
            return rainbowProvider;
          }
        }

        // Check if the current provider is Rainbow
        if (window.ethereum.isRainbow || 
            window.ethereum.isRainbowWallet || 
            window.ethereum._rainbow ||
            (window.ethereum._state && window.ethereum._state.isRainbow)) {
          console.log('Found Rainbow as primary provider');
          return window.ethereum;
        }

        // If we're checking for Rainbow and it's not found, return null
        // This prevents falling back to another wallet when Rainbow is specifically requested
        return null;
      } catch (error) {
        console.error('Error getting Rainbow provider:', error);
        return null;
      }
    },
    downloadUrl: 'https://rainbow.me'
  },
  {
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Connect with WalletConnect',
    checkInstalled: () => true, // Always available as it's a QR-based solution
    getProvider: null, // Will be implemented when adding WalletConnect
    downloadUrl: null
  },
  {
    name: 'Coinbase Wallet',
    icon: '📱',
    description: 'Connect to Coinbase Wallet',
    checkInstalled: () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          console.log('No ethereum provider found');
          return false;
        }

        // Check providers array first
        if (Array.isArray(window.ethereum.providers)) {
          console.log('Checking providers array for Coinbase Wallet');
          for (const provider of window.ethereum.providers) {
            if (provider.isCoinbaseWallet) {
              console.log('Found Coinbase Wallet in providers array');
              return true;
            }
          }
        }

        // Check if Coinbase Wallet is the primary provider
        if (window.ethereum.isCoinbaseWallet) {
          console.log('Found Coinbase Wallet as primary provider');
          return true;
        }

        console.log('Coinbase Wallet not found');
        return false;
      } catch (error) {
        console.error('Error checking Coinbase Wallet:', error);
        return false;
      }
    },
    getProvider: () => {
      try {
        if (typeof window.ethereum === 'undefined') return null;

        // Check providers array first
        if (window.ethereum.providers) {
          const coinbaseProvider = window.ethereum.providers.find(p => p.isCoinbaseWallet);
          if (coinbaseProvider) {
            console.log('Found Coinbase Wallet in providers array');
            return coinbaseProvider;
          }
        }

        // Check if the current provider is Coinbase Wallet
        if (window.ethereum.isCoinbaseWallet) {
          console.log('Found Coinbase Wallet as primary provider');
          return window.ethereum;
        }

        return null;
      } catch (error) {
        console.error('Error getting Coinbase Wallet provider:', error);
        return null;
      }
    },
    downloadUrl: 'https://www.coinbase.com/wallet/downloads'
  }
];

function WalletModal({ onClose, onSelectWallet }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Connect Wallet</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {WALLETS.map(wallet => {
            const isInstalled = wallet.checkInstalled();
            return (
              <button
                key={wallet.name}
                className="wallet-option"
                onClick={() => {
                  if (isInstalled) {
                    onSelectWallet(wallet);
                  } else if (wallet.downloadUrl) {
                    window.open(wallet.downloadUrl, '_blank');
                  }
                }}
              >
                <span className="wallet-icon">{wallet.icon}</span>
                <div className="wallet-info">
                  <span className="wallet-name">{wallet.name}</span>
                  <span className="wallet-description">{wallet.description}</span>
                </div>
                {!isInstalled && wallet.downloadUrl && (
                  <span className="wallet-status">Install</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WalletModal;

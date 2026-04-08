'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, AlertCircle, X } from 'lucide-react';
import { MOCK_STUDENT, MOCK_CREDENTIALS, MockCredential } from '@/lib/mock-data';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

interface WalletConnectProps {
  onConnect: (walletAddress: string, student: typeof MOCK_STUDENT | null, credentials: MockCredential[]) => void;
  isConnected: boolean;
  walletAddress: string | null;
}

export function WalletConnect({ onConnect, isConnected, walletAddress }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeb3 = async () => {
    const provider = await detectEthereumProvider();
    if (!provider) {
      setError('Please install MetaMask to connect');
      return null;
    }

    const web3 = new Web3(provider as any);
    const chainId = await web3.eth.getChainId();
    const chainIdHex = '0x' + chainId.toString(16);

    if (chainIdHex !== SEPOLIA_CHAIN_ID) {
      setError('Please switch to Sepolia network');
      return null;
    }

    return web3;
  };

  const getAccount = async () => {
    const web3 = await loadWeb3();
    if (!web3) return false;
    const accounts = await web3.eth.getAccounts();
    return accounts?.[0] || false;
  };

  const requestAccounts = async () => {
    const provider = await detectEthereumProvider();
    if (!provider) {
      setError('MetaMask not found');
      throw new Error('No MetaMask');
    }
    return (provider as any).request({ method: 'eth_requestAccounts' });
  };

  const switchToSepolia = async () => {
    const provider = await detectEthereumProvider();
    if (!provider) {
      setError('MetaMask not found');
      return;
    }
    try {
      await (provider as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (error: any) {
      if (error.code === 4001) {
        setError('Please approve MetaMask connection');
      } else if (error.code === 4902) {
        setError('Please add Sepolia network to MetaMask');
      } else {
        setError('Failed to switch network');
      }
      throw error;
    }
  };

  useEffect(() => {
    const provider = (window as any).ethereum;
    if (provider) {
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          onConnect('', null, []);
        } else {
          onConnect(accounts[0], MOCK_STUDENT, MOCK_CREDENTIALS);
        }
      });
      provider.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      let web3 = await loadWeb3();

      if (!web3) {
        try {
          await switchToSepolia();
          web3 = await loadWeb3();
        } catch {
          setLoading(false);
          return;
        }
      }

      if (!web3) {
        setLoading(false);
        return;
      }

      await requestAccounts();
      const account = await getAccount();

      if (account) {
        // --- CÁCH 2: ÉP XÁC THỰC MẬT KHẨU (Bỏ comment bên dưới để dùng) ---
        /*
        const message = `SBT Credential Student Portal\n\nVui lòng ký thông điệp này để xác thực quyền sở hữu ví của bạn.\n\nNonce: ${new Date().getTime()}`;
        try {
          await (web3.eth.personal as any).sign(message, account, "");
        } catch (signError: any) {
          setError("Bạn đã từ chối ký xác thực");
          setLoading(false);
          return;
        }
        */
        // -----------------------------------------------------------------

        // CÁCH 1: KHÔNG YÊU CẦU XÁC THỰC LẠI (Tự động vào luôn - Đang bật)
        onConnect(account, MOCK_STUDENT, MOCK_CREDENTIALS);
      }
    } catch (err: any) {
      console.error(err);
      if (!error) {
        setError(err.message || 'Failed to connect wallet');
      }
    }

    setLoading(false);
  };

  const handleDisconnect = () => {
    setError(null);
    onConnect('', null, []);
  };

  const dismissError = () => {
    setError(null);
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-green-600" />
          <span className="text-sm font-mono text-gray-600">
            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={handleDisconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleConnect} disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="mr-2 h-4 w-4" />
        )}
        {loading ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 max-w-[250px]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={dismissError} className="hover:bg-red-100 rounded p-0.5">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}

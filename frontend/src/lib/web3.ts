import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111

// ============ CORE FUNCTIONS ============

export const loadWeb3 = async (): Promise<Web3 | false> => {
  const provider = await detectEthereumProvider();
  
  if (!provider) {
    console.error('MetaMask not installed');
    return false;
  }

  const web3 = new Web3(provider as any);
  
  // Kiểm tra network
  const chainId = await web3.eth.getChainId();
  const chainIdHex = '0x' + chainId.toString(16);
  
  if (chainIdHex !== SEPOLIA_CHAIN_ID) {
    console.error('Wrong network. Please switch to Sepolia');
    return false;
  }

  return web3;
};

export const getAccount = async (): Promise<string | false> => {
  const web3 = await loadWeb3();
  if (!web3) return false;

  const accounts = await web3.eth.getAccounts();
  return accounts?.[0] || false;
};

export const getContract = async (abi: any, address: string) => {
  const web3 = await loadWeb3();
  if (!web3) return false;

  return new web3.eth.Contract(abi, address);
};

export const checkNetwork = async (): Promise<boolean> => {
  const web3 = await loadWeb3();
  if (!web3) return false;

  const chainId = await web3.eth.getChainId();
  const chainIdHex = '0x' + chainId.toString(16);
  
  return chainIdHex === SEPOLIA_CHAIN_ID;
};

// ============ WALLET CONNECT ============

export const requestAccounts = async (): Promise<string[]> => {
  const provider = await detectEthereumProvider();
  if (!provider) {
    throw new Error('MetaMask not installed');
  }

  return (provider as any).request({ 
    method: 'eth_requestAccounts' 
  });
};

// ============ EVENTS ============

export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
  const provider = (window as any).ethereum;
  if (provider) {
    provider.on('accountsChanged', callback);
  }
};

export const onChainChanged = (callback: () => void) => {
  const provider = (window as any).ethereum;
  if (provider) {
    provider.on('chainChanged', () => {
      window.location.reload();
    });
  }
};

export const onDisconnect = (callback: () => void) => {
  const provider = (window as any).ethereum;
  if (provider) {
    provider.on('disconnect', () => {
      callback();
    });
  }
};

// ============ SWITCH NETWORK ============

export const switchToSepolia = async () => {
  const provider = await detectEthereumProvider();
  if (!provider) return;

  try {
    await (provider as any).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_CHAIN_ID }],
    });
  } catch (error: any) {
    // Chain chưa được thêm vào MetaMask
    if (error.code === 4902) {
      console.error('Please add Sepolia network to MetaMask');
    }
    throw error;
  }
};

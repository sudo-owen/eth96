import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import {
  createPublicClient,
  createWalletClient,
  http,
  custom,
  PublicClient,
  WalletClient
} from "viem";
import { mainnet } from "viem/chains";

export enum Method {
  Localhost = "Localhost",
  MetaMask = "MetaMask",
  Custom = "Custom",
}

export const options = [
  { value: Method.Localhost, label: "💻 localhost:8545" },
  { value: Method.MetaMask, label: "🦊 MetaMask" },
  { value: Method.Custom, label: "🔧 Custom" },
];

export function useConnection() {
  const { hostname } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const defaultOption = isLocal ? Method.Localhost : Method.MetaMask;

  const [connection, setConnection] = useState(defaultOption);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  const testAndSetClients = async (
    publicClient: PublicClient,
    walletClient?: WalletClient,
  ) => {
    try {
      await publicClient.getChainId();
      setPublicClient(publicClient);
      if (walletClient) {
        setWalletClient(walletClient);
      }
    } catch (error) {
      console.error(error);
      setPublicClient(null);
      setWalletClient(null);
    }
  };

  const connectLocalhost = async () => {
    try {
      const publicClient = createPublicClient({
        chain: mainnet, // Default to mainnet, will be updated based on actual network
        transport: http("http://localhost:8545"),
      });
      testAndSetClients(publicClient);
    } catch (error) {
      console.error(error);
    }
  };

  const connectMetaMask = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create clients without specifying a chain - let viem detect it from the provider
      const publicClient = createPublicClient({
        transport: custom(window.ethereum),
      });

      const walletClient = createWalletClient({
        transport: custom(window.ethereum),
      });

      testAndSetClients(publicClient, walletClient);
    } catch (error) {
      console.error(error);
      alert("Cannot connect to MetaMask, are you sure it has been installed?");
    }
  };

  const connectCustom = async (nodeUrl: string) => {
    if (nodeUrl.trim() === "") return;
    try {
      const publicClient = createPublicClient({
        chain: mainnet, // Default to mainnet, will be updated based on actual network
        transport: http(nodeUrl),
      });
      testAndSetClients(publicClient);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setPublicClient(null);
    setWalletClient(null);
    if (connection === Method.Localhost) {
      connectLocalhost();
    }
  }, [connection]);

  // re-register MetaMask provider whenever network changes
  useEffect(() => {
    const handleNetworkChange = () => {
      if (connection === Method.MetaMask) {
        connectMetaMask();
      }
    };

    window.ethereum?.on("chainChanged", handleNetworkChange);

    // Cleanup function to remove the listener
    return () => {
      window.ethereum?.removeListener("chainChanged", handleNetworkChange);
    };
  }, [connection]);

  return {
    connection,
    setConnection,
    publicClient,
    walletClient,
    setPublicClient,
    setWalletClient,
    connectMetaMask,
    connectCustom,
    connectLocalhost,
    // Legacy provider interface for backward compatibility during migration
    provider: publicClient,
    setProvider: setPublicClient,
  };
}

export default createContainer(useConnection);

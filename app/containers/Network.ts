import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import Connection from "./Connection";
import { Chain } from "viem";
import * as chains from "viem/chains";

export function useNetwork() {
  const { publicClient } = Connection.useContainer();
  const [network, setNetwork] = useState<Chain | null>(null);

  const updateNetwork = async () => {
    if (publicClient === null) {
      return setNetwork(null);
    }

    try {
      // Get the actual chain ID from the provider
      const chainId = await publicClient.getChainId();

      // Find the matching chain from viem's chain definitions
      const matchingChain = Object.values(chains).find(
        (chain) => chain.id === chainId
      );

      setNetwork(matchingChain || {
        id: chainId,
        name: `Unknown Network`,
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [] } }
      } as Chain);
    } catch (error) {
      console.error('Failed to get network:', error);
      setNetwork(null);
    }
  };

  // update the network whenever the publicClient changes
  useEffect(() => {
    updateNetwork();
  }, [publicClient]);

  return {
    network,
  };
}

export default createContainer(useNetwork);

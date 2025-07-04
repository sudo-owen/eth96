import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import {
  Account,
  WalletClient,
  createWalletClient,
  custom,
  http
} from "viem";
import { privateKeyToAccount, mnemonicToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import Connection from "./Connection";

const useSigners = () => {
  const { publicClient, walletClient } = Connection.useContainer();
  const [internalAccount, setInternalAccount] = useState<Account | null>(null);
  const [customAccount, setCustomAccount] = useState<Account | null>(null);
  const [customWalletClient, setCustomWalletClient] = useState<WalletClient | null>(null);

  const attemptSetCustomSigner = (customSignerString: string) => {
    try {
      if (customSignerString.trim() !== "") {
        let account: Account;

        if (customSignerString.substring(0, 2) === "0x") {
          // private key
          account = privateKeyToAccount(customSignerString.trim() as `0x${string}`);
        } else {
          // mnemonic
          account = mnemonicToAccount(customSignerString.trim());
        }

        // Create a wallet client for this custom account
        const walletClient = createWalletClient({
          account,
          chain: mainnet, // Default to mainnet, will be updated based on actual network
          transport: publicClient ? custom(window.ethereum) : http("http://localhost:8545"),
        });

        setCustomAccount(account);
        setCustomWalletClient(walletClient);
      }
    } catch (error) {
      console.error(error);
      alert("Improper mnemonic or private key.");
    }
  };

  const testAndSetAccount = async (walletClient: WalletClient) => {
    try {
      const accounts = await walletClient.getAddresses();
      if (accounts.length > 0) {
        const account = { address: accounts[0] } as Account;
        setInternalAccount(account);
      }
    } catch (error) {
      console.error(error);
      setInternalAccount(null);
    }
  };

  useEffect(() => {
    setInternalAccount(null);
    if (walletClient) {
      testAndSetAccount(walletClient);
    }
  }, [walletClient]);

  return {
    internalAccount,
    setInternalAccount,
    customAccount,
    setCustomAccount,
    customWalletClient,
    setCustomWalletClient,
    attemptSetCustomSigner,
    testAndSetAccount,
    // Legacy interface for backward compatibility during migration
    internalSigner: internalAccount,
    setInternalSigner: setInternalAccount,
    customSigner: customAccount,
    setCustomSigner: setCustomAccount,
    testAndSetSigner: testAndSetAccount,
    signer: customAccount || internalAccount,
  };
};

export default createContainer(useSigners);

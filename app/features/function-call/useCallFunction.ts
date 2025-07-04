import {
  getContract,
  decodeEventLog,
  parseAbi
} from "viem";

import OutputLog from "../../containers/OutputLog";
import ContractAddress from "../../containers/ContractAddress";
import Contracts from "../../containers/Contracts";
import Signers from "../../containers/Signers";
import Connection from "../../containers/Connection";

const useCallFunction = (args: any[], types: string[], fn: any, opts: any) => {
  const { addLogItem, addJSONLogItem } = OutputLog.useContainer();
  const { selectedContract } = Contracts.useContainer();
  const { address } = ContractAddress.useContainer();
  const { signer, customWalletClient } = Signers.useContainer();
  const { publicClient, walletClient } = Connection.useContainer();

  const logEvents = async (txHash: string) => {
    if (!publicClient || !selectedContract) return;

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    const abi = parseAbi(selectedContract.abi.map((item: any) => {
      if (item.type === 'event') {
        return `event ${item.name}(${item.inputs.map((input: any) => `${input.type} ${input.name}`).join(', ')})`;
      }
      return '';
    }).filter(Boolean));

    receipt.logs.forEach((log) => {
      try {
        const decoded = decodeEventLog({
          abi,
          data: log.data,
          topics: log.topics,
        });

        if (decoded) {
          const values = Object.values(decoded.args || {}).map((value) => {
            // Convert BigInt values to string for display
            if (typeof value === 'bigint') {
              return value.toString();
            }
            return value;
          });
          addLogItem(`Event: ${decoded.eventName}(${values.join(', ')})`);
        }
      } catch (error) {
        // Log couldn't be decoded with this contract's ABI, skip it
        console.debug('Could not decode log:', error);
      }
    });
  };

  const callFunction = async () => {
    if (!selectedContract || !address) {
      addLogItem("Error: No contract selected or address provided");
      return;
    }

    // handle array, int, and tuple types
    const processedArgs = args.map((arg: any, idx: number) => {
      const type = types[idx];
      if (type.slice(-2) === "[]") return JSON.parse(arg);
      if (type.substring(0, 4) === "uint") return BigInt(arg);
      if (type === "tuple" && Array.isArray(arg)) {
        // Process each component of the tuple
        return arg.map((component, compIdx) => {
          const input = fn.inputs[idx];
          if (input && input.components && input.components[compIdx]) {
            const compType = input.components[compIdx].type;
            if (compType.substring(0, 4) === "uint") {
              return BigInt(component);
            }
            if (compType.slice(-2) === "[]") {
              return JSON.parse(component);
            }
          }
          return component;
        });
      }
      return arg;
    });

    // Get the appropriate client for the operation
    const activeWalletClient = customWalletClient || walletClient;

    if (fn.stateMutability !== "view" && fn.constant !== true) {
      // mutating fn; requires wallet client
      if (!activeWalletClient || !signer || !publicClient) {
        addLogItem("Error: No wallet client available for transaction");
        return;
      }

      const contract = getContract({
        address: address as `0x${string}`,
        abi: selectedContract.abi,
        client: activeWalletClient,
      });

      const txHash = await (contract.write as any)[fn.name](...processedArgs, opts);
      addLogItem(`tx.hash: ${txHash}`);

      // Wait for transaction receipt
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      addLogItem(`tx mined: ${txHash}`);
      await logEvents(txHash);
    } else {
      // view fn; can use public client
      if (!publicClient) {
        addLogItem("Error: No public client available for read operation");
        return;
      }

      const contract = getContract({
        address: address as `0x${string}`,
        abi: selectedContract.abi,
        client: publicClient,
      });

      const result = await (contract.read as any)[fn.name](...processedArgs);

      // simple return type
      if (!Array.isArray(result)) {
        addLogItem(result.toString());
        return;
      }

      // complex return type
      const processArray = (arr: any[]): any[] => {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
          const val: any = Array.isArray(arr[i])
            ? processArray(arr[i])
            : arr[i].toString();
          newArr.push(val);
        }
        return newArr;
      };

      let processed = processArray([...result]);

      addJSONLogItem(JSON.stringify(processed, null, 2));
    }
  };

  return { callFunction };
};

export default useCallFunction;

import { ethers } from "ethers";

import OutputLog from "../../containers/OutputLog";
import ContractAddress from "../../containers/ContractAddress";
import Contracts from "../../containers/Contracts";
import Signers from "../../containers/Signers";

const useCallFunction = (args, types, fn, opts) => {
  const { addLogItem, addJSONLogItem } = OutputLog.useContainer();
  const { selectedContract } = Contracts.useContainer();
  const { address } = ContractAddress.useContainer();
  const { signer } = Signers.useContainer();

  const logEvents = async (tx) => {
    const receipt = await signer.provider.getTransactionReceipt(tx.hash);
    const contractInterface = new ethers.Interface(selectedContract.abi);

    receipt.logs.forEach((log) => {
      try {
        const decoded = contractInterface.parseLog({
          topics: log.topics,
          data: log.data
        });

        if (decoded) {
          const values = decoded.args.map((value, index) => {
            // Convert BigInt values to string for display
            if (typeof value === 'bigint') {
              return value.toString();
            }
            return value;
          });
          addLogItem(`Event: ${decoded.name}(${values.join(', ')})`);
        }
      } catch (error) {
        // Log couldn't be decoded with this contract's ABI, skip it
        console.debug('Could not decode log:', error);
      }
    });
  };

  const callFunction = async () => {
    // handle array, int, and tuple types
    const processedArgs = args.map((arg, idx) => {
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

    const instance = new ethers.Contract(address, selectedContract.abi, signer);

    if (fn.stateMutability !== "view" && fn.constant !== true) {
      // mutating fn; just return hash
      const tx = await instance[fn.name](...processedArgs, opts);
      addLogItem(`tx.hash: ${tx.hash}`);
      await tx.wait();
      addLogItem(`tx mined: ${tx.hash}`);
      await logEvents(tx);
    } else {
      // view fn
      const result = await instance[fn.name](...processedArgs);

      // simple return type
      if (!Array.isArray(result)) {
        addLogItem(result.toString());
        return;
      }

      // complex return type
      const processArray = (arr) => {
        let newArr = [];
        for (let i = 0; i < arr.length; i++) {
          const val = Array.isArray(arr[i])
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

import { useState, useEffect } from "react";
import { JsonRpcProvider, JsonRpcSigner } from "ethers";
import contractABI from "&/abi.json"; // ABI file
import { Abi, Abi__factory } from "&/types";

export const GANACHE_PORT = 8545;
const useContract = () => {
  const [contract, setContract] = useState<Abi | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        const _provider = new JsonRpcProvider(
          `http://127.0.0.1:${GANACHE_PORT}`
        );
        setProvider(_provider);

        const accounts = await _provider.listAccounts();
        const _signer = accounts[0];
        setSigner(_signer);

        const deployedAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!deployedAddress)
          throw new Error("Deploy the contract before using the app.");
        if (!contractABI)
          throw new Error("Compile the contract before using the app.");

        const _contract = Abi__factory.connect(deployedAddress, _signer);
        setContract(_contract);
      } catch (error) {
        console.error("Error loading contract:", error);
      }
    };

    initContract();
  }, []);

  return { contract, provider, signer };
};

export default useContract;

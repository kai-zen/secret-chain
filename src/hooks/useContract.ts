import { useState, useEffect } from "react";
import { JsonRpcProvider, JsonRpcSigner } from "ethers";
import contractABI from "&/abi.json"; // ABI file
import { Abi, Abi__factory } from "&/types";
import { PopulatedAccount } from "@/helpers/types";
import { handlePopulateAccounts } from "@/helpers/functions";
import { LocalHostProvider } from "@/helpers/constants";

const useContract = () => {
  const [contract, setContract] = useState<Abi | null>(null);
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);

  const [accounts, setAccounts] = useState<PopulatedAccount[]>([]);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);

  // 1.Set provider
  useEffect(() => {
    const _provider = new JsonRpcProvider(LocalHostProvider);
    setProvider(_provider);
  }, []);

  // 2. Set signer & available accounts
  useEffect(() => {
    const storeAllAvailableAccounts = async (
      ganacheAccounts: JsonRpcSigner[],
      provider: JsonRpcProvider | null,
    ) => {
      const allAccounts = await handlePopulateAccounts(
        ganacheAccounts,
        provider,
      );
      setAccounts(allAccounts);
    };

    const handleAccounts = async () => {
      try {
        if (provider) {
          const ganacheAccounts = await provider.listAccounts();
          const _defaultSigner = ganacheAccounts[0]?.address;
          if (_defaultSigner) {
            setSignerAddress(_defaultSigner);
            await storeAllAvailableAccounts(ganacheAccounts, provider);
          }
        }
      } catch (err) {
        console.error("Error storing accounts:", err);
      }
    };

    if (provider) handleAccounts();
  }, [provider]);

  useEffect(() => {
    const handleLoadContract = async () => {
      try {
        const deployedAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
        if (!deployedAddress)
          throw new Error("Deploy the contract before using the app.");
        if (!contractABI)
          throw new Error("Compile the contract before using the app.");

        if (signerAddress && provider) {
          const signer = await provider.getSigner(signerAddress);
          const _contract = Abi__factory.connect(deployedAddress, signer);
          setContract(_contract);
        }
      } catch (error) {
        console.error("Error loading contract:", error);
      }
    };
    if (signerAddress && provider) handleLoadContract();
  }, [provider, signerAddress]);

  const handleChangeSigner = (newSignerAddress: string) => {
    if (accounts.length) {
      const theSigner = accounts.find(
        (acc) => acc.address === newSignerAddress,
      );
      if (theSigner && signerAddress !== theSigner.address)
        setSignerAddress(theSigner.address);
    }
  };

  return {
    contract,
    provider,
    signer: signerAddress,
    accounts,
    handleChangeSigner,
  };
};

export default useContract;

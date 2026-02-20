import useEthPrice from "@/hooks/useEthPrice";
import { useToast } from "@/components/providers/ToastContext";
import { useEffect, useState } from "react";
import { useContractContext } from "@/components/providers/ContractContext";
import { SecretDetailsDT, SecretDT } from "@/helpers/types";
import {
  contractErrorTranslator,
  secretDetailProxyToObject,
} from "@/helpers/convertors";

export interface CardHookOutputDT {
  data: SecretDetailsDT;
  isLoadingDetails: boolean;
  isUnlocking: boolean;
  hasAccess: boolean | null;
  isCheckingAccess: boolean;
  fetchDetails: () => Promise<void>;
  handleUnlock: () => Promise<void>;
  checkAccessStatus: () => Promise<void>;
}

const useCardActions = (secret: SecretDT) => {
  const { weiToUsd } = useEthPrice();
  const { addToast } = useToast();
  const { contract, provider, signer } = useContractContext();

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [data, setData] = useState<SecretDetailsDT>(secret);

  useEffect(() => {
    setHasAccess(false);
  }, [signer]);

  useEffect(() => {
    if (secret?.id) {
      setData((prev) => ({
        ...prev,
        ...secret,
      }));
    }
  }, [secret]);

  const checkAccessStatus = async () => {
    if (!contract || !signer || typeof secret?.id !== "number") {
      addToast({
        title: "Missing data",
        description: "Signer is not provided or contract not loaded.",
        color: "danger",
      });
      return;
    }
    setIsCheckingAccess(true);
    try {
      const accessStatus = await contract.checkAccess(secret.id, signer);
      setHasAccess(accessStatus);
      if (!accessStatus)
        addToast({
          color: "warning",
          title: "No access",
          description: "You do not have access to this secret",
        });
    } catch (err) {
      console.error("Error checking access", err);
      addToast({
        title: "Error occured",
        color: "danger",
        description: "Error checking access",
      });
      setHasAccess(false);
    } finally {
      setIsCheckingAccess(false);
    }
  };

  const fetchDetails = async () => {
    if (!contract || typeof secret?.id !== "number") return;
    setIsLoadingDetails(true);
    try {
      const details = await contract?.getSecretDetails(secret.id);
      const convertedData = secretDetailProxyToObject(details, weiToUsd);
      setData(convertedData);
    } catch (err) {
      console.error("Error in fetching details", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUnlock = async () => {
    if (!contract || !provider || !signer || typeof secret?.id !== "number") {
      addToast({
        title: "Unlock error",
        description: "Contract not ready",
        color: "danger",
      });
      return;
    }

    setIsUnlocking(true);
    try {
      const details = await contract.getSecretDetails(secret.id);
      const priceWei = details.price;
      const owner = details.owner;

      if (owner.toLowerCase() === signer.toLowerCase()) {
        addToast({
          title: "Unlocked",
          description: "This is your own secret!",
          color: "success",
        });
        setHasAccess(true);
        return;
      }

      const accessStatus = await contract.checkAccess(secret.id, signer);
      if (accessStatus) {
        addToast({
          title: "Unlocked",
          description: "You already have access to this secret",
          color: "success",
        });
        setHasAccess(true);
        return;
      }

      const balance = await provider.getBalance(signer);
      if (balance < priceWei) {
        addToast({
          title: "You need more balance :(",
          description: "Insufficient balance to unlock this secret",
          color: "warning",
        });
        setHasAccess(false);
        return;
      }

      const tx = await contract.unlockSecret(secret.id, { value: priceWei });
      await tx.wait();
      addToast({
        title: "Unlocked",
        description: "Secret unlocked successfully",
        color: "success",
      });
      setHasAccess(true);
    } catch (err: any) {
      const message = contractErrorTranslator(err, "Failed to unlock secret");
      addToast({
        title: "Unlock error",
        description: message,
        color: "danger",
      });
      console.error("Unlock error", err);
    } finally {
      setIsUnlocking(false);
      await checkAccessStatus();
    }
  };

  return {
    data,
    isLoadingDetails,
    isUnlocking,
    hasAccess,
    isCheckingAccess,
    fetchDetails,
    handleUnlock,
    checkAccessStatus,
  };
};

export default useCardActions;

import { Button } from "@heroui/react";
import { FC, useEffect, useState } from "react";
import { useContractContext } from "@/components/providers/ContractContext";
import useEthPrice from "@/hooks/useEthPrice";
import {
  contractErrorTranslator,
  secretDetailProxyToObject,
} from "@/helpers/convertors";
import { SecretDT, SecretDetailsDT } from "@/helpers/types";
import { IconKey } from "@tabler/icons-react";

interface Props {
  secret: SecretDT;
}

const SecretCard: FC<Props> = ({ secret }) => {
  const { contract, provider, signer } = useContractContext();
  const { weiToUsd } = useEthPrice();

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [data, setData] = useState<SecretDetailsDT>(secret);

  useEffect(() => {
    if (secret?.id) {
      setData((prev) => ({
        ...prev,
        ...secret,
      }));
    }
  }, [secret]);

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
      setUnlockError("Contract not ready");
      return;
    }

    setIsUnlocking(true);
    setUnlockError(null);
    try {
      // Get secret details to check price and owner
      const details = await contract.getSecretDetails(secret.id);
      const priceWei = details.price;
      const owner = details.owner;

      // Pre-checks before attempting unlock
      if (owner.toLowerCase() === signer.toLowerCase()) {
        setUnlockError("You cannot unlock your own secret");
        setIsUnlocking(false);
        return;
      }

      // Check if already has access
      const hasAccess = await contract.checkAccess(secret.id, signer);
      if (hasAccess) {
        setUnlockError("You already have access to this secret");
        setIsUnlocking(false);
        return;
      }

      // Check balance
      const balance = await provider.getBalance(signer);
      if (balance < priceWei) {
        setUnlockError("Insufficient balance to unlock this secret");
        setIsUnlocking(false);
        return;
      }

      // Attempt unlock
      const tx = await contract.unlockSecret(secret.id, { value: priceWei });
      await tx.wait();
      await fetchDetails();
    } catch (err: any) {
      const message = contractErrorTranslator(err, "Failed to unlock secret");
      setUnlockError(message);
      console.error("Unlock error", err);
    } finally {
      setIsUnlocking(false);
    }
  };

  const hasDetails = Boolean(data?.content && data?.owner);

  return (
    <div className="border border-divider rounded-lg p-3">
      <div className="flex items-start gap-1.5">
        <div className="min-w-5 w-5 h-5 rounded-full bg-primary font-bold text-sm text-black flex items-center justify-center">
          {data.id}
        </div>
        <p className="font-medium leading-5">{data.title}</p>
      </div>
      <p className="text-xs mt-2">Price: {data.price} $</p>
      {hasDetails && (
        <div className="p-2 rounded-md bg-[rgba(256,256,256,.05)] mt-4">
          <p className="text-sm">{data.description}</p>
          <p className="text-[10px] mt-1.5">Created by: {data.owner}</p>
        </div>
      )}
      {unlockError && <p className="text-xs text-danger mt-2">{unlockError}</p>}
      <div className="w-full flex gap-1.5 mt-4">
        {!hasDetails && (
          <Button
            className="grow"
            variant="bordered"
            onPress={fetchDetails}
            isLoading={isLoadingDetails}
          >
            Details
          </Button>
        )}
        <Button
          endContent={hasDetails && <IconKey size={18} stroke={1.5} />}
          className="grow"
          color="primary"
          variant={hasDetails ? "shadow" : "solid"}
          onPress={handleUnlock}
          isLoading={isUnlocking}
          isDisabled={!contract || !provider || !signer}
        >
          Unlock
        </Button>
      </div>
    </div>
  );
};

export default SecretCard;

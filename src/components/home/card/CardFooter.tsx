import { Button } from "@heroui/react";
import { IconKey } from "@tabler/icons-react";
import { FC } from "react";
import { CardHookOutputDT } from "./useCardActions";
import { useContractContext } from "@/components/providers/ContractContext";

const CardFooter: FC<CardHookOutputDT> = ({
  data,
  isLoadingDetails,
  isUnlocking,
  isCheckingAccess,
  handleUnlock,
  fetchDetails,
  checkAccessStatus,
}) => {
  const { contract, provider, signer } = useContractContext();
  const hasDetails = Boolean(data?.content && data?.owner);

  return (
    <div>
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
      <p className="text-xs mt-2 ml-1">
        Unlocked before?{" "}
        <Button
          size="sm"
          variant="light"
          onPress={checkAccessStatus}
          isDisabled={!contract || !signer || isCheckingAccess}
          color="primary"
          className="h-6 min-w-fit px-1 text-xs inline underline"
        >
          {isCheckingAccess ? "Checking access..." : "Check Access"}
        </Button>
      </p>
    </div>
  );
};

export default CardFooter;

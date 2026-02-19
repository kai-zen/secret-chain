import { Button } from "@heroui/react";
import { FC, useEffect, useState } from "react";
import { useContractContext } from "@/components/providers/ContractContext";
import useEthPrice from "@/hooks/useEthPrice";
import { secretDetailProxyToObject } from "@/helpers/convertors";
import { SecretDT, SecretDetailsDT } from "@/helpers/types";
import { IconKey } from "@tabler/icons-react";

interface Props {
  secret: SecretDT;
}

const SecretCard: FC<Props> = ({ secret }) => {
  const { contract } = useContractContext();
  const { weiToUsd } = useEthPrice();

  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
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
    if (contract && secret?.id) {
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
        >
          Unlock
        </Button>
      </div>
    </div>
  );
};

export default SecretCard;

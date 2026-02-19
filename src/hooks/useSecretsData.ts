import { useContractContext } from "@/components/providers/ContractContext";
import { useEffect, useState } from "react";
import useEthPrice from "./useEthPrice";
import { secretListProxyToObject } from "@/helpers/convertors";

const useSecretsData = () => {
  const { contract } = useContractContext();
  const { weiToUsd } = useEthPrice();

  const [totalCount, setTotalCount] = useState(0);
  const [secretsData, setSecretsData] = useState<any[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchSecrets = async () => {
      if (!contract) return;
      try {
        const { getSecretsCount, getSecretsPaginated } = contract;

        const countResp = await getSecretsCount();
        console.log("Secrets count response:", countResp);
        const count = Number(countResp);
        if (!isNaN(count)) setTotalCount(count);

        if (count > 0) {
          const response = await getSecretsPaginated(0, Math.min(8, count));
          const list = Array.from(response || []).map((item: any) =>
            secretListProxyToObject(item, weiToUsd),
          );
          setSecretsData(list);
        }
      } catch (err) {
        console.log("Error fetching secrets", err);
        setSecretsData([]);
      }
    };

    if (shouldRefetch && contract) {
      fetchSecrets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, shouldRefetch]);

  const refetchHandler = () => setShouldRefetch((prev) => !prev);

  return { totalCount, secretsData, refetchHandler };
};

export default useSecretsData;

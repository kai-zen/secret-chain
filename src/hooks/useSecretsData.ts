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
        const count = Number(countResp);
        if (!isNaN(count)) setTotalCount(count);
        console.log("Secrets count response:", countResp);

        if (count > 0) {
          const response = await getSecretsPaginated(0, Math.min(8, count));

          // ethers v6 returns a Result (Proxy) — convert to plain array of objects
          const list = Array.from(response || []).map((item: any) =>
            secretListProxyToObject(item, weiToUsd),
          );
          setSecretsData(list);
        } else {
          setSecretsData([]);
        }
      } catch (err) {
        console.log("Error fetching secrets", err);
        setSecretsData([]);
      }
    };

    if (shouldRefetch && contract) {
      fetchSecrets();
    }
  }, [contract, shouldRefetch, weiToUsd]);

  const refetchHandler = () => setShouldRefetch((prev) => !prev);

  return { totalCount, secretsData, refetchHandler };
};

export default useSecretsData;

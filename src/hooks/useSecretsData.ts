import { useContractContext } from "@/components/providers/ContractContext";
import { useEffect, useState } from "react";

const useSecretsData = () => {
  const { contract } = useContractContext();

  const [totalCount, setTotalCount] = useState(0);
  const [secretsData, setSecretsData] = useState<any[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchSecrets = async () => {
      if (!contract) return;
      try {
        const countResp = await contract.getSecretsCount();
        const count = Number(countResp);
        if (!isNaN(count)) setTotalCount(count);
        console.log("Secrets count response:", countResp);

        if (count > 0) {
          const response = await contract.getSecretsPaginated(
            0,
            Math.min(8, count),
          );
          setSecretsData(response);
          console.log("Paginated secrets response:", response);
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
  }, [contract, shouldRefetch]);

  const refetchHandler = () => setShouldRefetch((prev) => !prev);

  return { totalCount, secretsData, refetchHandler };
};

export default useSecretsData;

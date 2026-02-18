import { useContractContext } from "@/components/providers/ContractContext";
import { useEffect, useState } from "react";

const useSecretsData = () => {
  const { contract } = useContractContext();

  const [totalCount, setTotalCount] = useState(0);
  const [secretsData, setSecretsData] = useState(null);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const fetchSecretsCount = async () => {
      if (contract) {
        const response = await contract.getSecretsCount();
        if (!isNaN(Number(response))) setTotalCount(Number(response));
        console.log(Number(response));
      }
    };

    const fetchSecretsPaginated = async () => {
      if (contract) {
        try {
          const response = await contract.getSecretsPaginated(0, 8);
          console.log(response);
        } catch (err) {
          console.log("Error fetching secrets", err);
        }
      }
    };

    if (shouldRefetch && contract) {
      fetchSecretsCount();
      fetchSecretsPaginated();
    }
  }, [contract, shouldRefetch]);
};

export default useSecretsData;

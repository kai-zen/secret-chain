import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import useContract from "@/hooks/useContract";
import useEthPrice from "@/hooks/useEthPrice";
import { SecretDT } from "@/helpers/types";
import { secretListProxyToObject } from "@/helpers/convertors";

interface ContractContextType extends ReturnType<typeof useContract> {
  secretsData: SecretDT[];
  totalCount: number;
  refetchHandler: () => void;
}

const ContractContext = createContext<ContractContextType | null>(null);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const contractData = useContract();
  const { weiToUsd } = useEthPrice();

  const [totalCount, setTotalCount] = useState(0);
  const [secretsData, setSecretsData] = useState<SecretDT[]>([]);
  const [shouldRefetch, setShouldRefetch] = useState(true);

  useEffect(() => {
    const { contract } = contractData;
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
  }, [contractData, shouldRefetch]);

  const refetchHandler = () => setShouldRefetch((prev) => !prev);
  const value = { totalCount, secretsData, refetchHandler, ...contractData };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error(
      "useContractContext must be used within a ContractProvider",
    );
  }
  return context;
};

import { createContext, useContext, ReactNode } from "react";
import useContract from "@/hooks/useContract";

type ContractContextType = ReturnType<typeof useContract>;

const ContractContext = createContext<ContractContextType | null>(null);

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const contractData = useContract();

  return (
    <ContractContext.Provider value={contractData}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error(
      "useContractContext must be used within a ContractProvider"
    );
  }
  return context;
};

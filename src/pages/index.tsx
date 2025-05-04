import { AccountPicker } from "@/components/molecules";
import { useContractContext } from "@/components/providers/ContractContext";
import useEthPrice from "@/hooks/useEthPrice";
import { Button } from "@heroui/react";
import { useState } from "react";

export default function Home() {
  const { contract } = useContractContext();
  const { usdToWei } = useEthPrice();

  const [isLoading, setIsLoading] = useState(false);

  const submitSecret = async () => {
    if (contract) {
      try {
        setIsLoading(true);
        const params = {
          title: "Secret test",
          description: "This is the first secret making for test.",
          content: "The secret is keep going!!!",
          price: usdToWei(2),
        };
        const response = await contract.addSecret(
          ...(Object.values(params) as any)
        );
        console.log("Create secret succuss response:", response);
      } catch (error) {
        console.error("Error creating secret:", error);
      } finally {
        setIsLoading(false);
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-8 w-full max-w-[480px]">
      <AccountPicker />
      {isLoading ? (
        <p>Uploading secret...</p>
      ) : (
        <>
          <h1>Tell me your secret!</h1>
          <Button onPress={submitSecret} color="primary">
            Submit secret!
          </Button>
        </>
      )}
    </div>
  );
}

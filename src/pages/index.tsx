import { AccountPicker, EmptyView } from "@/components/molecules";
import { useContractContext } from "@/components/providers/ContractContext";
import useEthPrice from "@/hooks/useEthPrice";
import { Button, Divider } from "@heroui/react";
import { useState } from "react";

export default function Home() {
  const { contract } = useContractContext();
  const { usdToWei } = useEthPrice();

  const [isLoading, setIsLoading] = useState(false);

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

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

  const handleOpenCreateSecret = () => {
    setIsCreateFormOpen(true);
  };

  const isEmpty = true;

  return (
    <div className="p-4 flex flex-col gap-8 w-full max-w-[480px] mx-auto">
      <header className="flex justify-between items-center gap-4">
        <h1 className="font-semibold text-sm">
          Secrets
          <br />
          Marketplace
        </h1>
        <AccountPicker />
      </header>
      <section>
        <h3 className="text-lg font-semibold">
          You have a <span className="text-primary">SECRET</span>?
          <br /> Sell at your desired price.
        </h3>
        <p className="text-xs mt-2">
          Blockchain powered string selling marketplace.
        </p>
      </section>
      <Divider />
      {isEmpty ? (
        <EmptyView handleOpenCreateSecret={handleOpenCreateSecret} />
      ) : null}
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

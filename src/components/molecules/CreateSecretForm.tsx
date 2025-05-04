import useEthPrice from "@/hooks/useEthPrice";
import { Button, Input, NumberInput, Textarea } from "@heroui/react";
import { FC, useState } from "react";
import { useContractContext } from "@/components/providers/ContractContext";

const CreateSecretForm: FC = () => {
  const { contract } = useContractContext();
  const { usdToWei } = useEthPrice();

  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState({
    title: "",
    description: "",
    content: "",
    price: 0,
  });

  const submitSecret = async () => {
    if (contract) {
      try {
        setIsLoading(true);
        const params = {
          title: values.title,
          description: values.description,
          content: values.content,
          price: usdToWei(values.price),
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
    <form
      className="flex flex-col w-full items-center gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submitSecret();
      }}
    >
      <Input
        label="Title"
        placeholder="Enter your secret title"
        isRequired
        value={values.title}
        onValueChange={(newVal) => {
          setValues((prev) => ({ ...prev, title: newVal }));
        }}
      />
      <Textarea
        label="Description"
        placeholder="Tell a little about your secret."
        value={values.description}
        onValueChange={(newVal) => {
          setValues((prev) => ({ ...prev, description: newVal }));
        }}
      />
      <NumberInput
        isRequired
        label="Price"
        placeholder="Set your desired price!"
        startContent={
          <div className="pointer-events-none flex items-center">
            <span className="text-default-400 text-small">$</span>
          </div>
        }
        description="The price would change based on ethereum value."
        value={values.price}
        onValueChange={(newVal) => {
          setValues((prev) => ({ ...prev, price: newVal }));
        }}
      />
      <Input
        label="The SECRET"
        placeholder="Enter your secret content, we won't tell anyone."
        isRequired
        color="primary"
        value={values.content}
        onValueChange={(newVal) => {
          setValues((prev) => ({ ...prev, content: newVal }));
        }}
      />
      <Button isLoading={isLoading}>
        {isLoading ? "Be patient, may take a while..." : "Submit your secret."}
      </Button>
    </form>
  );
};

export default CreateSecretForm;

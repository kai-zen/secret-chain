import useEthPrice from "@/hooks/useEthPrice";
import { Button, Input, NumberInput, Textarea } from "@heroui/react";
import { FC, useState } from "react";
import { useContractContext } from "@/components/providers/ContractContext";
import { useToast } from "@/components/providers/ToastContext";
import { InputLabel } from ".";
import { SubmitSecretPayloadDTO } from "@/helpers/types";

interface Props {
  afterSubmit?: () => void;
}

const CreateSecretForm: FC<Props> = ({ afterSubmit }) => {
  const { contract } = useContractContext();
  const { usdToWei } = useEthPrice();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState({
    title: "",
    description: "",
    content: "",
    price: 0,
  });

  const submitSecret = async () => {
    if (contract) {
      setIsLoading(true);
      try {
        const params = {
          title: values.title,
          description: values.description,
          content: values.content,
          price: usdToWei(values.price),
        };
        const response = await contract.addSecret(
          ...(Object.values(params) as SubmitSecretPayloadDTO),
        );
        addToast({
          title: "Success",
          description: "Your secret is succussfully made!",
          color: "success",
        });
        console.log("Create secret succuss response:", response);
      } catch (error) {
        addToast({
          title: "Error",
          description: "An error occured during uploading your secret :(",
          color: "danger",
        });
        console.error("Error creating secret:", error);
      } finally {
        setIsLoading(false);
        afterSubmit?.();
      }
    }
  };

  return (
    <form
      className="flex flex-col w-full items-center gap-4 pb-4"
      onSubmit={(e) => {
        e.preventDefault();
        submitSecret();
      }}
    >
      <InputLabel label="Title">
        <Input
          isRequired
          variant="bordered"
          value={values.title}
          onValueChange={(newVal) => {
            setValues((prev) => ({ ...prev, title: newVal }));
          }}
          className="text-foreground"
        />
      </InputLabel>
      <InputLabel label="Description">
        <Textarea
          variant="bordered"
          value={values.description}
          onValueChange={(newVal) => {
            setValues((prev) => ({ ...prev, description: newVal }));
          }}
          className="text-foreground"
        />
      </InputLabel>
      <InputLabel label="Price ($)">
        <NumberInput
          value={values.price}
          onValueChange={(newVal) => {
            setValues((prev) => ({ ...prev, price: newVal }));
          }}
          step={0.5}
          className="text-foreground"
        />
      </InputLabel>
      <InputLabel label="The SECRET">
        <Input
          description="Enter your secret content, we won't tell anyone unless they pay."
          isRequired
          className="text-foreground"
          color="primary"
          variant="bordered"
          value={values.content}
          onValueChange={(newVal) => {
            setValues((prev) => ({ ...prev, content: newVal }));
          }}
        />
      </InputLabel>
      <Button
        isLoading={isLoading}
        type="submit"
        color="primary"
        variant="shadow"
      >
        {isLoading ? "Be patient, may take a while..." : "Submit your secret."}
      </Button>
    </form>
  );
};

export default CreateSecretForm;

import { FC } from "react";
import { SecretDT } from "@/helpers/types";
import useCardActions from "./useCardActions";
import CardFooter from "./CardFooter";
import { Button } from "@heroui/react";

interface Props {
  secret: SecretDT;
}

const SecretCard: FC<Props> = ({ secret }) => {
  const cardHookData = useCardActions(secret);
  const { data, hasAccess, fetchDetails, isLoadingDetails } = cardHookData;

  const hasDetails = Boolean(data?.content && data?.owner);

  return (
    <div className="border border-divider rounded-lg p-3">
      <div className="flex items-start gap-1.5">
        <div className="min-w-5 w-5 h-5 rounded-full bg-primary font-bold text-sm text-black flex items-center justify-center">
          {data.id}
        </div>
        <p className="font-medium leading-5">{data.title}</p>
      </div>
      <p className="text-xs mt-2">Price: {data.price} $</p>
      {hasDetails && (
        <div className="p-2 rounded-md bg-[rgba(256,256,256,.05)] mt-4">
          <p className="text-sm">{data.description}</p>
          <p className="text-[10px] mt-1.5">Created by: {data.owner}</p>
        </div>
      )}
      {hasAccess ? (
        <div>
          {hasDetails ? (
            <div className="mt-4">
              <p className="text-sm">The secret is:</p>
              <p className="text-xl mt-1 text-center font-semibold text-primary">
                {data.content}
              </p>
            </div>
          ) : (
            <Button
              onPress={fetchDetails}
              isLoading={isLoadingDetails}
              className="mt-6 animate-bounce w-full"
              color="primary"
              variant="shadow"
              size="lg"
            >
              REVEAL
            </Button>
          )}
        </div>
      ) : (
        <CardFooter {...cardHookData} />
      )}
    </div>
  );
};

export default SecretCard;

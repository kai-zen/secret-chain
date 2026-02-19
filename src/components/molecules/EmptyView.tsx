import { Button } from "@heroui/react";
import { IconArrowDown, IconCurrencyDollar } from "@tabler/icons-react";
import { FC } from "react";

interface Pros {
  handleOpenCreateSecret: () => void;
}

const EmptyView: FC<Pros> = ({ handleOpenCreateSecret }) => {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <p className="text-2xl font-bold">
        No secrets <span className="text-primary">yet</span>!
      </p>
      <p>
        You can create first secret here{" "}
        <IconArrowDown size={18} className="inline" />
      </p>
      <Button
        color="primary"
        className="mt-2 cursor-pointer"
        onPress={handleOpenCreateSecret}
        variant="shadow"
        endContent={<IconCurrencyDollar size={18} />}
      >
        Sell first secret
      </Button>
    </div>
  );
};

export default EmptyView;

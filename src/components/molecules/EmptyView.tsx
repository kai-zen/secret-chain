import { Button } from "@heroui/react";
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
      <p>You can create first secret here!</p>
      <Button
        color="primary"
        className="mt-2 cursor-pointer"
        onPress={handleOpenCreateSecret}
        variant="shadow"
      >
        Create first secret
      </Button>
    </div>
  );
};

export default EmptyView;

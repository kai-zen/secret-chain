import { SecretDT } from "@/helpers/types";
import { Button, cn } from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";
import { FC, useMemo, useState } from "react";
import { EmptyView } from "@/components/molecules";
import { SecretCard } from "@/components/home";
import { CreateSecretModal } from "@/components/modals";

interface Props {
  secretsData: SecretDT[];
  totalCount: number;
}

const SecretList: FC<Props> = ({ secretsData, totalCount }) => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const isEmpty = !secretsData?.length;

  const { allData, oddArray, evenArray } = useMemo(() => {
    const { evenArray, oddArray } = (secretsData || []).reduce(
      (acc, val, i) => {
        acc[i % 2 === 0 ? "evenArray" : "oddArray"].push(val);
        return acc;
      },
      { evenArray: [], oddArray: [] } as {
        evenArray: SecretDT[];
        oddArray: SecretDT[];
      },
    );
    return { allData: secretsData, oddArray, evenArray };
  }, [secretsData]);

  return (
    <>
      <div>
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm">Total secrets count: {totalCount}</p>
            <Button
              startContent={<IconPlus size={18} />}
              variant="bordered"
              onPress={() => setIsCreateFormOpen(true)}
              className="cursor-pointer"
            >
              Create
            </Button>
          </div>
        </div>
        {isEmpty ? (
          <EmptyView handleOpenCreateSecret={() => setIsCreateFormOpen(true)} />
        ) : (
          <div className="mt-4">
            <div className="sm:hidden">
              {allData.map((secret) => (
                <SecretCard secret={secret} key={secret.id} />
              ))}
            </div>
            <div className="hidden sm:flex gap-3 w-full">
              <div
                className={cn(
                  "flex flex-col gap-3",
                  oddArray.length ? "w-1/2" : "w-full",
                )}
              >
                {evenArray.map((secret) => (
                  <SecretCard secret={secret} key={secret.id} />
                ))}
              </div>
              <div
                className={cn(
                  "w-1/2 flex-col gap-3",
                  oddArray.length ? "flex" : "hidden",
                )}
              >
                {oddArray.map((secret) => (
                  <SecretCard secret={secret} key={secret.id} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* modals */}
      <CreateSecretModal
        isOpen={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
      />
    </>
  );
};

export default SecretList;

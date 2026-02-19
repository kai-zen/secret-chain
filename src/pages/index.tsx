import { HeroSection, SecretCard } from "@/components/home";
import { Header } from "@/components/layout";
import { CreateSecretModal } from "@/components/modals";
import { EmptyView } from "@/components/molecules";
import useSecretsData from "@/hooks/useSecretsData";
import { Button, Divider } from "@heroui/react";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

export default function Home() {
  const { totalCount, secretsData } = useSecretsData();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const isEmpty = !secretsData?.length;

  return (
    <>
      <div className="p-4 flex flex-col gap-8 w-full max-w-[640px] mx-auto">
        <Header />
        <HeroSection />
        <Divider />
        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm">Total secrets count: {totalCount}</p>
            <Button
              startContent={<IconPlus size={18} />}
              variant="bordered"
              onPress={() => setIsCreateFormOpen(true)}
            >
              Create
            </Button>
          </div>
        </div>
        {isEmpty ? (
          <EmptyView handleOpenCreateSecret={() => setIsCreateFormOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secretsData.map((secret) => (
              <SecretCard secret={secret} key={secret.id} />
            ))}
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
}

import { HeroSection } from "@/components/home";
import { Header } from "@/components/layout";
import { CreateSecretModal } from "@/components/modals";
import { EmptyView } from "@/components/molecules";
import useSecretsData from "@/hooks/useSecretsData";
import { Divider } from "@heroui/react";
import { useState } from "react";

export default function Home() {
  const { totalCount, secretsData } = useSecretsData();
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const isEmpty = true;

  console.log(secretsData);

  return (
    <>
      <div className="p-4 flex flex-col gap-8 w-full max-w-[480px] mx-auto">
        <Header />
        <HeroSection />
        <Divider />
        {totalCount}
        {isEmpty ? (
          <EmptyView
            handleOpenCreateSecret={() => {
              setIsCreateFormOpen(true);
            }}
          />
        ) : null}
      </div>
      {/* modals */}
      <CreateSecretModal
        isOpen={isCreateFormOpen}
        onOpenChange={setIsCreateFormOpen}
      />
    </>
  );
}

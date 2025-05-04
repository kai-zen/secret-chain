import { AccountPicker, EmptyView } from "@/components/molecules";
import { Divider } from "@heroui/react";
import { useState } from "react";

export default function Home() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

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
    </div>
  );
}

import { FC } from "react";
import { AccountPicker } from "@/components/molecules";

const Header: FC = () => {
  return (
    <header className="flex justify-between items-center gap-4">
      <h1 className="font-semibold text-sm">
        Secrets
        <br />
        Marketplace
      </h1>
      <AccountPicker />
    </header>
  );
};

export default Header;

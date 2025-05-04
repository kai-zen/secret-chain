import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Button,
} from "@heroui/react";
import {
  IconAffiliate,
  IconCheck,
  IconChevronDown,
  IconWallet,
} from "@tabler/icons-react";
import { FC } from "react";
import { useContractContext } from "@/components/providers/ContractContext";

const AccountPicker: FC = () => {
  const { signer, handleChangeSigner, accounts } = useContractContext();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          className="capitalize w-fit"
          variant="bordered"
          endContent={<IconChevronDown />}
        >
          <p className="text-sm truncate max-w-[120px]">{signer}</p>
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        onAction={(key) => handleChangeSigner(key)}
        aria-label="Dropdown Variants"
      >
        {(accounts || []).map((acc) => {
          const isSelected = acc.address === signer;
          return (
            <DropdownItem
              key={acc.address}
              className={isSelected ? "bg-gray-100" : ""}
            >
              <div className="flex items-center gap-2">
                <div className="min-w-5">
                  {isSelected ? (
                    <IconCheck size={20} className="text-success" />
                  ) : acc.source === "metamask" ? (
                    <IconWallet
                      size={18}
                      className="text-gray-600"
                      stroke={1.5}
                    />
                  ) : (
                    <IconAffiliate
                      size={18}
                      className="text-gray-600"
                      stroke={1.5}
                    />
                  )}{" "}
                </div>
                <p className="text-sm max-w-[240px] text-clip break-all">
                  {acc.address}{" "}
                  <span className="text-xs text-primary">
                    ({acc.balance} eth)
                  </span>
                </p>
              </div>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

export default AccountPicker;

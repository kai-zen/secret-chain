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
    <div className="w-fit">
      <Dropdown>
        <DropdownTrigger>
          <Button
            className="capitalize w-fit cursor-pointer"
            variant="bordered"
            endContent={<IconChevronDown />}
          >
            <p className="text-sm truncate max-w-[120px]">{signer}</p>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          onAction={(key) => handleChangeSigner(key as string)}
          aria-label="Dropdown Variants"
        >
          {(accounts || []).map((acc) => {
            const isSelected = acc.address === signer;
            return (
              <DropdownItem
                key={acc.address}
                textValue={acc.address}
                className={
                  isSelected
                    ? "bg-gray-700 text-foreground cursor-auto"
                    : "text-foreground cursor-pointer"
                }
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-5">
                    {isSelected ? (
                      <IconCheck size={20} className="text-success" />
                    ) : acc.source === "metamask" ? (
                      <IconWallet
                        size={18}
                        className="text-gray-400"
                        stroke={1.5}
                      />
                    ) : (
                      <IconAffiliate
                        size={18}
                        className="text-gray-400"
                        stroke={1.5}
                      />
                    )}{" "}
                  </div>
                  <p className="text-sm max-w-[240px] text-clip break-all">
                    {acc.address}{" "}
                    <span className="text-xs text-primary">
                      ({Number(acc.balance).toFixed(4)} eth)
                    </span>
                  </p>
                </div>
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
      <p className="text-xs text-center text-gray-400 mt-1">pick account</p>
    </div>
  );
};

export default AccountPicker;

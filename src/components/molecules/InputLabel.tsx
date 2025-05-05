import { cn } from "@heroui/react";
import { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
  label: string;
  isPrimary?: boolean;
}

const InputLabel: FC<Props> = ({ children, label, isPrimary }) => {
  return (
    <div className="w-full flex flex-col gap-1 items-start">
      <p
        className={cn(
          "text-xs",
          isPrimary ? "text-primary" : "text-foreground"
        )}
      >
        {label}
      </p>
      {children}
    </div>
  );
};

export default InputLabel;

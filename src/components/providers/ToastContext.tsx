import { Alert } from "@heroui/react";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type ToastType = {
  title: string;
  description: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  variant?: "flat" | "solid" | "faded" | "bordered";
  duration?: number;
};

type ToastContextType = {
  // eslint-disable-next-line no-unused-vars
  addToast: (toast: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = (toast: ToastType) => {
    const newToast = {
      ...toast,
      color: toast.color || "default",
      duration: toast.duration || 3_000,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== newToast));
    }, newToast.duration);
  };

  const removeToast = (index: number) => {
    setToasts((prev) => {
      const newToasts = [...prev];
      newToasts.splice(index, 1);
      return newToasts;
    });
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timers = toasts.map((toast, i) =>
        setTimeout(() => {
          removeToast(i);
        }, toast.duration)
      );

      return () => timers.forEach((timer) => clearTimeout(timer));
    }
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[99]">
        {toasts.map((toast, index) => (
          <Alert
            key={toast.title + index}
            title={toast.title}
            description={toast.description}
            color={toast.color}
            variant={toast.variant || "bordered"}
            hideIcon={false}
            className="mt-2"
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

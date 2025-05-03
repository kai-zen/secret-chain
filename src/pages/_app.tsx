import { ContractProvider } from "@/components/providers/ContractContext";
import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <ContractProvider>
        <Component {...pageProps} />
      </ContractProvider>
    </HeroUIProvider>
  );
}

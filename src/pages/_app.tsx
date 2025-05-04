import { ContractProvider } from "@/components/providers/ContractContext";
import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import type { AppProps } from "next/app";
import { IBM_Plex_Mono, Space_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-mono",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <ContractProvider>
        <main
          className={`${ibmPlexMono.variable} ${spaceMono.variable} dark text-foreground bg-background`}
        >
          <Component {...pageProps} />
        </main>
      </ContractProvider>
    </HeroUIProvider>
  );
}

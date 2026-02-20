import { HeroSection } from "@/components/home";
import SecretList from "@/components/home/SecretList";
import { Header } from "@/components/layout";
import { useContractContext } from "@/components/providers/ContractContext";
import { Divider } from "@heroui/react";
import { NextPage } from "next";

const Home: NextPage = () => {
  const { totalCount, secretsData } = useContractContext();

  return (
    <>
      <div className="p-4 flex flex-col gap-8 w-full max-w-[640px] mx-auto">
        <Header />
        <HeroSection />
        <Divider />
        <SecretList secretsData={secretsData} totalCount={totalCount} />
      </div>
    </>
  );
};

export default Home;

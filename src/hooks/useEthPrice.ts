import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CoingeckoEthereumPriceApiAddress } from "@/helpers/constants";
import { BigNumberish } from "ethers";

const useEthPrice = () => {
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchEthPrice = async () => {
      if (!ethPrice) {
        const ssesionStorageEth = sessionStorage.getItem("ethPrice");
        if (ssesionStorageEth) setEthPrice(Number(ssesionStorageEth));
        else {
          try {
            const response = await fetch(CoingeckoEthereumPriceApiAddress);
            const data = await response.json();
            const ethPrice = data.ethereum.usd;
            if (ethPrice) {
              sessionStorage.setItem("ethPrice", ethPrice);
              setEthPrice(ethPrice);
            }
          } catch (err) {
            console.error("Error fetching ETH price:", err);
          }
        }
      }
    };

    fetchEthPrice();
  }, [ethPrice]);

  const usdToWei = (usdAmount: number): BigNumberish => {
    if (!ethPrice) throw new Error("ETH price not loaded");
    const ethAmount = usdAmount / ethPrice;
    const roundedEth = parseFloat(ethAmount.toFixed(8));
    return ethers.parseEther(roundedEth.toString());
  };

  const ethToWei = (ethAmount: number | string): BigNumberish => {
    return ethers.parseEther(ethAmount.toString());
  };

  const weiToUsd = (weiAmount: BigNumberish): number => {
    if (!ethPrice) throw new Error("ETH price not loaded");
    const ethAmount = parseFloat(ethers.formatEther(weiAmount));
    return ethAmount * ethPrice;
  };

  const weiToEth = (weiAmount: BigNumberish): string => {
    return ethers.formatEther(weiAmount);
  };

  return {
    usdToWei,
    ethToWei,
    weiToUsd,
    weiToEth,
  };
};

export default useEthPrice;

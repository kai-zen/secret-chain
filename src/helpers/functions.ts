import { JsonRpcSigner, parseEther } from "ethers";
import { JsonRpcProvider, formatEther } from "ethers";
import { PopulatedAccount } from "./types";

export const getAccountBalance = async (
  address: string,
  provider: JsonRpcProvider | null
) => {
  if (address && provider) {
    const balance = await provider.getBalance(address);
    return formatEther(balance); // Convert to readable ETH
  }
};

export const handlePopulateAccounts = async (
  ganacheAccounts: JsonRpcSigner[],
  provider: JsonRpcProvider | null
) => {
  const populatedGanacheAccounts: PopulatedAccount[] = [];
  for await (const ganacheAccount of ganacheAccounts) {
    const accountAddress = ganacheAccount.address;
    const accountBalance = await ganacheAccount.provider.getBalance(
      accountAddress
    );
    const etherBalance = formatEther(accountBalance || 0);
    populatedGanacheAccounts.push({
      address: accountAddress,
      balance: etherBalance,
      source: "ganache",
    });
  }

  const populatedMetaMaskAccounts: PopulatedAccount[] = [];
  if (window.ethereum) {
    const metamaskAccounts: string[] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    for await (const accountAddress of metamaskAccounts) {
      const accountBalance = await getAccountBalance(accountAddress, provider);
      const etherBalance = formatEther(
        accountBalance ? parseEther(accountBalance) : 0
      );
      populatedMetaMaskAccounts.push({
        address: accountAddress,
        balance: etherBalance,
        source: "metamask",
      });
    }
  }

  return [...populatedMetaMaskAccounts, ...populatedGanacheAccounts];
};

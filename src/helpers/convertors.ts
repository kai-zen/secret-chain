/* eslint-disable no-unused-vars */
import { BigNumberish } from "ethers";
import { SecretDT, SecretDetailsDT } from "./types";

export const secretListProxyToObject = (
  item: any,
  weiToUsd: (weiAmount: BigNumberish) => number,
): SecretDT => ({
  id: Number(item.id),
  title: String(item.title ?? ""),
  price: weiToUsd(item.price).toFixed(2),
});

export const secretDetailProxyToObject = (
  item: any,
  weiToUsd: (weiAmount: BigNumberish) => number,
): SecretDetailsDT => ({
  id: Number(item.id),
  title: String(item.title ?? ""),
  price: weiToUsd(item.price).toFixed(2),
  owner: String(item.owner ?? ""),
  description: String(item.description ?? ""),
  content: String(item.content ?? ""),
});

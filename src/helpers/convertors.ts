/* eslint-disable no-unused-vars */
import { BigNumberish } from "ethers";

export const secretListProxyToObject = (
  item: any,
  weiToUsd: (weiAmount: BigNumberish) => number,
) => ({
  id: Number(item.id),
  title: String(item.title ?? ""),
  price: weiToUsd(item.price).toFixed(2),
});

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

export const contractErrorTranslator = (err: any, defaultMessage?: string) => {
  let message = defaultMessage || "Failed";

  // Try to extract revert reason from error
  if (err?.reason) {
    message = err.reason;
  } else if (err?.error?.reason) {
    message = err.error.reason;
  } else if (err?.error?.message) {
    message = err.error.message;
  } else if (err?.message) {
    // Parse common error messages
    const errMsg = err.message.toLowerCase();
    if (errMsg.includes("user rejected") || errMsg.includes("user denied")) {
      message = "Transaction was rejected";
    } else if (
      errMsg.includes("insufficient funds") ||
      errMsg.includes("balance")
    ) {
      message = "Insufficient balance";
    } else if (errMsg.includes("already has access")) {
      message = "You already have access to this secret";
    } else if (errMsg.includes("cannot buy own secret")) {
      message = "You cannot unlock your own secret";
    } else if (errMsg.includes("underpaid")) {
      message = "Payment amount is insufficient";
    } else if (errMsg.includes("invalid secret index")) {
      message = "Invalid secret";
    } else {
      message = err.message;
    }
  }
  return message;
};

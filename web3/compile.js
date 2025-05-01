/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const contractPath = path.resolve(__dirname, "Secrets.sol");
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Secrets.sol": { content: source },
  },
  settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts["Secrets.sol"];
const abi = contract["Secrets"].abi;
const bytecode = contract["Secrets"].evm.bytecode.object;

// Save compiled contract
fs.writeFileSync(path.resolve(__dirname, "abi.json"), JSON.stringify(abi, null, 2));
fs.writeFileSync(path.resolve(__dirname, "bytecode.json"), JSON.stringify(bytecode, null, 2));

console.log("Contract compiled successfully!");

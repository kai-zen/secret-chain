/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const { JsonRpcProvider, ContractFactory } = require("ethers");
const path = require("path");

const provider = new JsonRpcProvider("http://127.0.0.1:8545");

// Deploy contract
const deployContract = async () => {
  const accounts = await provider.listAccounts();
  const signer = accounts[0]

  const abiPath = path.join(__dirname, "abi.json");
  const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

  const bytecodePath = path.join(__dirname, "bytecode.json");
  const bytecode = JSON.parse(fs.readFileSync(bytecodePath, "utf8"));

  const factory = new ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(200);

  console.log("Contract deployed at:", contract.target);
  fs.writeFileSync(".env", `NEXT_PUBLIC_CONTRACT_ADDRESS=${contract.target}\n`);
};

deployContract();

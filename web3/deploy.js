/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const { JsonRpcProvider, ContractFactory, Wallet } = require("ethers");
const path = require("path");

// Configuration
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Optional: for non-Ganache deployments
const PLATFORM_FEE_BIPS_RAW = process.env.PLATFORM_FEE_BIPS || "200"; // Default: 2% (200 basis points)
const ENV_FILE = path.resolve(__dirname, "..", ".env");

// Parse and validate fee (contract expects 0–10000)
const feeBips = parseInt(PLATFORM_FEE_BIPS_RAW, 10);
if (Number.isNaN(feeBips) || feeBips < 0 || feeBips > 10000) {
  console.error("Error: PLATFORM_FEE_BIPS must be a number between 0 and 10000");
  process.exit(1);
}

const deployContract = async () => {
  try {
    console.log(`Connecting to RPC: ${RPC_URL}`);
    const provider = new JsonRpcProvider(RPC_URL);

    // Check if provider is available
    try {
      await provider.getBlockNumber();
    } catch (error) {
      console.error(`Error: Cannot connect to RPC at ${RPC_URL}`);
      console.error("Make sure Ganache or your node is running.");
      console.error("Error details", error);
      process.exit(1);
    }

    let signer;
    let signerAddress;
    if (PRIVATE_KEY) {
      signer = new Wallet(PRIVATE_KEY, provider);
      signerAddress = await signer.getAddress();
      console.log(`Using wallet: ${signerAddress}`);
    } else {
      const accounts = await provider.listAccounts();
      if (!accounts || accounts.length === 0) {
        console.error("Error: No accounts available. Make sure Ganache is running.");
        process.exit(1);
      }
      
      const firstAccount = accounts[0];
      
      // Handle different return types from listAccounts()
      if (typeof firstAccount === "string") {
        signerAddress = firstAccount;
        signer = await provider.getSigner(signerAddress);
      } else if (firstAccount && typeof firstAccount.getAddress === "function") {
        signer = firstAccount;
        signerAddress = await signer.getAddress();
      } else if (firstAccount && firstAccount.address) {
        signerAddress = firstAccount.address;
        signer = await provider.getSigner(signerAddress);
      } else {
        console.error("Error: Unexpected account format from provider");
        process.exit(1);
      }
      
      console.log(`Using account: ${signerAddress}`);
    }

    // Check balance
    const balance = await provider.getBalance(signerAddress);
    if (balance === 0n) {
      console.warn("Warning: Account has zero balance. Deployment may fail.");
    } else {
      console.log(`Balance: ${balance.toString()} wei`);
    }

    // Load contract artifacts
    const abiPath = path.join(__dirname, "abi.json");
    const bytecodePath = path.join(__dirname, "bytecode.json");

    if (!fs.existsSync(abiPath)) {
      console.error(`Error: ABI file not found at ${abiPath}`);
      console.error("Run 'npm run compile' first.");
      process.exit(1);
    }

    if (!fs.existsSync(bytecodePath)) {
      console.error(`Error: Bytecode file not found at ${bytecodePath}`);
      console.error("Run 'npm run compile' first.");
      process.exit(1);
    }

    let abi, bytecode;
    try {
      abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
      bytecode = JSON.parse(fs.readFileSync(bytecodePath, "utf8"));
    } catch (error) {
      console.error("Error: Failed to parse ABI or bytecode JSON files");
      console.error(error.message);
      process.exit(1);
    }

    if (!abi || !bytecode) {
      console.error("Error: Invalid ABI or bytecode");
      process.exit(1);
    }

    // Ensure bytecode is a string and add 0x prefix if missing
    if (typeof bytecode !== "string") {
      console.error("Error: Bytecode must be a string");
      process.exit(1);
    }
    // Remove quotes if present and ensure 0x prefix
    bytecode = bytecode.trim().replace(/^["']|["']$/g, "");
    if (!bytecode.startsWith("0x")) {
      bytecode = "0x" + bytecode;
    }

    console.log(`\nDeploying contract with platform fee: ${feeBips} bips (${(feeBips / 100).toFixed(2)}%)...`);

    const factory = new ContractFactory(abi, bytecode, signer);
    const contract = await factory.deploy(feeBips);

    const deploymentTx = contract.deploymentTransaction();
    if (deploymentTx && deploymentTx.hash) {
      console.log(`Transaction hash: ${deploymentTx.hash}`);
    }
    console.log("Waiting for deployment confirmation...");

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log(`\n✓ Contract deployed successfully!`);
    console.log(`  Address: ${contractAddress}`);
    console.log(`  Platform fee: ${feeBips} bips (${(feeBips / 100).toFixed(2)}%)`);

    updateEnvFile(contractAddress);

    console.log(`\n✓ Contract address saved to .env file`);
    console.log(`  Run 'npm run typechain' to regenerate TypeScript types.`);
  } catch (error) {
    console.error("\n❌ Error during deployment:");
    console.error(`Message: ${error.message}`);
    
    if (error.reason) {
      console.error(`Reason: ${error.reason}`);
    }
    if (error.data) {
      console.error(`Data: ${JSON.stringify(error.data)}`);
    }
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.transaction) {
      console.error(`Transaction: ${JSON.stringify(error.transaction, null, 2)}`);
    }
    
    // Common error messages
    if (error.message.includes("insufficient funds")) {
      console.error("\n💡 Tip: Make sure your account has enough ETH to deploy the contract.");
    }
    if (error.message.includes("nonce")) {
      console.error("\n💡 Tip: Try resetting your account nonce or wait a moment.");
    }
    if (error.message.includes("network") || error.message.includes("connection")) {
      console.error("\n💡 Tip: Check that Ganache is running or your RPC endpoint is accessible.");
    }
    
    console.error("\nFull error:", error);
    process.exit(1);
  }
};

const updateEnvFile = (contractAddress) => {
  let envContent = "";

  // Read existing .env if it exists
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, "utf8");
  }

  // Update or add CONTRACT_ADDRESS
  const lines = envContent.split("\n");
  let found = false;
  const updatedLines = lines.map((line) => {
    if (line.startsWith("NEXT_PUBLIC_CONTRACT_ADDRESS=")) {
      found = true;
      return `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`;
    }
    return line;
  });

  if (!found) {
    updatedLines.push(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  }

  // Remove empty lines at the end
  while (updatedLines.length > 0 && updatedLines[updatedLines.length - 1].trim() === "") {
    updatedLines.pop();
  }

  // Ensure file ends with newline
  const finalContent = updatedLines.join("\n") + (updatedLines.length > 0 ? "\n" : "");

  fs.writeFileSync(ENV_FILE, finalContent);
};

deployContract();

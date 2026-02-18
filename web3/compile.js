/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const solc = require("solc");

const CONTRACT_NAME = "Secrets";
const CONTRACT_FILE = "Secrets.sol";
const CONTRACT_PATH = path.resolve(__dirname, CONTRACT_FILE);

// Check if contract file exists
if (!fs.existsSync(CONTRACT_PATH)) {
  console.error(`Error: Contract file not found at ${CONTRACT_PATH}`);
  process.exit(1);
}

console.log(`Compiling ${CONTRACT_FILE}...`);

const source = fs.readFileSync(CONTRACT_PATH, "utf8");

const input = {
  language: "Solidity",
  sources: {
    [CONTRACT_FILE]: { content: source },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200, // Optimize for 200 runs (good balance between size and gas)
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
      },
    },
  },
};

try {
  const output = JSON.parse(solc.compile(JSON.stringify(input)));

  // Check for compilation errors
  if (output.errors) {
    const errors = output.errors.filter(
      (error) => error.severity === "error"
    );
    if (errors.length > 0) {
      console.error("Compilation errors:");
      errors.forEach((error) => {
        console.error(`  ${error.formattedMessage || error.message}`);
      });
      process.exit(1);
    }
    // Show warnings but don't fail
    const warnings = output.errors.filter(
      (error) => error.severity === "warning"
    );
    if (warnings.length > 0) {
      console.warn("Compilation warnings:");
      warnings.forEach((warning) => {
        console.warn(`  ${warning.formattedMessage || warning.message}`);
      });
    }
  }

  const contract = output.contracts[CONTRACT_FILE];
  if (!contract || !contract[CONTRACT_NAME]) {
    console.error(`Error: Contract ${CONTRACT_NAME} not found in compilation output`);
    process.exit(1);
  }

  const contractData = contract[CONTRACT_NAME];
  const abi = contractData.abi;
  const bytecode = contractData.evm.bytecode.object;
  const deployedBytecode = contractData.evm.deployedBytecode.object;

  if (!abi || !bytecode) {
    console.error("Error: Failed to extract ABI or bytecode from compilation output");
    process.exit(1);
  }

  // Save compiled contract artifacts
  const abiPath = path.resolve(__dirname, "abi.json");
  const bytecodePath = path.resolve(__dirname, "bytecode.json");
  const deployedBytecodePath = path.resolve(__dirname, "deployedBytecode.json");

  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));
  fs.writeFileSync(bytecodePath, JSON.stringify(bytecode, null, 2));
  fs.writeFileSync(deployedBytecodePath, JSON.stringify(deployedBytecode, null, 2));

  console.log(`✓ Contract compiled successfully!`);
  console.log(`  ABI saved to: ${abiPath}`);
  console.log(`  Bytecode saved to: ${bytecodePath}`);
  console.log(`  Deployed bytecode saved to: ${deployedBytecodePath}`);
  console.log(`  Contract size: ${(bytecode.length / 2 - 1)} bytes (limit: 24576 bytes)`);
} catch (error) {
  console.error("Error during compilation:", error.message);
  process.exit(1);
}

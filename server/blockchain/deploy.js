require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });
const fs = require("fs");
const path = require("path");
const solc = require("solc");
const { Web3 } = require("web3");

const contractPath = path.resolve(__dirname, "EvidenceContract.sol");
const buildDirectory = path.resolve(__dirname, "build");
const outputPath = path.resolve(buildDirectory, "EvidenceContract.json");

async function compileContract() {
  const source = fs.readFileSync(contractPath, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      "EvidenceContract.sol": {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    const fatalErrors = output.errors.filter((item) => item.severity === "error");
    if (fatalErrors.length) {
      throw new Error(fatalErrors.map((item) => item.formattedMessage).join("\n"));
    }
  }

  const contractOutput = output.contracts["EvidenceContract.sol"].EvidenceContract;
  return {
    abi: contractOutput.abi,
    bytecode: contractOutput.evm.bytecode.object,
  };
}

async function deploy() {
  const { abi, bytecode } = await compileContract();
  const providerUrl =
    process.env.BLOCKCHAIN_RPC_URL ||
    process.env.GANACHE_URL ||
    "http://127.0.0.1:7545";
  const web3 = new Web3(providerUrl);
  let deployerAccount = process.env.ETH_ACCOUNT || null;

  if (process.env.BLOCKCHAIN_PRIVATE_KEY) {
    const signer = web3.eth.accounts.wallet.add(process.env.BLOCKCHAIN_PRIVATE_KEY);
    deployerAccount = deployerAccount || signer.address;
  }

  if (!deployerAccount) {
    const accounts = await web3.eth.getAccounts();
    deployerAccount = accounts[0];
  }

  if (!deployerAccount) {
    throw new Error("No blockchain deployer account available.");
  }

  const contract = new web3.eth.Contract(abi);
  const deployedContract = await contract
    .deploy({ data: `0x${bytecode}` })
    .send({ from: deployerAccount, gas: 3000000 });

  fs.mkdirSync(buildDirectory, { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        abi,
        address: deployedContract.options.address,
        network: process.env.BLOCKCHAIN_NETWORK || "Ganache",
        rpcUrl: providerUrl,
      },
      null,
      2,
    ),
  );

  console.log(deployedContract.options.address);
}

deploy().catch((error) => {
  console.error(error);
  process.exit(1);
});

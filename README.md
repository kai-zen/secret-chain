# Secret Chain

A **Web3 dApp** that lets users publish a secret (any string) and set a price in ETH. Others can pay to unlock and view the content. Sellers earn from unlocks; the platform takes a configurable fee. Built with **Solidity**, **ethers.js**, and **Next.js**.

---

## What It Does

- **Publish a secret** — Enter a title, description, your secret content, and a price (in USD, converted to wei).
- **Browse listed secrets** — See all public listings with title and price (content is hidden until unlocked).
- **Pay to unlock** — Send the required ETH to the contract; you get permanent access to that secret’s content.
- **Earn as a seller** — Unlock payments go to the secret owner (minus platform fee); withdraw anytime.
- **Multi-account** — Switch between Ganache accounts to test as different buyers/sellers.

---

## Tech Stack

| Layer              | Stack                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| **Smart contract** | Solidity ^0.8.23 — custom errors, reentrancy guard, platform fee (basis points), paginated reads |
| **Blockchain**     | Ethereum (local: Ganache); ethers v6 for provider/signer/contract                                |
| **Frontend**       | Next.js 15, React 19, TypeScript                                                                 |
| **UI**             | HeroUI, Tailwind CSS, Framer Motion                                                              |
| **Tooling**        | solc, TypeChain (ethers-v6), CoinGecko API for ETH→USD                                           |

---

## Smart Contract Highlights

- **Payments**: `unlockSecret(secretId)` is `payable`; exact price required (overpayment refunded).
- **Access control**: `hasAccess[secretId][user]` and owner check; `viewSecretContent` only for owner or paid users.
- **Platform fee**: Configurable at deploy (e.g. 200 bips = 2%); fee goes to `platformOwner`, rest to secret owner.
- **Withdrawals**: Sellers call `withdrawBalance()`; platform owner calls `withdrawPlatformFees()`; both use pull-over-push and `nonReentrant`.
- **Gas-conscious**: Custom errors, `unchecked` where safe, packed struct (e.g. `uint96` + `address`), paginated `getSecretsPaginated(start, count)`.

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Ganache** (local Ethereum node)

### 1. Install dependencies

```bash
npm install
```

### 2. Start Ganache

```bash
npm run ganache
```

Keep it running (default: `http://127.0.0.1:8545`).

### 3. Compile the contract

```bash
npm run compile
```

### 4. Deploy the contract

```bash
npm run deploy
```

Optional: set platform fee in basis points (default 200 = 2%):

```bash
PLATFORM_FEE_BIPS=500 npm run deploy
```

Deployment writes `NEXT_PUBLIC_CONTRACT_ADDRESS` to `.env`. If you use a custom RPC or key:

```bash
RPC_URL=http://127.0.0.1:8545 PRIVATE_KEY=0x... npm run deploy
```

### 5. (Optional) Regenerate TypeScript types from ABI

```bash
npm run typechain
```

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect with the same network (Ganache). Use different Ganache accounts to test creating secrets and buying unlocks.

---

## Scripts

| Command             | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `npm run dev`       | Start Next.js dev server                                            |
| `npm run build`     | Production build                                                    |
| `npm run compile`   | Compile `web3/Secrets.sol` → `web3/abi.json` & `web3/bytecode.json` |
| `npm run deploy`    | Deploy contract (uses `.env` or `RPC_URL` / `PRIVATE_KEY`)          |
| `npm run typechain` | Generate ethers-v6 types from ABI into `web3/types`                 |
| `npm run ganache`   | Start local Ganache chain                                           |

---

## Project Structure (high level)

```
secret-chain/
├── web3/
│   ├── Secrets.sol          # Main contract
│   ├── compile.js           # Solidity compile script
│   ├── deploy.js            # Deployment script
│   ├── abi.json / bytecode.json
│   └── types/               # TypeChain (ethers-v6) output
├── src/
│   ├── components/          # React UI (home, card, modals, layout, providers)
│   ├── hooks/               # useContract, useEthPrice
│   ├── helpers/             # convertors, constants, types
│   └── pages/               # Next.js pages
└── .env                     # NEXT_PUBLIC_CONTRACT_ADDRESS (created by deploy)
```

---

## License

MIT

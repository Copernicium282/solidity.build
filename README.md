# solidity.build [🚧 Under Construction 🚧]

[![React](https://img.shields.io/badge/React-18-blue?style=flat-square)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Hardhat](https://img.shields.io/badge/Local-Hardhat-orange?style=flat-square)](https://hardhat.org)

[solidity.build](https://copernicium282.github.io/solidity.build/) is a visual, block-based smart contract builder for Ethereum. Drag blocks onto a canvas, configure them inline, and watch Solidity code generate in real time. Compile it in the browser. Deploy it to a local node, or copy the code over to Remix IDE. No prior Solidity experience required. I plan on making it a great learning tool for those who are new to Solidity. 

Inspired by [eth.build](https://eth.build) and [MIT Scratch](https://scratch.mit.edu).

## Screenshots

| Visual Builder | Live Solidity Generation |
| :---: | :---: |
| ![Builder](public/image.png) | ![Preview](public/image2.png) |

## Table of Contents

- [Background](#background)
- [Getting Started](#getting-started)
- [Block Types](#block-types)
- [Local Deployment](#local-deployment)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Background

Learning Solidity is somewhat hard. Most of the tools such as Remix, Hardhat and Foundry assumes that you already understand the language. Solidity by Example is good and gets the job done, but it is still text-based; I also plan on including those as example modules in the future that can be imported to make the learning experience much better.

solidity.build aims to bridge that gap. Each Solidity concept - state variables, functions, modifiers, events - is represented as a block (to be made draggable in a future commit). You can snap them together, fill in the fields, and the app generates the corresponding Solidity code on the right. The goal is not to replace writing code, but to make the structure of a contract more intuitive before writing one yourself.

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Copernicium282/solidity.build.git
cd solidity.build
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Block Types

The following block types are planned to be implemented (for now):

| Block | Description |
|---|---|
| Contract | Root block, everything else nests inside it. This generates the contract declaration and pragma. |
| State Variable | Typed storage variable with configurable visibility. Supports `uint256`, `address`, `bool`, `string`. |
| Mapping | Key-value storage. Configurable key type, value type, and visibility. |
| Constructor | Initializer function. Supports dynamic parameter rows. |
| Function | Configurable visibility, mutability, parameters, and return type. |
| Modifier | Named access control modifier. Attaches to function blocks. |
| Event | Typed event declaration with indexed parameter support. |
| Emit | Event emission inside a function. References defined events. |

Generated code is valid Solidity `^0.8.0`.

## Local Deployment

solidity.build compiles contracts in the browser using [solc-js](https://github.com/ethereum/solc-js) and deploys to a local Hardhat node via ethers.js. All purely Client-Side.

To set up a local node:

```bash
npm install --save-dev hardhat
npx hardhat init
npx hardhat node
```

This starts a local Ethereum node at `http://127.0.0.1:8545` with funded test accounts. Click **Deploy** in the app and it connects automatically. After deployment, you can call contract functions directly from the UI using the generated ABI.

Testnet deployment (Sepolia) is planned for a future release.

## Tech Stack

- **React + Vite** — frontend framework and build tool
- **@dnd-kit/core** — drag and drop
- **Monaco Editor** — live Solidity code preview
- **solc-js** — in-browser Solidity compilation, no backend required
- **ethers.js v6** — local deployment and contract interaction
- **Tailwind CSS** — styling
- **localStorage** — contract persistence

## Project Structure

```
src/
  blocks/        individual block components
  components/    canvas, palette, code panel, deploy panel
  hooks/         useCodeGenerator, useCompiler, useDeployer, useContractStorage
  context/       BlockTreeContext, DeployContext
  utils/         code templates, block registry, validators
  pages/         BuilderPage, ExamplesPage
```

The block tree is used for Solidity generation for the `useCodeGenerator` function, which maps the entire tree to a code string, which is used for Compilation and Deployment.

## Roadmap (also to be extended in the future)

- [ ] Visual block editor with drag and drop
- [X] Live Solidity code generation
- [ ] In-browser compilation via solc-js
- [ ] Local Hardhat deployment and function calling
- [ ] Function body blocks (assignments, conditionals, loops)
- [ ] Inheritance support
- [ ] Testnet deployment (Sepolia)
- [ ] Shareable contracts via URL encoding
- [ ] OpenZeppelin block templates
- [ ] Backend persistence (Node.js + PostgreSQL)

Note: the current roadmap kinda doesn't make that much sense, it's just a list of features I want to add. I'm currently using the Solidity By Example code as a roadmap, implementing stuff that can generate the code for each example atleast.

## Contributing

Contributions are welcome. If you find a bug or want to propose a feature, please feel free open an issue, as this is my first major React project and I'm sure there are many things I haven't thought of.

## License

MIT © [Copernicium282](https://github.com/Copernicium282)

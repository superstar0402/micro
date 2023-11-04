# NFTfi Credit Score

NFTfi Credit Score is a protocol for determining a wallet's creditworthiness for acting as a
borrower in NFT loans. This worthiness is expressed in a numerical value, the NFTfi Credit Score.

# Overview

## Problem

Currently, creditworthiness in the NFT loans market is opaque. Users and protocols alike have very
little visibility over a borrower's credit history, which makes it difficult to ascertain their
likelihood of default. This opaqueness make it difficult to negotiate terms in a transparent way,
since lenders don't know much about the borrower's profile. We aim to change that, by giving
borrowers to possibility to show lenders their onchain NFTfi Credit Score.

## Solution

The NFTfi Credit Score gives a wallet a numerical credit score, which enables its owner to leverage
their credit history to better negotiate NFT loan terms. This Score is given in the form of a
Zero-Knowledge Proof (ZKP) that the wallet owner can create, for lenders to later verify. The use of
ZKPs enable users to keep their scores private from the general public, so they may preserve their
privacy.

## Calculation method

We aim to take into account a wallet's past history of interacting with all NFTfi protocols across
the chosen chains. Due to resource constraints, this project takes only one protocol into
consideration, NFTfi. In our calculations, we consider key signals as positive / negative indicators
of a user's creditworthiness. Successful loans are seen as positive signals, and defaults are seen
as negative signals. Lending activity, namely lending offers and loans where the user acted as the
lender, are also seen as a positive signals, as they indicate an active, credible user in the
lending space. NFTfi Credit Score uses the following formula to assess a wallet's credit score:

## How It Works

- Borrower visits our website, where they connect their wallet and emit a ZKP of their credit score.
- Lender visits our website to verify the borrower's ZKP, thus confirming their claim to better loan
  terms.

## Future Protocol Expansion

This protocol has a lot of potential for modularity and expansion, namely in terms of accessibility
and functionality. In terms of accessibility, we aim to enable the borrower to mint an NFT with
their score, as well as create a widget / API that enables protocols to easily display someone's
credit score to other users, should they wish to. In terms of functionality, we aim to expand the
protocol in a way that users can complement their onchain NFTfi Credit Score with their real-life
credit score, as well as with their DeFi credit score. This will strengthen their case for
negotiating better loan terms and make the transaction as transparent and data-backed as possible,
while still preserving the borrower's privacy.

# Technical details

## Privacy

The program uses Zero Knowledge technology to hide the credit score. NFT lenders can query our
service for whether a certain address has a credit score above certain number or not - they can't
find out the exact score.

The ZK language used is Noir from Aztec. The project includes a Noir circuit, an autogenerated
Solidity verifier and interaction through the website.

## Environments

This Noir verifier contract is accessible in the Polygon ZkEVM testnet, at address
0xe9D7E3FCa12fEcC54167Fb9DD2EE7c52ca404fB8 . For faster testing, local Hardhat deployment is
recommended.

## Installation

1. Install [yarn](https://yarnpkg.com/) (tested on yarn v1.22.19)

2. Install [Node.js ≥v18](https://nodejs.org/en) (tested on v18.17.0)

3. Install [noirup](https://noir-lang.org/getting_started/nargo_installation/#option-1-noirup) with

   ```bash
   curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
   ```

4. Install Nargo v0.17.0 with

   ```bash
   noirup -v 0.17.0
   ```

If you had a lower version of `nargo` installed previously and are running into errors when
compiling, you may need to uninstall it, instructions
[here](https://noir-lang.org/getting_started/nargo_installation#uninstalling-nargo).

5. Install dependencies with

   ```bash
   npm i
   ```

## Test locally

1. Copy `next-hardhat/.env.example` to a new file `next-hardhat/.env`.

2. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

3. Run the unit tests with

   ```bash
   npx hardhat test
   ```

## Deploy locally

1. Copy `next-hardhat/.env.example` to a new file `next-hardhat/.env`.

2. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

3. Build the project and deploy contracts to the local development chain with

   ```bash
   NETWORK=localhost npm run dev
   ```

4. Once your contracts are deployed and the build is finished, start the web app with

   ```bash
   npm run start
   ```

## Deploy on real networks

### Neon EVM

To deploy on Neon EVM:

1. Fill in the value NEON_DEPLOYER_PRIVATE_KEY in .env
1. Get testnet tokens for deployment: https://neonfaucet.org/
1. Run `npm run deployNeon`
1. Check the deployed address ("verifier")
1. To verify the contract: `npx hardhat verify 0x12 --network neon` where you replace 0x12 with the
   contract address

An instance of the contract has been deployed and verified at
https://devnet.neonscan.org/address/0xBbC1E1B6595aaaa515f169959a165542Ad545A1a#contract

### Polygon zkEVM

To deploy on Polygon Zk-EVM:

1. Fill in the value POLYGONZK_DEPLOYER_PRIVATE_KEY in .env
1. Get testnet Eth (Polygon zkEVM) https://faucet.polygon.technology/
1. Run `NETWORK=polygonzk npm run deploy`

An instance of the contract has been deployed at
https://testnet-zkevm.polygonscan.com/address/0xcCC57c20D29E777308FB61728432C675Bc3A09E1 .
Unfortunately, contract verification is not supported for that network in Hardhat.

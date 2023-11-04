# #NFTfi Credit Score# # 
NFTfi Credit Score is a protocol for determining a wallet's creditworthiness for acting as a borrower in NFT loans. This worthiness is expressed in a numerical value, the NFTfi Credit Score.

# Problem #
Currently, creditworthiness in the NFT loans market is opaque. Users and protocols alike have very little visibility over a borrower's credit history, which makes it difficult to ascertain their likelihood of default. This opaqueness make it difficult to negotiate terms in a transparent way, since lenders don't know much about the borrower's profile. We aim to change that, by giving borrowers to possibility to show lenders their onchain NFTfi Credit Score.

# Solution #
The NFTfi Credit Score gives a wallet a numerical credit score, which enables its owner to leverage their credit history to better negotiate NFT loan terms. This Score is given in the form of a Zero-Knowledge Proof (ZKP) that the wallet owner can create, for lenders to later verify. The use of ZKPs enable users to keep their scores private from the general public, so they may preserve their privacy.

# Calculation method #
We aim to take into account a wallet's past history of interacting with all NFTfi protocols across the chosen chains. Due to resource constraints, this project takes only one protocol into consideration, NFTfi. In our calculations, we consider key signals as positive / negative indicators of  a user's creditworthiness. Successful loans are seen as positive  signals, and defaults are seen as negative signals. Lending activity, namely lending offers and loans where the user acted as the lender, are also seen as a positive signals, as they indicate an active, credible user in the lending space. NFTfi Credit Score uses the following formula to assess a wallet's credit score:

# How It Works #
- Borrower visits our website, where they connect their wallet and emit a ZKP of their credit score.
- Lender visits our website to verify the borrower's ZKP, thus confirming their claim to better loan terms.

# Future Protocol Expansion #
This protocol has a lot of potential for modularity and expansion, namely in terms of accessibility and functionality. In terms of accessibility, we aim to enable the borrower to mint an NFT with their score, as well as create a widget / API that enables protocols to easily display someone's credit score to other users, should they wish to. In terms of functionality, we aim to expand the protocol in a way that users can complement their onchain NFTfi Credit Score with their real-life credit score, as well as with their DeFi credit score. This will strengthen their case for negotiating better loan terms and make the transaction as transparent and data-backed as possible, while still preserving the borrower's privacy.

# Noir with Next and Hardhat

[![Netlify Status](https://api.netlify.com/api/v1/badges/e4bd1ebc-6be1-4ed2-8be8-18f70382ae22/deploy-status)](https://app.netlify.com/sites/noir-next-hardhat/deploys)

This example uses [Next.js](https://nextjs.org/) as the frontend framework, and
[Hardhat](https://hardhat.org/) to deploy and test.

It also features multiple files and different entry points by resolving multiple files and using the
`entry_point` parameter to the `compile` function.

## Getting Started

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
   yarn
   ```

6. Navigate to the circuits directory with

   ```bash
   cd circuits
   ```

7. Write your Noir program in `./circuits/src`.

   > **Note:** You can read more about writing Noir programs in the
   > [Noir docs](https://noir-lang.org/).

8. Generate the verifier contract with

   ```bash
   nargo codegen-verifier
   ```

9. Compile your Noir program with

   ```bash
   nargo compile
   ```

10. Navigate back into the _next-hardhat_ directory with

    ```bash
    cd ..
    ```

## Test locally

1. Copy `next-hardhat/.env.example` to a new file `next-hardhat/.env`.

2. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

   or if foundry is preferred, with

   ```bash
   anvil
   ```

3. Run the [example test file](./test/index.test.ts) with

   ```bash
   yarn test
   ```

The test demonstrates basic usage of Noir in a TypeScript Node.js environment.

## Deploy locally

1. Copy `next-hardhat/.env.example` to a new file `next-hardhat/.env`.

2. Start a local development EVM at <http://localhost:8545> with

   ```bash
   npx hardhat node
   ```

   or if foundry is preferred, with

   ```bash
   anvil
   ```

3. Build the project and deploy contracts to the local development chain with

   ```bash
   NETWORK=localhost yarn build
   ```

   > **Note:** If the deployment fails, try removing `yarn.lock` and reinstalling dependencies with
   > `yarn`.

4. Once your contracts are deployed and the build is finished, start the web app with

   ```bash
   yarn start
   ```

## Deploy on networks

You can choose any other network in `hardhat.config.ts` and deploy there using this `NETWORK`
environment variable.

For example, `NETWORK=mumbai yarn build` or `NETWORK=sepolia yarn build`.

Make sure you:

- Update the deployer private keys in `next-hardhat/.env`
- Have funds in the deployer account
- Add keys for alchemy (to act as a node) in `next-hardhat/.env`

Feel free to contribute with other networks in `hardhat.config.ts`

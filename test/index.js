import { expect } from 'chai';
import hre from 'hardhat';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';

import { compile } from '@noir-lang/noir_wasm';
import path from 'path';

const getCircuit = async name => {
  const compiled = await compile(path.resolve('circuits', 'src', `${name}.nr`));
  return compiled;
};

describe('It compiles noir program code, receiving circuit bytes and abi object.', () => {
  let noir;
  let correctProof;

  before(async () => {
    const circuit = await getCircuit('main');
    const verifierContract = await hre.ethers.deployContract('UltraVerifier');

    const verifierAddr = await verifierContract.deployed();
    console.log(`Verifier deployed to ${verifierAddr.address}`);

    const backend = new BarretenbergBackend(circuit);
    noir = new Noir(circuit, backend);
  });

  // address : pub Field, level : pub Field, rating : Field

  it('Should generate valid proof for correct input', async () => {
    const input = { address: 1, level: 700, rating: 750 };
    // Generate proof
    correctProof = await noir.generateFinalProof(input);
    expect(correctProof.proof instanceof Uint8Array).to.be.true;
  });

  it('Should verify valid proof for correct input', async () => {
    const verification = await noir.verifyFinalProof(correctProof);
    expect(verification).to.be.true;
  });

  it('Should fail to generate valid proof for incorrect input', async () => {
    try {
      const input = { address: 1, level: 400, rating: 300 };
      const incorrectProof = await noir.generateFinalProof(input);
    } catch (err) {
      // TODO(Ze): Not sure how detailed we want this test to be
      expect(err instanceof Error).to.be.true;
      const error = err;
      expect(error.message).to.contain('Cannot satisfy constraint');
    }
  });
});

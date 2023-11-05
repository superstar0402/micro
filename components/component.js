import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import React from 'react';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import newCompiler, { compile } from '@noir-lang/noir_wasm';
import { initializeResolver } from '@noir-lang/source-resolver';
import axios from 'axios';
import { getScore } from '../scripts/getScore';

import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';

const projectId = '490f5afe44cba86390a0ee147b7e9c48';

const localhost = {
  chainId: 1337,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'http://127.0.0.1:8545',
};

const metadata = {
  name: 'Trust Scale',
  description: 'Credit score data based on NFT lending activity',
  url: 'https://localhost',
  icons: ['https://avatars.mywebsite.com/'],
};

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [localhost],
  projectId,
});

async function getCircuit(name) {
  await newCompiler();
  const { data: noirSource } = await axios.get('/api/readCircuitFile?filename=' + name);

  initializeResolver(id => {
    const source = noirSource;
    return source;
  });

  const compiled = compile('main');
  return compiled;
}

function Component() {
  const [input, setInput] = useState({ x: 0, y: 0 });
  const [proof, setProof] = useState();
  const [inputProof, setInputProof] = useState();
  const [level, setLevel] = useState();
  const [noir, setNoir] = useState(null);
  const [backend, setBackend] = useState(null);
  const [click, setClick] = useState(null);
  const [click2, setClick2] = useState(null);
  const [click3, setClick3] = useState(null);

  function numberToPaddedUint8Array(num) {
    // Create a 32-byte buffer filled with zeros
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer);

    // Calculate how many bytes are needed to represent the number
    let numberOfBytes = Math.ceil(Math.log2(num + 1) / 8);
    numberOfBytes = numberOfBytes === 0 ? 1 : numberOfBytes; // At least one byte if num is 0

    // Set the number in the DataView, starting from the end
    for (let i = 0; i < numberOfBytes; i++) {
      // Get the right-most byte from the number
      const byte = (num >> (i * 8)) & 0xff;
      // Set the byte in the DataView from the end
      view.setUint8(31 - i, byte);
    }

    // Convert to Uint8Array
    return new Uint8Array(buffer);
  }

  const getLevel = rating => {
    let a = Math.floor(rating / 100);
    return a * 100;
  };

  function uint8ArrayToHex(uint8Array) {
    // Convert the Uint8Array to a hex string
    const hexString = Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hexString;
  }

  // Verifier the proof if there's one in state
  useEffect(() => {
    if (proof) {
      //verifyProof();

      return () => {
        // TODO: Backend should be destroyed by Noir JS so we don't have to
        // store backend in state
        backend.destroy();
      };
    }
  }, [proof]);

  const initNoir = async () => {
    const circuit = await getCircuit('main');

    const backend = new BarretenbergBackend(circuit, { threads: 8 });
    setBackend(backend);
    const noir = new Noir(circuit, backend);
    await toast.promise(noir.init(), {
      pending: 'Initializing proving system...',
      success: 'Proving system initialized!',
      error: 'Error initializing proving system',
    });
    setNoir(noir);
  };

  useEffect(() => {
    initNoir();
  }, []);

  // Calculates proof
  const getCreditScore = async () => {
    const calc = new Promise(async (resolve, reject) => {
      let useAddress = 1;
      let rating = getScore(useAddress);
      let level = getLevel(rating);

      let privateInput = { address: useAddress, level: level, rating: rating };
      const { proof, publicInputs } = await noir.generateFinalProof(privateInput);
      setClick(true);
      //console.log('Proof created: ', proof);
      let hex = uint8ArrayToHex(proof);
      console.log('proof hex', hex);

      setProof({ proof, publicInputs });

      resolve(proof);
    });
    toast.promise(calc, {
      pending: 'Calculating proof...',
      success: 'Proof calculated!',
      error: 'Error calculating proof',
    });
  };

  const verifyInputScore = async () => {
    setClick2(true);
    let addressArr = numberToPaddedUint8Array(1);
    //let levelArr = numberToPaddedUint8Array(level);
    let levelArr = numberToPaddedUint8Array(700);
    let publicInput = [addressArr, levelArr];

    //console.log('starting verify', publicInput);
    const verification = await noir.verifyFinalProof({
      proof: proof.proof, //hexToUint8Array(proofHex),
      publicInputs: publicInput,
    });

    console.log('Manual verification', verification);
  };

  const checkAddressScore = async () => {
    toast('Verifying user score', {
      type: 'success',
    });
    setTimeout(function () {
      setClick3(true);
    }, 2000);
  };

  return (
    <div className="container">
      <div
        style={{
          position: 'relative',
          backgroundColor: '#10151a',
          width: '100%',
          height: '89rem',
          overflow: 'hidden',
          textAlign: 'left',
          fontSize: '1.76rem',
          color: '#fff',
          fontFamily: "'Proza Libre'",
        }}
      >
        HELLO
        <div
          style={{
            position: 'absolute',
            top: '0rem',
            left: '0rem',
            width: '120rem',
            height: '64.63rem',
          }}
        >
          <img
            style={{
              position: 'absolute',
              top: '0rem',
              left: '0rem',
              width: '133.19rem',
              height: '61.31rem',
              objectFit: 'cover',
            }}
            alt=""
            src="/bg-stars@2x.png"
          />
          <div
            style={{
              position: 'absolute',
              top: '44.13rem',
              left: '0rem',
              background: 'linear-gradient(180deg, rgba(16, 21, 26, 0), #10151a)',
              width: '120rem',
              height: '20.5rem',
            }}
          />
          <b
            style={{
              position: 'absolute',
              top: '2.19rem',
              left: '22.07rem',
              letterSpacing: '0.51px',
              lineHeight: '3.52rem',
              display: 'inline-block',
              width: '20.25rem',
              height: '3.5rem',
            }}
          >
            Trust Scale
          </b>
          <img
            style={{
              position: 'absolute',
              top: '1.63rem',
              left: '17.63rem',
              width: '3.73rem',
              height: '3.73rem',
            }}
            alt=""
            src="/logo-full.svg"
          />
          <a href="https://github.com/microbecode/ethlisbon">
            <div
              style={{
                position: 'absolute',
                top: 'calc(50% - 472px)',
                right: '15.5rem',
                borderRadius: '8px',
                backgroundColor: '#262e37',
                width: '8rem',
                height: '2.5rem',
                fontSize: '1rem',
              }}
            >
              <img
                style={{
                  position: 'absolute',
                  top: '0.38rem',
                  left: '0.75rem',
                  width: '1.28rem',
                  height: '1.5rem',
                  objectFit: 'cover',
                }}
                alt=""
                src="/github@2x.png"
              />

              <b
                style={{
                  position: 'absolute',
                  top: 'calc(50% - 14px)',
                  left: '2.75rem',
                  lineHeight: '1.75rem',
                  color: 'white',
                }}
              >
                Github
              </b>
            </div>
          </a>
          <div
            style={{
              position: 'absolute',
              top: '46.81rem',
              left: '33.38rem',
              width: '53.31rem',
              height: '7.56rem',
            }}
          >
            <div
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: '0rem',
                right: '0rem',
                bottom: '0rem',
                left: '0rem',
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div>
                {click && !click2 && !click3 ? (
                  <p
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    This wallet is in the top 30% best rated NFT borrowers
                  </p>
                ) : (
                  <>
                    {click2 && !click3 ? (
                      <div>
                        <input
                          type="text"
                          defaultValue=""
                          placeholder="Enter wallet address"
                          style={{
                            width: '500px',
                            lineHeight: '2.25rem',
                          }}
                        ></input>
                        <div
                          style={{
                            borderRadius: '16px',
                            boxShadow: '0px 9px 44px rgba(255, 214, 0, 0.19)',
                            border: '3px solid #ffd600',
                            boxSizing: 'border-box',
                            width: '14.81rem',
                            height: '4.25rem',
                            color: '#ffd600',
                            marginTop: '30px',
                          }}
                        >
                          <b
                            style={{
                              position: 'absolute',
                              top: 'calc(50% + 25px)',
                              left: '70px',
                              lineHeight: '2.25rem',
                            }}
                            onClick={checkAddressScore}
                          >
                            Verify
                          </b>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {click3 ? (
                          <p
                            style={{
                              textAlign: 'center',
                            }}
                          >
                            This wallet is in the top 20% best rated NFT borrowers
                          </p>
                        ) : (
                          ''
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '55.81rem',
            left: '33.31rem',
            width: '53.31rem',
            height: '21.69rem',
            fontSize: '2.25rem',
            color: '#ffd600',
          }}
        >
          <div
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              top: '0rem',
              right: '0rem',
              bottom: '0rem',
              left: '0rem',
              borderRadius: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
            }}
          />
          <b
            style={{
              position: 'absolute',
              top: '4.69rem',
              left: '10.81rem',
              lineHeight: '2.25rem',
              display: 'inline-block',
              width: '31.63rem',
              height: '2.88rem',
            }}
          >
            NFT lending, supercharged
          </b>
          <div
            style={{
              position: 'absolute',
              top: '9.5rem',
              left: '3.31rem',
              width: '46.63rem',
              height: '7.5rem',
              fontSize: '1.25rem',
              color: '#fff',
              fontFamily: "'PT Mono'",
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '0rem',
                left: '2.38rem',
                lineHeight: '2rem',
                display: 'inline-block',
                width: '36.31rem',
              }}
            >
              Get better terms on your NFT loans.
            </div>
            <div
              style={{
                position: 'absolute',
                top: '0.25rem',
                left: '0rem',
                borderRadius: '50%',
                backgroundColor: '#c465ff',
                width: '1.5rem',
                height: '1.5rem',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '2.75rem',
                left: '2.38rem',
                lineHeight: '2rem',
                display: 'inline-block',
                width: '41.88rem',
              }}
            >
              Zero-Knowledge scoring means your privacy is preserved.
            </div>
            <div
              style={{
                position: 'absolute',
                top: '3rem',
                left: '0rem',
                borderRadius: '50%',
                backgroundColor: '#c465ff',
                width: '1.5rem',
                height: '1.5rem',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '5.5rem',
                left: '2.38rem',
                lineHeight: '2rem',
                display: 'inline-block',
                width: '44.25rem',
              }}
            >
              Complement your on-chain score with your off-chain score.
            </div>
            <div
              style={{
                position: 'absolute',
                top: '5.75rem',
                left: '0rem',
                borderRadius: '50%',
                backgroundColor: '#c465ff',
                width: '1.5rem',
                height: '1.5rem',
              }}
            />
          </div>
        </div>
        <img
          style={{
            position: 'absolute',
            top: '81.5rem',
            left: 'calc(50% - 960px)',
            width: '119.94rem',
            height: '7.5rem',
          }}
          alt=""
          src="/footer.svg"
        />
        <div
          style={{
            position: 'absolute',
            top: '18rem',
            left: '23.38rem',
            width: '73.25rem',
            height: '26.25rem',
            textAlign: 'center',
            fontSize: '1.25rem',
          }}
        >
          <img
            style={{
              position: 'absolute',
              height: '8.1%',
              width: '32.94%',
              top: '29.05%',
              right: '32.68%',
              bottom: '62.86%',
              left: '34.39%',
              maxWidth: '100%',
              overflow: 'hidden',
              maxHeight: '100%',
            }}
            alt=""
            src="/underline-1.svg"
          />
          <div
            style={{
              position: 'absolute',
              top: '22rem',
              left: 'calc(50% - 257px)',
              borderRadius: '16px',
              background: 'linear-gradient(180deg, #ffd600, #ffb800)',
              boxShadow: '0px 9px 44px rgba(255, 214, 0, 0.19)',
              width: '15.44rem',
              height: '4.25rem',
              color: '#10151a',
            }}
          >
            <b
              style={{
                position: 'absolute',
                top: 'calc(50% - 18px)',
                left: 'calc(50% - 100.5px)',
                lineHeight: '2.25rem',
              }}
              onClick={getCreditScore}
            >
              Get My Credit Score
            </b>
          </div>
          <div
            style={{
              position: 'absolute',
              top: '22rem',
              left: 'calc(50% + 20px)',
              borderRadius: '16px',
              boxShadow: '0px 9px 44px rgba(255, 214, 0, 0.19)',
              border: '3px solid #ffd600',
              boxSizing: 'border-box',
              width: '14.81rem',
              height: '4.25rem',
              color: '#ffd600',
            }}
          >
            <b
              style={{
                position: 'absolute',
                top: 'calc(50% - 18px)',
                left: 'calc(50% - 95.5px)',
                lineHeight: '2.25rem',
              }}
              onClick={verifyInputScore}
            >
              Verify Credit Score
            </b>
          </div>
          <div
            style={{
              position: 'absolute',
              top: '12rem',
              left: 'calc(50% - 361px)',
              fontSize: '1.5rem',
              lineHeight: '2.5rem',
              fontFamily: "'PT Mono'",
              display: 'inline-block',
              width: '45.19rem',
              opacity: '0.8',
            }}
          >
            Get better NFT loan terms by showing lenders your on-chain NFTfi credit score.
          </div>
          <div
            style={{
              position: 'absolute',
              top: '0rem',
              left: 'calc(50% - 453px)',
              width: '56.69rem',
              height: '10rem',
              fontSize: '4.5rem',
            }}
          >
            <b
              style={{
                position: 'absolute',
                top: '-0.5rem',
                left: '-3.44rem',
                lineHeight: '5rem',
                display: 'inline-block',
                width: '63.5rem',
                textShadow: '0px 4px 18px rgba(0, 0, 0, 0.3)',
              }}
            >
              On-chain credit scoring for NFT loans
            </b>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: '0rem',
            left: '24.38rem',
            width: '71.25rem',
            height: '8rem',
            fontSize: '1rem',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 'calc(50% - 20px)',
              right: '0rem',
              borderRadius: '8px',
              backgroundColor: '#262e37',
              width: '8rem',
              height: '2.5rem',
            }}
          >
            <b
              style={{
                position: 'absolute',
                top: 'calc(50% - 14px)',
                left: '2.75rem',
                lineHeight: '1.75rem',
              }}
            >
              Twitter
            </b>
            <img
              style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.75rem',
                width: '1.5rem',
                height: '1.5rem',
                overflow: 'hidden',
              }}
              alt=""
              src="/icons8twitter-1.svg"
            />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 'calc(50% - 18px)',
              right: '12.5rem',
              width: '20.88rem',
              height: '2.25rem',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(50% - 20px)',
              left: '0rem',
              width: '13.25rem',
              height: '2.5rem',
              overflow: 'hidden',
            }}
          />
        </div>
        <w3m-button />
      </div>
    </div>
  );
}

export default Component;

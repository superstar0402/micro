import { useState, useEffect, SetStateAction } from 'react';

import { toast } from 'react-toastify';
//import Ethers from '../utils/ethers';
import React from 'react';

import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { CompiledCircuit, ProofData } from '@noir-lang/types';
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
  name: 'My Website',
  description: 'My Website description',
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

  // Handles input state
  const handleChange = e => {
    e.preventDefault();
    setInput({ ...input, [e.target.name]: e.target.value });
  };

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

  // Calculates proof
  const calculateProof = async () => {
    const calc = new Promise(async (resolve, reject) => {
      let useAddress = 1;
      let rating = getScore(useAddress);
      let level = getLevel(rating);

      setClick(true);

      let privateInput = { address: useAddress, level: level, rating: rating };
      const { proof, publicInputs } = await noir.generateFinalProof(privateInput);
      //console.log('Proof created: ', proof);
      let hex = uint8ArrayToHex(proof);
      console.log('proof hex', hex);
      /*       console.log('public inputs', publicInputs);
      console.log('private inputs', privateInput); */
      /* const bytes = Array.from(proof)
        .map(a => a.toString(16))
        .reduce((prev, curr) => prev + curr); */
      //console.log('Proof bytes', bytes);
      //console.log("Proof for", inputs)
      //console.log('Proof hex', Buffer.from(proof).toString('hex'));

      setProof({ proof, publicInputs });

      resolve(proof);
    });
    toast.promise(calc, {
      pending: 'Calculating proof...',
      success: 'Proof calculated!',
      error: 'Error calculating proof',
    });
  };

  function uint8ArrayToHex(uint8Array) {
    // Convert the Uint8Array to a hex string
    const hexString = Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return hexString;
  }

  function hexToUint8Array(hexString) {
    if (!hexString) {
      return new Uint8Array();
    }
    // Validate hex string
    if (hexString.length % 2 !== 0) {
      throw 'Invalid hexString';
    }

    // Convert the hex string to a Uint8Array
    const uint8Array = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    return uint8Array;
  }

  const verifyProof = async () => {
    const verifyOffChain = new Promise(async (resolve, reject) => {
      if (proof) {
        let proofHex =
          '0e5ce5f490cd7dc548da17db56ec9615591aab0956f9e0fdf75a4c44b0ae0e261f93a012794c21368a57c3ee101eaf6c857fa20fa04982e035aa5378726ea2022b54ae96798e8af888d54419273666ddac9b10c18b8f8483569d253bcc8bb91d1757822fe48a7d7b4a815af2c422f0a3290041a54d7e3ccd16927a2a5f42bc2d236f13e730db5dfaab489a83ff1b53e33dd9d6b3cc44797c9b5daafa80ae49e212e9944dc28fba3ee2dd0acb37c5502a8cb3fe76d5dae157030223258fb24b86011f8137c5915a0cbaf158bdf23f94d0e7b43be57b9da1abc3968dfde648097d0b3715fcb6f4fcc9f0304ba81617a7f1921995703af5ed1ff0569168166a099b033b36c5317ec8d037bff9ac06d09a4a854523a7fad1657aea9fa830fb27d5450295361831b9b9793b9ce49ec3677bd1c86fbdcfb4fe608101a70ddbc36880540aa5655f2bf270c1ee83e6da7a3b369353a46a84ccf71b1022219b0189285da81e65061206745b91087412b36385d3b95aeff7647de443910025e818976acbf9165de83314905f059e7ce9434208b331865d2af7efeaaa14d09507208500584a0d093a31921a45dc9e76a63e9d37505b2cb035a479ae50ef60df02df72408c2823e2d34f1919daf47cb83bae911f8f40b7a168f6efd5b814c2c50307ed4258ed219eca3fed8a5a324a55798c3a301b20fa6d67187337da95b3ff9a10fb2c1de4137e40e0f71c49dea996507e32bd6917922800e5fa0c9f30abfa1a8384d3d9782817396ffb1c37dc72ffa9f87717b697b04af053f9bbaf4fc1202fb61f5b4faf170a053e63816c5b6513bde613fa56bcdf00fbad5ad74ed47b7df80c70ab91320f6318e06272693b09021cacaf753126d6730b3ec77c6cfe4cf69f2e252b8a1e234f1d1cada7844f10f5f7d1dc3f5f16ba6ad2a5b8ae911c0e4767738e81ad830aa2a817da879b828d4e666b53c0042494b426ab782170e5d4e28e71ff094b4f0487648439179d4360b984394c09493ce8682be02e03a7dfa3b9f30beec142222c8c1a2962b735e5617ed9aca02226fe5bc23f4d9da97f3b49c834d82ecedc622935cde1789030173b408a690c9b2b3eae102695dba8a3182ef1beab8c7f04261be4ba958d0459e2ea74cd7a9184421ef879045e2e0e99d1ea5399b0be202d1c0afe4149399319e266150bcbe073bb87135f1f027677dbe69e65002ae31f55a8130a0fe9bab23823ba58c6f92bf139e58c304ddc8c4f316ef0a88ffea676e9aa2ed4dab4badb1af21d1172466e169a844a199f0202e75b988ef39520f089861c04ae3a29fbf183570e8a6727e60d9da57485a106a1e3ef9f17de0f9eba27b7fb2056f445bc2f7e597aaf25be0cfa1c57d7ff834c61adbb7f6f6a206b6c0d820f03e2981f3b181740f988c4c1b34751181ab36def9eaca6f955da45f2f0fbe9b50625b8945fdc04c7672d6c527b9e6ba2a9ccb3fb0de0514c8271af705d3740c21b7012f15ccbe91471fb5477db594efaaa6a69780ea3bef0ffcb564f4b04b37d27fdca6be871ef0096dad5fcef43c66d0bc916d340c42b93b88f0cab219af9290738a91bec42ff32f5e25fedcb2c1aab7f74ae5b356565b0db7e1945a693a9da20cd9b67d21ea64a002e7408a5498348bf54bb8afe428f64cc59b5a30459b1bc295bd9550b007bc22b3a9dcac5b1e6d3ba87749e670200aa595181bb188bb49e1dd2d754a4b71b3b9d42d0f9ccefe305172fded0bba7f7a94c9d772ccb45e52119544bf5bf963dcd34ba7616f2bd2ef36b7bc0bb5a826c3f07f33eebc169bc1a2c78459ce1a592b80eca765890a7be3463acd9818ecb8064a0c735ee10932615145102f7fed7d61f6c87ae4bffd86d5ef2609b2529abcc177ec9c7f2dd62796b2164823ed08d2e31a4e50fa9161eccd29de2fb5a33eb3c515b25b739c842162b06c0d353d8245a2e81533757db6bdb67d080b33564f3e5a73335621030ba46272b9c1fc6530c99d1ababb03d642b2ff6555d05b033534d376a634d15d37476ab20131dc5ecc3394b1db3e36c6b692c27b2056fe287f944365daf4287862ea72e148a1bc58679d8c48fbc169b72a728590eadda14dc9f3b3550fb37f938e8d7b11249d5543e6dbab50f4b0428d42ddf3673d84903104deea83fe96c9e7e0015a42080e58658eb387024b2a97e0a03a7b948502790ec44b3a39005dc88c81b707d216261289c65f44f5c0df64b6e0fdc30958cfe8ecaf79b3a4694d8fcf996eab304ddfbbb7ca5394921b4e40ed21af4c3918ddf691a6a8e9535a41e9e6f94f719172dad6ce954b4296a32f5a045188ce5ac382ae569bcdd12ed9a03825c633a09013a54b8c06e3a9379ab441de9fb9124c8007f05aa11dd81acb66d74db83483a175f201aa93d3293948ea8f08889894e8df900d88c5144ca0c7f89b909f22a61264bbb54a795c04eba07249208b49b6d4a5996cd971f5bc977d5b7ff646ae88220883c8bdf37387d02a01322d7bfcf7510d30f3dc7eed9ff8c2addd8d032f6b81c03fc9900453c4228f91f5072b78f1c19b81da7fdef3ab61ade27c053aa5d6427b1ca52541e1939567026d5f055eae614af8bdddce1e5d74d26cde6fd746f7917656ff18fd62220c50f26f0f6c8bd4c861733ae4796548c0e8bb833a844b4c12b1caf75e692af895376995876a4f01a5bfa7b45b4df58a8f3fcd1cc41b1376c1e92f9441963b37187a5b98daab23bfd80e8b81e06097a869c5be6c14c7ffc0a120943124c34b759bbd4d9c2debf87e0a5d6f4f657339c6444bafbb6574ec0a8057f8ce07f05bb41f003f9f812ccd3c3cac531cea85dbe41ed1a10ab621d85460399c44cc1800848a1183a974eac1df782c16de06e797106b6bd277b3afa6c0b259b985d4497ac0e105065bcff028e4cc3302be01451beb23f40a2f6ecc88cd311ab1efa5cbcc8957e43dfa315ec7f57a1dd653f6f50d4d2db936db013e47e170851e57cab14c047506d1d16f1f80d8c5aeff7d5286df4504a5fe1d301d61753';
        let myproof = hexToUint8Array(proofHex);

        //let publicInput = { address: 1, level: level };
        let addressArr = numberToUint8Array(1);
        let levelArr = numberToUint8Array(level);
        let publicInput = [addressArr, levelArr];
        //inputArray = new Uint8Array()

        const verification = await noir.verifyFinalProof({
          proof: myproof,
          publicInputs: publicInput,
        });
        console.log('Proof verified: ', verification);

        /* let crafted: ProofData = {
          publicInputs: proof.publicInputs,
        }; */

        const bytes = Array.from(proof.proof)
          .map(a => a.toString(16))
          .reduce((prev, curr) => prev + curr);

        let a = new Uint8Array(Buffer.from(bytes, 'base64'));
        console.log('A', a);

        resolve(verification);
      }
    });

    const verifyOnChain = new Promise(async (resolve, reject) => {
      if (!proof) return reject(new Error('No proof'));
      if (!window.ethereum) return reject(new Error('No ethereum provider'));
      try {
        const ethers = new Ethers();

        const verification = await ethers.contract.verify(proof.proof, [proof.publicInputs]);
        resolve(verification);
      } catch (err) {
        console.log(err);
        reject(new Error("Couldn't verify proof on-chain"));
      }
    });

    toast.promise(verifyOffChain, {
      pending: 'Verifying proof off-chain...',
      success: 'Proof verified off-chain!',
      error: 'Error verifying proof',
    });

    toast.promise(verifyOnChain, {
      pending: 'Verifying proof on-chain...',
      success: 'Proof verified on-chain!',
      error: {
        render({ data }) {
          return `Error: ${data.message}`;
        },
      },
    });
  };

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
      pending: 'Initializing Noir...',
      success: 'Noir initialized!',
      error: 'Error initializing Noir',
    });
    setNoir(noir);
  };

  useEffect(() => {
    initNoir();
  }, []);

  const verifyInputProof = async () => {
    //  let proofHex =
    //    '0e5ce5f490cd7dc548da17db56ec9615591aab0956f9e0fdf75a4c44b0ae0e261f93a012794c21368a57c3ee101eaf6c857fa20fa04982e035aa5378726ea2022b54ae96798e8af888d54419273666ddac9b10c18b8f8483569d253bcc8bb91d1757822fe48a7d7b4a815af2c422f0a3290041a54d7e3ccd16927a2a5f42bc2d236f13e730db5dfaab489a83ff1b53e33dd9d6b3cc44797c9b5daafa80ae49e212e9944dc28fba3ee2dd0acb37c5502a8cb3fe76d5dae157030223258fb24b86011f8137c5915a0cbaf158bdf23f94d0e7b43be57b9da1abc3968dfde648097d0b3715fcb6f4fcc9f0304ba81617a7f1921995703af5ed1ff0569168166a099b033b36c5317ec8d037bff9ac06d09a4a854523a7fad1657aea9fa830fb27d5450295361831b9b9793b9ce49ec3677bd1c86fbdcfb4fe608101a70ddbc36880540aa5655f2bf270c1ee83e6da7a3b369353a46a84ccf71b1022219b0189285da81e65061206745b91087412b36385d3b95aeff7647de443910025e818976acbf9165de83314905f059e7ce9434208b331865d2af7efeaaa14d09507208500584a0d093a31921a45dc9e76a63e9d37505b2cb035a479ae50ef60df02df72408c2823e2d34f1919daf47cb83bae911f8f40b7a168f6efd5b814c2c50307ed4258ed219eca3fed8a5a324a55798c3a301b20fa6d67187337da95b3ff9a10fb2c1de4137e40e0f71c49dea996507e32bd6917922800e5fa0c9f30abfa1a8384d3d9782817396ffb1c37dc72ffa9f87717b697b04af053f9bbaf4fc1202fb61f5b4faf170a053e63816c5b6513bde613fa56bcdf00fbad5ad74ed47b7df80c70ab91320f6318e06272693b09021cacaf753126d6730b3ec77c6cfe4cf69f2e252b8a1e234f1d1cada7844f10f5f7d1dc3f5f16ba6ad2a5b8ae911c0e4767738e81ad830aa2a817da879b828d4e666b53c0042494b426ab782170e5d4e28e71ff094b4f0487648439179d4360b984394c09493ce8682be02e03a7dfa3b9f30beec142222c8c1a2962b735e5617ed9aca02226fe5bc23f4d9da97f3b49c834d82ecedc622935cde1789030173b408a690c9b2b3eae102695dba8a3182ef1beab8c7f04261be4ba958d0459e2ea74cd7a9184421ef879045e2e0e99d1ea5399b0be202d1c0afe4149399319e266150bcbe073bb87135f1f027677dbe69e65002ae31f55a8130a0fe9bab23823ba58c6f92bf139e58c304ddc8c4f316ef0a88ffea676e9aa2ed4dab4badb1af21d1172466e169a844a199f0202e75b988ef39520f089861c04ae3a29fbf183570e8a6727e60d9da57485a106a1e3ef9f17de0f9eba27b7fb2056f445bc2f7e597aaf25be0cfa1c57d7ff834c61adbb7f6f6a206b6c0d820f03e2981f3b181740f988c4c1b34751181ab36def9eaca6f955da45f2f0fbe9b50625b8945fdc04c7672d6c527b9e6ba2a9ccb3fb0de0514c8271af705d3740c21b7012f15ccbe91471fb5477db594efaaa6a69780ea3bef0ffcb564f4b04b37d27fdca6be871ef0096dad5fcef43c66d0bc916d340c42b93b88f0cab219af9290738a91bec42ff32f5e25fedcb2c1aab7f74ae5b356565b0db7e1945a693a9da20cd9b67d21ea64a002e7408a5498348bf54bb8afe428f64cc59b5a30459b1bc295bd9550b007bc22b3a9dcac5b1e6d3ba87749e670200aa595181bb188bb49e1dd2d754a4b71b3b9d42d0f9ccefe305172fded0bba7f7a94c9d772ccb45e52119544bf5bf963dcd34ba7616f2bd2ef36b7bc0bb5a826c3f07f33eebc169bc1a2c78459ce1a592b80eca765890a7be3463acd9818ecb8064a0c735ee10932615145102f7fed7d61f6c87ae4bffd86d5ef2609b2529abcc177ec9c7f2dd62796b2164823ed08d2e31a4e50fa9161eccd29de2fb5a33eb3c515b25b739c842162b06c0d353d8245a2e81533757db6bdb67d080b33564f3e5a73335621030ba46272b9c1fc6530c99d1ababb03d642b2ff6555d05b033534d376a634d15d37476ab20131dc5ecc3394b1db3e36c6b692c27b2056fe287f944365daf4287862ea72e148a1bc58679d8c48fbc169b72a728590eadda14dc9f3b3550fb37f938e8d7b11249d5543e6dbab50f4b0428d42ddf3673d84903104deea83fe96c9e7e0015a42080e58658eb387024b2a97e0a03a7b948502790ec44b3a39005dc88c81b707d216261289c65f44f5c0df64b6e0fdc30958cfe8ecaf79b3a4694d8fcf996eab304ddfbbb7ca5394921b4e40ed21af4c3918ddf691a6a8e9535a41e9e6f94f719172dad6ce954b4296a32f5a045188ce5ac382ae569bcdd12ed9a03825c633a09013a54b8c06e3a9379ab441de9fb9124c8007f05aa11dd81acb66d74db83483a175f201aa93d3293948ea8f08889894e8df900d88c5144ca0c7f89b909f22a61264bbb54a795c04eba07249208b49b6d4a5996cd971f5bc977d5b7ff646ae88220883c8bdf37387d02a01322d7bfcf7510d30f3dc7eed9ff8c2addd8d032f6b81c03fc9900453c4228f91f5072b78f1c19b81da7fdef3ab61ade27c053aa5d6427b1ca52541e1939567026d5f055eae614af8bdddce1e5d74d26cde6fd746f7917656ff18fd62220c50f26f0f6c8bd4c861733ae4796548c0e8bb833a844b4c12b1caf75e692af895376995876a4f01a5bfa7b45b4df58a8f3fcd1cc41b1376c1e92f9441963b37187a5b98daab23bfd80e8b81e06097a869c5be6c14c7ffc0a120943124c34b759bbd4d9c2debf87e0a5d6f4f657339c6444bafbb6574ec0a8057f8ce07f05bb41f003f9f812ccd3c3cac531cea85dbe41ed1a10ab621d85460399c44cc1800848a1183a974eac1df782c16de06e797106b6bd277b3afa6c0b259b985d4497ac0e105065bcff028e4cc3302be01451beb23f40a2f6ecc88cd311ab1efa5cbcc8957e43dfa315ec7f57a1dd653f6f50d4d2db936db013e47e170851e57cab14c047506d1d16f1f80d8c5aeff7d5286df4504a5fe1d301d61753';
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
              }}
            >
              Github
            </b>
          </div>
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
                {click && !click2 ? (
                  'This wallet is in the top 30% best rated NFT borrowers'
                ) : (
                  <>{click2 ? <input type="text" value="Enter wallet address"></input> : ''}</>
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
              onClick={calculateProof}
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
              onClick={verifyInputProof}
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

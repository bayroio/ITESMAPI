import { Request, Response, Router } from "express";
const { ERC725 } = require("@erc725/erc725.js");
import { RPC_ENDPOINT_L16, IPFS_GATEWAY, RPC_GANACHE } from "./constants";
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';

import Web3 from "web3";
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import type { AbiItem } from 'web3-utils';

const router = Router();

// Parameters for ERC725 Instance
const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT_L16);
const config = { ipfsGateway: IPFS_GATEWAY };

async function fetchProfile(address: any) {
    try {

      const web3 = new Web3(RPC_GANACHE);

      //get key manager
      const myUP = new web3.eth.Contract(UniversalProfile.abi as unknown as AbiItem [], address);
      const owner = await myUP.methods.owner().call();
      const myKM = new web3.eth.Contract(KeyManager.abi as unknown as AbiItem [], owner);
      const myEOA = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY || "");
       
      console.log("---------------owner ----------");
      console.log(owner);
      console.log(myKM);

      
      //Update profile
      const schema = [
        {
            "name": "LSP5ReceivedAssets[]",
            "key": "0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b",
            "keyType": "Array",
            "valueType": "address",
            "valueContent": "Address"
        },
      ];
     
     const profile = new ERC725(erc725schema, address, provider, config);

     const encodedData = profile.encodeData({
        keyName: 'LSP5ReceivedAssets[]',
        value: [
            '0x265b9d1D4342100bDfC0e0De4fB538966eB28220'
        ],
      }, schema);

      const abiPayload = await myUP.methods[
        'setData(bytes32[],bytes[])'
      ](encodedData.keys, encodedData.values).encodeABI();

      await myKM.methods
            .execute(abiPayload)
            .send({ from: myEOA.address, gasLimit: 300_000 });

    } 
    catch (error) {
      console.log(error);

      return console.log('This is not an ERC725 Contract');
    }
  }
  
router.post('/', async (req: Request, res: Response) => {
    const profileData = await fetchProfile(process.env.UNIVERSALPROFILE);
    res.send("Complete");
})


export { router };
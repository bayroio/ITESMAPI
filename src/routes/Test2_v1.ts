import { Request, Response, Router } from "express";
const { ERC725 } = require("@erc725/erc725.js");
import { RPC_ENDPOINT_L16, IPFS_GATEWAY } from "./constants";
//import 'isomorphic-fetch';
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';

import Web3 from "web3";
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import type { AbiItem } from 'web3-utils';

//import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json';
//import { LSP0ERC725Account__factory } from "@lukso/lsp-factory.js";

const router = Router();

// Parameters for ERC725 Instance
const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT_L16);
const config = { ipfsGateway: IPFS_GATEWAY };

async function fetchProfile(address: any) {
    try {

      const web3 = new Web3('https://rpc.l16.lukso.network');
      // const from = '0xe30154746fcD92392e473c3ED83624817B579555';
      // const to = address;
      // const tokenid = '0xfB6E5efa50d4108125095767884D590a32c92152' 


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
          name: 'LSP3Profile',
          key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
          keyType: 'Singleton',
          valueContent: 'JSONURL',
          valueType: 'bytes',
        },
      ];
     
     const profile = new ERC725(erc725schema, address, provider, config);

    //  const encodedData = profile.encodeData({
    //     keyName: 'LSP3Profile',
    //     value: {
    //       hashFunction: 'keccak256(utf8)',
    //       hash: web3.utils.keccak256(JSON.stringify(uploadResult.json)),
    //       url: lsp3ProfileIPFSUrl,
    //     },
    //   }, schema);

      // const abiPayload = await myUP.methods[
      //   'setData(bytes32[],bytes[])'
      // ](encodedData.keys, encodedData.values).encodeABI();

      // await myKM.methods
      //       .execute(abiPayload)
      //       .send({ from: myEOA.address, gasLimit: 300_000 });
      



    } 
    catch (error) {
      console.log(error);

      return console.log('This is not an ERC725 Contract');
    }
  }
  
router.post('/', async (req: Request, res: Response) => {
    const profileData = await fetchProfile("0xa5Bd69589Dc8119F5A867360609B0a3719D02A88");
    //let result = JSON.parse(JSON.stringify(profileData));

  // console.log(result);
  //  console.log(result[1].value);

    // //General
    // console.log("Name: " + result[1].value.LSP3Profile.name);
    // console.log("Description: " + result[1].value.LSP3Profile.description);
    // console.log("Correo: " + result[1].value.LSP3Profile.correo);
    // console.log("Nombre: " + result[1].value.LSP3Profile.nombre);
    // console.log("Primer Apellido: " + result[1].value.LSP3Profile.primerapellido);
    // console.log("Segundo Apellido: " + result[1].value.LSP3Profile.segundoapellido);
    
    // //Image
    // console.log("Background image: " + IPFS_GATEWAY + "/" + result[1].value.LSP3Profile.backgroundImage[0].url);
    // console.log("Profile image: " + IPFS_GATEWAY + "/" + result[1].value.LSP3Profile.profileImage[0].url);

    res.send("Complete");
})


export { router };
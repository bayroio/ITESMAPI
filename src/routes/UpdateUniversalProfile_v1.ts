import { Request, Response, Router } from "express";
import { keccak_256 } from 'js-sha3';
import { LSPFactory } from "@lukso/lsp-factory.js";
import { RPC_GANACHE, PORT_GANACHE, RPC_ENDPOINT_L16, PORT_ENDPOINT_L16, IPFS_GATEWAY } from "./constants";
const { ERC725 } = require("@erc725/erc725.js");
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import type { AbiItem } from 'web3-utils';
import multer from 'multer';
import Web3 from "web3";
import * as IPFS from 'ipfs-core';
import "dotenv/config";


const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    // limits: { fileSize: 1000000000, files: 2 },
    fileFilter(req, file, cb) {
      cb(null, true);
    },
  });

declare global {
    var ipfs: any
}

router.post('/', upload.fields([{ name: 'profileimage', maxCount: 1 }, { name: 'backgroundimage', maxCount: 1 }]), async (req: Request, res: Response) => {    
    let endpoint = "";
    let port = 0;
    
    //Validate apikey
    let apikey = req.header(process.env.ApiKeyName || "");
    console.log(apikey);
    if (apikey != process.env.ApiKeyValue){
      return res.status(401).json({ msg: 'Authorization denied' });
    }

    //Get the files
    var files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //get the hash and url profile image
    var hashprofile = keccak_256(files.profileimage[0].buffer || "");
    const profiletemp = {
      path: `${files.profileimage[0].originalname}`,
      content: files.profileimage[0].buffer
    }
    const urlprofile = await globalThis.ipfs.add(profiletemp);

    //get the hash and url background image
    var hashbackground = keccak_256(files.backgroundimage[0].buffer || "");
    const backgroundtemp = {
      path: `${files.backgroundimage[0].originalname}`,
      content: files.backgroundimage[0].buffer
    }
    const urlbackground = await globalThis.ipfs.add(backgroundtemp);

    //Get the general info Private Key, Address, Endpoint and Port
    if (process.env.Endpoint == 'GANACHE') {
        endpoint = RPC_GANACHE;
        port = PORT_GANACHE;
    }
    else if (process.env.Endpoint == 'LUKSO_L16') {
        endpoint = RPC_ENDPOINT_L16;
        port = PORT_ENDPOINT_L16;
    }
    const web3 = new Web3(endpoint);
    const PrivateKey = process.env.PRIVATE_KEY || "";
    const address_universalprofile = req.body.address;
    const myEOA = web3.eth.accounts.wallet.add(PrivateKey);

    //Create the MetaData
    const myLSP3MetaData = 
    {
      "LSP3Profile": {
        "name": `${req.body.nombre} ${req.body.primerapellido} ${req.body.segundoapellido}`,
        "description": `${req.body.correo}`,
        "profileImage": [{
            "width": 500,
            "height": 500,
            "hashFunction": 'keccak256(bytes)',
            "hash": hashprofile, // bytes32 hex string of the image hash
            "url": urlprofile.cid.toString(),
        }],
        "backgroundImage": [{
            "width": 500,
            "height": 500,
            "hashFunction": 'keccak256(bytes)',
            "hash": hashbackground, // bytes32 hex string of the image hash
            "url": urlbackground.cid.toString(),            
        }]
      }
    };

    //Connect to endpoint
    const lspFactory = new LSPFactory(endpoint, {
      deployKey: PrivateKey, // Private key of the account which will deploy any smart contract,
      chainId: port,
    });

    //Upload JSON file to IPFS
    const uploadResult = await lspFactory.UniversalProfile.uploadProfileData(
      myLSP3MetaData.LSP3Profile
    );

    //Create the schema
    const schema = [
      { 
        "name": "LSP3Profile",
        "key": "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
        "keyType": "Singleton",
        "valueType": "bytes",
        "valueContent": "JSONURL"
      },
    ];

    //Set the variables
    const provider = new Web3.providers.HttpProvider(endpoint);
    const config = { ipfsGateway: IPFS_GATEWAY };
    const profile = new ERC725(schema, UniversalProfile, provider, config);
    
    //Encode the LSP3
    const encodedData = profile.encodeData({
      keyName: "LSP3Profile",
      value: {
        hashFunction: "keccak256(utf8)",
        // Hash our LSP3 metadata JSON file
        hash: web3.utils.keccak256(JSON.stringify(myLSP3MetaData)),
        url: uploadResult.url,
      },
    });

    //Get Key Manager
    const myUP = new web3.eth.Contract(UniversalProfile.abi as unknown as AbiItem [], address_universalprofile);
    const owner = await myUP.methods.owner().call();
    const myKM = new web3.eth.Contract(KeyManager.abi as unknown as AbiItem [], owner);
    //console.log("---------------owner ----------");
    //console.log(owner);
    //console.log(myKM);

    const abiPayload = await myUP.methods[
      'setData(bytes32[],bytes[])'
    ](encodedData.keys, encodedData.values).encodeABI();

    await myKM.methods
          .execute(abiPayload)
          .send({ from: myEOA.address, gasLimit: 300_000 });

    res.send("Update Complete")    
})


export { router };

import { Request, Response, Router } from "express";
import { keccak_256 } from 'js-sha3';
import { LSPFactory } from "@lukso/lsp-factory.js";
import { RPC_GANACHE, PORT_GANACHE, RPC_ENDPOINT_L16, PORT_ENDPOINT_L16, IPFS_GATEWAY } from "./constants";
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import type { AbiItem } from 'web3-utils';
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
const { ERC725 } = require("@erc725/erc725.js");
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

router.post('/', upload.fields([{ name: 'arrayfilenft', maxCount: 50 }]), async (req: Request, res: Response) => {
    let endpoint = "";
    let port = 0;

    //Validate apikey
    let apikey = req.header(process.env.ApiKeyName || "");
    console.log(apikey);
    if (apikey != process.env.ApiKeyValue){
        return res.status(401).json({ msg: 'Authorization denied' });
    }
    
    //get the files
    var files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //Get the hash and url of each file
    let hashfiles: string[] = [];
    let urlfiles: string[] = [];
    for(let i=0;i<files.arrayfilenft.length;i++){
        //Get the hash
        let hashfilenft = keccak_256(files.arrayfilenft[i].buffer || "");
        hashfiles.push(hashfilenft);

        //Get the url
        const filenfttemp = {
            path: `${files.arrayfilenft[i].originalname}`,
            content: files.arrayfilenft[i].buffer
        }
        const urlfilenft = await globalThis.ipfs.add(filenfttemp);
        urlfiles.push(urlfilenft);
    }
    
    //Get the general info Private Key, Address, Endpoint and Port
    const web3 = new Web3();
    const PrivateKey = process.env.PRIVATE_KEY || "";
    const UniversalProfile = req.body.address;
    const myEOA = web3.eth.accounts.wallet.add(PrivateKey);
    if (process.env.Endpoint == 'GANACHE') {
        endpoint = RPC_GANACHE;
        port = PORT_GANACHE;
    }
    else if (process.env.Endpoint == 'LUKSO_L16') {
        endpoint = RPC_ENDPOINT_L16;
        port = PORT_ENDPOINT_L16;
    }

    //Get the NFT info
    const result_GetNFTInfo = await GetNFTInfo(endpoint, IPFS_GATEWAY, UniversalProfile);
    if (result_GetNFTInfo[0] === 'Error'){
        res.send("Error getting profile data");
        return;
    }

    //Create the NFT
    const result_CreateNFT = await CreateNFT(endpoint, port, PrivateKey, myEOA.address, hashfiles, urlfiles, urlfilenft, req.body.name || "", req.body.description || "");
    if (result_CreateNFT[0] === 'Error'){
        res.send("Error creating NFT, please try again later");
        return;
    }
    
    //Add New NFT info
    result_GetNFTInfo[1].push(result_CreateNFT[1]);

    //Update Universal Profile
    const result_UpdateProfile = await UpdateProfile(IPFS_GATEWAY, endpoint, myEOA.address, UniversalProfile, result_GetNFTInfo[1]);
    if (result_CreateNFT[0] === 'Error'){
        res.send("Error updating profile");
        return;
    }

    res.send(result_CreateNFT[1])
})

async function GetNFTInfo(endpoint: string, ipfs: string, UniversalProfile: string): Promise<[string, string[]]>{
    try{
        // Parameters for ERC725 Instance
        const provider = new Web3.providers.HttpProvider(endpoint);
        const config = { ipfsGateway: ipfs };
    
        const profile = new ERC725(erc725schema, UniversalProfile, provider, config);
        const result = JSON.parse(JSON.stringify(await profile.fetchData("LSP12IssuedAssets[]")));
        //console.log(result);
    

        return ["", result.value];
    }
    catch(e){
        console.log(e);
        return ["Error", []];
    }
}

async function CreateNFT(endpoint: string, port: number, PrivateKey: string, address: string, hashfilenft: string[], urlfilenft: any[], namenft: string, descriptionnft: string): Promise<[string, string]> {
    try{
        let address_nft = "";
        let assetaux: any[] = [];

        //Connect to endpoint
        const lspFactory = new LSPFactory(endpoint, {
            deployKey: PrivateKey, 
            chainId: port,
        });
        

        //Create the LSP4 Digital Asset Metadata
        for(let i=0; i<hashfilenft.length; i++) {
            let asset: any = {
                hashFunction: 'keccak256(bytes)',
                hash: hashfilenft[i],            
                url: urlfilenft[i].cid.toString(),
                fileType: ""
            };
            assetaux.push(asset);
            console.log(asset);
        }

        console.log(assetaux);
        
        //Create the nft
        lspFactory.LSP4DigitalAssetMetadata;
        const deploymentEventsLSP8NFT2 = [];
        const myLSP8NFT2 = await lspFactory.LSP8IdentifiableDigitalAsset.deploy({
            controllerAddress: address,
            name: namenft,
            symbol: 'NFT',

            digitalAssetMetadata: {
                LSP4Metadata: {
                    description: descriptionnft,
                    assets: assetaux
                },
            }
        },
        {
            onDeployEvents: {
                next: (deploymentEvent) => {
                    //console.log(deploymentEvent);
                    deploymentEventsLSP8NFT2.push(deploymentEvent);
                },
                error: (error) => {
                    console.error(error);
                    return ["Error",""];
                },
                complete: (nft) => {
                    //console.log('LSP8 NFT 2.0 deployment completed');
                    //console.log("NFT 2.0 Address", nft.LSP8IdentifiableDigitalAsset.address);
                    //console.log("NFT 2.0 Receipt", nft.LSP8IdentifiableDigitalAsset.receipt);
                    //console.log(nft);
                    //console.log("---------------------- Done! ----------------------------");
                    address_nft = nft.LSP8IdentifiableDigitalAsset.address;
                },
            }
        });

        if (address_nft.toString() === ""){
            return ["Error", ""];    
        }

        return ["", address_nft];
    }
    catch(e){
        console.log(e);
        return ["Error",""];
    }
}

async function UpdateProfile(ipfs: string, endpoint: string, address: string, address_universalprofile: string, NFT_array: string[]): Promise<string> {
    try {
        //Set the variables
        const provider = new Web3.providers.HttpProvider(endpoint);
        const config = { ipfsGateway: ipfs };
        const web3 = new Web3(endpoint);

        //Get Key Manager
        const myUP = new web3.eth.Contract(UniversalProfile.abi as unknown as AbiItem [], address_universalprofile);
        const owner = await myUP.methods.owner().call();
        const myKM = new web3.eth.Contract(KeyManager.abi as unknown as AbiItem [], owner);
        //console.log("---------------owner ----------");
        //console.log(owner);
        //console.log(myKM);
      
        //Set the schema
        const schema = [
            {
                "name": "LSP12IssuedAssets[]",
                "key": "0x7c8c3416d6cda87cd42c71ea1843df28ac4850354f988d55ee2eaa47b6dc05cd",
                "keyType": "Array",
                "valueType": "address",
                "valueContent": "Address"
            }
        ];
     
        //Get the profile
        const profile = new ERC725(erc725schema, address_universalprofile, provider, config);

        //Update profile in LSP5ReceivedAssets
        const encodedData = profile.encodeData({
            keyName: 'LSP12IssuedAssets[]',
            value: NFT_array,
        }, schema);

        const abiPayload = await myUP.methods[
            'setData(bytes32[],bytes[])'
        ](encodedData.keys, encodedData.values).encodeABI();

        await myKM.methods
              .execute(abiPayload)
              .send({ from: address, gasLimit: 300_000 });

        return "";
    } 
    catch (e) {
        console.log(e);
        return "Error";
    }
}

export { router };
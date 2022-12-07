import { Request, Response, Router } from "express";
import { keccak_256 } from 'js-sha3';
import { LSPFactory } from "@lukso/lsp-factory.js";
import { RPC_GANACHE } from "./constants";
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

router.post('/', upload.fields([{ name: 'filenft', maxCount: 1 }]), async (req: Request, res: Response) => {

    //get the files
    var files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //get the hash and url file
    var hashfilenft = keccak_256(files.filenft[0].buffer || "");
    const filenfttemp = {
      path: `${files.filenft[0].originalname}`,
      content: files.filenft[0].buffer
    }
    const urlfilenft = await globalThis.ipfs.add(filenfttemp);
    console.log(hashfilenft);
    console.log(urlfilenft);

    //Get the Address
    const web3 = new Web3();
    const myEOA = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY || "");

    //Connect to ganache
    const lspFactory = new LSPFactory(RPC_GANACHE, {
        deployKey: process.env.PRIVATE_KEY, // Private key of the account which will deploy any smart contract,
        chainId: 5777,
    });
    

    //Create the nft
    lspFactory.LSP4DigitalAssetMetadata
    const deploymentEventsLSP8NFT2 = [];
    const myLSP8NFT2 = await lspFactory.LSP8IdentifiableDigitalAsset.deploy({
        controllerAddress: myEOA.address,
        name: 'MY Token',
        symbol: 'Test',
        digitalAssetMetadata: {
            description: 'My NFT',
            hashFunction: 'keccak256(bytes)',
            hash: hashfilenft,            
            url: urlfilenft.cid.toString(),
        }
    },
    {
        onDeployEvents: {
            next: (deploymentEvent) => {
                console.log(deploymentEvent);
                deploymentEventsLSP8NFT2.push(deploymentEvent);
            },
            error: (error) => {
                console.error(error);
            },
            complete: (nft) => {
                console.log('LSP8 NFT 2.0 deployment completed');
                console.log("NFT 2.0 Address", nft.LSP8IdentifiableDigitalAsset.address);
                console.log("NFT 2.0 Receipt", nft.LSP8IdentifiableDigitalAsset.receipt);
                console.log(nft);
                console.log("---------------------- Done! ----------------------------");

                res.send(`LSP8 NFT 2.0 deployment completed`)

            },
        }
    });
})


export { router };
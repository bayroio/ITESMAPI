import { Request, Response, Router } from "express";
import multer from 'multer';
import Web3 from "web3";
import * as IPFS from 'ipfs-core';
import "dotenv/config";
import { keccak_256 } from 'js-sha3';
import { LSPFactory } from "@lukso/lsp-factory.js";
import { RPC_ENDPOINT_L14, RPC_ENDPOINT_L16, RPC_ENDPOINT_MUMBAI, RPC_ENDPOINT_GOERLI, RPC_GANACHE } from "./constants";

const upload = multer({
    storage: multer.memoryStorage(),
//    limits: { fileSize: 1000000000, files: 2 },
    fileFilter(req, file, cb) {
      cb(null, true);
    },
  });

const router = Router();

declare global {
    var ipfs: any
}

async function initGlobalIPFS() {
    globalThis.ipfs = await IPFS.create()
};
initGlobalIPFS()






router.post('/', upload.fields([{ name: 'profileimage', maxCount: 1 }, { name: 'backgroundimage', maxCount: 1 }]), async (req: Request, res: Response) => {
    // console.log(req.body.correo);
    // console.log(req.body.nombre);
    // console.log(req.body.primerapellido);
    // console.log(req.body.segundoapellido);
    
    //get the files
    var files = req.files as { [fieldname: string]: Express.Multer.File[] };

    //get the hash and url profile image
    var hashprofile = keccak_256(files.profileimage[0].buffer || "");
    const profiletemp = {
      path: `${files.profileimage[0].originalname}`,
      content: files.profileimage[0].buffer
    }
    const urlprofile = await globalThis.ipfs.add(profiletemp);
    //console.log(hashprofile);
    //console.log(urlprofile);

    //get the hash and url background image
    var hashbackground = keccak_256(files.backgroundimage[0].buffer || "");
    const backgroundtemp = {
      path: `${files.backgroundimage[0].originalname}`,
      content: files.backgroundimage[0].buffer
    }
    const urlbackground = await globalThis.ipfs.add(backgroundtemp);
    //console.log(hashbackground);
    //console.log(urlbackground);

    //Create the Address
    const web3 = new Web3();
    const myEOA = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY || "");

    //Connect to ganache
    const lspFactory = new LSPFactory(RPC_GANACHE, {
        deployKey: process.env.PRIVATE_KEY, // Private key of the account which will deploy any smart contract,
        chainId: 5777,
    });
 
    //Create the MetaData
    const myLSP3MetaData = {
        name: "Test",
        description: "Personal Data",
        correo: req.body.correo,
        nombre: req.body.nombre,
        primerapellido: req.body.primerapellido,
        segundoapellido: req.body.segundoapellido,
        profileImage: [{
            width: 500,
            height: 500,
            hashFunction: 'keccak256(bytes)',
            hash: hashprofile, // bytes32 hex string of the image hash
            url: urlprofile.cid.toString(),
        }],
        backgroundImage: [{
            width: 500,
            height: 500,
            hashFunction: 'keccak256(bytes)',
            hash: hashbackground, // bytes32 hex string of the image hash
            url: urlbackground.cid.toString(),            
        }]
    };


    //Create the smart contract
    const profileDeploymentEvents = [];
    const address = process.env.ADDRESS || "";
    const myContracts = await lspFactory.UniversalProfile.deploy({
        controllerAddresses: [myEOA.address], // Account addresses which will control the UP
        lsp3Profile: myLSP3MetaData,
    },
    {
        onDeployEvents: {
           next: (deploymentEvent) => {
                console.log(deploymentEvent);
                profileDeploymentEvents.push(deploymentEvent);
            },
            error: (error) => {
                console.error(error);
                res.send("Error");
            },
            complete: (contracts) => {
                console.log('Universal Profile deployment completed');
                console.log("Mi UP Address", contracts.LSP0ERC725Account?.address);
                console.log(contracts);
                console.log("-----------------------------------------------");
                res.send(`Mi UP Address ${contracts.LSP0ERC725Account?.address}`)
            },
        }
    });

    //res.send("hola");
})


export { router };
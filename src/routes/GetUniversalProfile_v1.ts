import { Request, Response, Router } from "express";
import { ERC725 } from '@erc725/erc725.js';
import { IPFS_GATEWAY } from "./constants";
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import Web3 from "web3";
import multer from 'multer';


const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    cb(null, true);
  },
});

router.post('/', upload.fields([]), async (req: Request, res: Response) => {
  try {

    //Validate apikey
    let apikey = req.header(process.env.ApiKeyName || "");
    if (apikey != process.env.ApiKeyValue){
      return res.status(401).json({ msg: 'Authorization denied' });
    }

    //Get the general info 
    const UniversalProfile = req.body.address;
    let endpoint = process.env.RPC_ENDPOINT || "";
    let port: number = (process.env.RPC_PORT !== null && process.env.RPC_PORT !== undefined) ? Number(process.env.RPC_PORT) : 0;


    // Parameters for ERC725 Instance
    const provider = new Web3.providers.HttpProvider(endpoint);
    const config = { ipfsGateway: IPFS_GATEWAY };
    

    const profile = new ERC725(erc725schema, UniversalProfile, provider, config);
    const result = JSON.parse(JSON.stringify(await profile.fetchData()));
    console.log(result);
    res.send(result);

    // let result = JSON.parse(JSON.stringify(profileData));

    // console.log(result);
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
  } 
  catch (error) {
    console.log('This is not an ERC725 Contract');
    res.send('This is not an ERC725 Contract');
  }
})


export { router };
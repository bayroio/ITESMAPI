import { Request, Response, Router } from "express";
import { ERC725 } from '@erc725/erc725.js';
import { RPC_GANACHE, PORT_GANACHE, RPC_ENDPOINT_L16, PORT_ENDPOINT_L16, IPFS_GATEWAY } from "./constants";
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import Web3 from "web3";


const router = Router();


router.post('/', async (req: Request, res: Response) => {
  try {
    let endpoint = "";
    let port = 0;


    //Validate apikey
    let apikey = req.header(process.env.ApiKeyName || "");
    console.log(apikey);
    if (apikey != process.env.ApiKeyValue){
      return res.status(401).json({ msg: 'Authorization denied' });
    }


    //Get the general info 
    const UniversalProfile = process.env.UNIVERSALPROFILE || "";
    if (process.env.Endpoint == 'GANACHE') {
      endpoint = RPC_GANACHE;
      port = PORT_GANACHE;
    }
    else if (process.env.Endpoint == 'LUKSO_L16') {
      endpoint = RPC_ENDPOINT_L16;
      port = PORT_ENDPOINT_L16;
    }

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
    return console.log('This is not an ERC725 Contract');
  }
})


export { router };
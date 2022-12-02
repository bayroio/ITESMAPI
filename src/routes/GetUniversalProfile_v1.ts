import { Request, Response, Router } from "express";
import { ERC725 } from '@erc725/erc725.js';
import { RPC_GANACHE, IPFS_GATEWAY } from "./constants";
import 'isomorphic-fetch';
import erc725schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json';
import Web3 from "web3";
const router = Router();

// Parameters for ERC725 Instance
const provider = new Web3.providers.HttpProvider(RPC_GANACHE);
const config = { ipfsGateway: IPFS_GATEWAY };

async function fetchProfile(address: any) {
    try {
      const profile = new ERC725(erc725schema, address, provider, config);
      return await profile.fetchData();
    } catch (error) {
      return console.log('This is not an ERC725 Contract');
    }
  }
  
router.post('/', async (req: Request, res: Response) => {
    const profileData = await fetchProfile(process.env.ADDRESS);
    let result = JSON.parse(JSON.stringify(profileData));

    //General
    console.log("Name: " + result[1].value.LSP3Profile.name);
    console.log("Description: " + result[1].value.LSP3Profile.description);
    console.log("Correo: " + result[1].value.LSP3Profile.correo);
    console.log("Nombre: " + result[1].value.LSP3Profile.nombre);
    console.log("Primer Apellido: " + result[1].value.LSP3Profile.primerapellido);
    console.log("Segundo Apellido: " + result[1].value.LSP3Profile.segundoapellido);
    
    //Image
    console.log("Background image: " + IPFS_GATEWAY + "/" + result[1].value.LSP3Profile.backgroundImage[0].url);
    console.log("Profile image: " + IPFS_GATEWAY + "/" + result[1].value.LSP3Profile.profileImage[0].url);

    res.send("Complete");
})


export { router };
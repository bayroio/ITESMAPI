import { Request, Response, Router } from "express";
import Web3 from "web3";
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json';
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json';
import { RPC_GANACHE, RPC_ENDPOINT_L16 } from "./constants";
import type { AbiItem } from 'web3-utils';

const router = Router();

async function fetchProfile(address: any) {

    //Get the endpoint info
    let endpoint = "";
    if (process.env.Endpoint == 'GANACHE') {
        endpoint = RPC_GANACHE;
    }
    else if (process.env.Endpoint == 'LUKSO_L16') {
        endpoint = RPC_ENDPOINT_L16;
    }
  
    const web3 = new Web3(endpoint);

    //get key manager
    try {        
      const myUP = new web3.eth.Contract(UniversalProfile.abi as unknown as AbiItem [], address);
      const owner = await myUP.methods.owner().call();
      const myKM = new web3.eth.Contract(KeyManager.abi as unknown as AbiItem [], owner);
       
      console.log("--------------- owner ----------");
      console.log(owner);
      console.log("--------------- key manager  ----------")
      console.log(myKM);
    } 
    catch (error) {
      console.log(error);

      return console.log('This is not an ERC725 Contract');
    }
  }
  
router.post('/', async (req: Request, res: Response) => {
    
  //Validate apikey
    let apikey = req.header(process.env.ApiKeyName || "");
    console.log(apikey);
    if (apikey != process.env.ApiKeyValue){
      return res.status(401).json({ msg: 'Authorization denied' });
    }

    await fetchProfile(process.env.UNIVERSALPROFILE);
    res.send("Complete");
})


export { router };
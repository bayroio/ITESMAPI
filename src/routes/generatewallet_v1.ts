import { Request, Response, Router } from "express";
import Web3 from "web3";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const web3 = new Web3();
    const myEOA = web3.eth.accounts.create();
    console.log(myEOA);
    
    console.log("Add funds to:", myEOA.address);
    console.log("Faucet: https://faucet.l16.lukso.network/");
    
    console.log("Add the private key to the .env file.");
    console.log(`Check founds: https://explorer.execution.l16.lukso.network/tx/${myEOA.address}/internal-transactions`);
    res.send(`Check founds: https://explorer.execution.l16.lukso.network/tx/${myEOA.address}/internal-transactions`);
})

export { router };
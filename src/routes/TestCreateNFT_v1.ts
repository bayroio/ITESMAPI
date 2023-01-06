import { Request, Response, Router } from "express";
import Web3 from "web3";
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json';
import type { AbiItem } from 'web3-utils';


const router = Router();

router.post('/', async (req: Request, res: Response) => {

    //Get the Address
    const web3 = new Web3();
    const myEOA = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY || "");
    
    const myToken = new web3.eth.Contract(LSP7Mintable.abi as unknown as AbiItem [], 
        myEOA.address,
        {
            gas: 5_000_000,
            gasPrice: '1000000000',
        });

//    console.log(myToken);

    // const a = await myToken
    //     .deploy({
    //     data: LSP7Mintable.bytecode,
    //     arguments: [
    //         'My LSP7 Token', // token name
    //         'LSP7', // token symbol
    //         myEOA.address, // new owner, who will mint later
    //         false, // isNonDivisible = TRUE, means NOT divisible, decimals = 0)
    //     ]
    //     })
    //     .send({
    //     from: myEOA.address,
    //     });

    await myToken.methods.mint('0xD324eEf7c93f3E782413C489eDc45F6bC48A0AE7', 0, false, '0x').send({
        from: myEOA.address,
    });

})


export { router };
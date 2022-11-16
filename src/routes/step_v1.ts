import { Request, Response, Router } from "express";
import Web3 from "web3";
import "dotenv/config";
import { LSPFactory } from "@lukso/lsp-factory.js";
import { RPC_ENDPOINT_L14, RPC_ENDPOINT_L16, RPC_ENDPOINT_MUMBAI, RPC_ENDPOINT_GOERLI, RPC_GANACHE } from "./constants";


const router = Router();

router.post('/', async (req: Request, res: Response) => {

    //Create the Address
    const web3 = new Web3();
    //const myEOA = web3.eth.accounts.create();

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
        segundoapellido: req.body.segundoapellido
    };


    //Create the smart contract
    const profileDeploymentEvents = [];
    const address = process.env.ADDRESS || "";
    const myContracts = await lspFactory.UniversalProfile.deploy({
        controllerAddresses: [process.env.Address || ""], // Account addresses which will control the UP
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

    res.send("Done");
})

export { router };